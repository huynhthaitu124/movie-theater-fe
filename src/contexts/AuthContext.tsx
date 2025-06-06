import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TokenService from '../services/modules/token.service';
import AuthService from '../services/modules/auth.service';
import { User } from '../types/user';
import { UserRole } from '../types/role';
import { jwtDecode } from "jwt-decode";

export interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = async () => {
            if (TokenService.isLoggedIn()) {
                try {
                    // Get current user info
                    // const user = await AuthService.getCurrentUser();
                    // setCurrentUser(user);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error fetching user:', error);
                    // If there's an error, clear tokens and force re-login
                    TokenService.clearTokens();
                    setIsAuthenticated(false);
                    navigate('/login');
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, [navigate]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const authResponse = await AuthService.login({ 
                keyword: email,
                password 
            });
            console.log('Login response:', authResponse);
            console.log('User data:', authResponse.data);
            TokenService.setToken(authResponse.data);
            const tokenPayload: any = jwtDecode(authResponse.data);

            console.log('Decoded token payload:', tokenPayload);
            
            // Ensure role is in correct format (Title Case)
            const normalizeRole = (role: string): UserRole => {
                const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
                if (normalizedRole === 'Admin' || normalizedRole === 'Staff' || normalizedRole === 'Member') {
                    return normalizedRole as UserRole;
                }
                return 'Member';
            };

            // Map token payload to User object
            const user: User = {
                id: tokenPayload.sub,
                email: tokenPayload.email,
                displayName: tokenPayload.name,
                role: normalizeRole(tokenPayload.role || ''),
                emailVerified: tokenPayload.EmailVerified || false,
            };

            console.log('Mapped user object:', user);
            
            setCurrentUser(user);
            setIsAuthenticated(true);
            navigate('/');
        } catch (error: any) {
            console.error('Login error:', error);
            // Clear any existing tokens on error
            TokenService.clearTokens();
            throw new Error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            // Call logout API
            await AuthService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local state regardless of API call result
            TokenService.clearTokens();
            setCurrentUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            navigate('/login');
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            // Register new user
            const authResponse = await AuthService.register({
                displayname: name,
                username: email, // Using email as username
                email,
                password,
                roleid: '2', // Default role for regular users
                phonenumber: '',
                address: '',
                dateofbirth: new Date().toISOString(),
                identityCard: ''
            });
            
            // Save tokens
            TokenService.setToken(authResponse.data);
            if ('refreshToken' in authResponse) {
                TokenService.setRefreshToken((authResponse as any).refreshToken);
            }

            // Update state
            // setCurrentUser(authResponse.data);
            setIsAuthenticated(true);
            
            // Navigate to home page after successful registration
            navigate('/');
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        currentUser,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};