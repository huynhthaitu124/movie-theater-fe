import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TokenService from '../services/modules/token.service';
import AuthService from '../services/modules/auth.service';
import { User } from '../types/user';

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
                    const user = await AuthService.getCurrentUser();
                    setCurrentUser(user);
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
            // Login with credentials
            const authResponse = await AuthService.login({ email, password });
            
            // Save tokens
            TokenService.setToken(authResponse.token);
            if ('refreshToken' in authResponse) {
                TokenService.setRefreshToken((authResponse as any).refreshToken);
            }

            // Update state
            setCurrentUser(authResponse.user);
            setIsAuthenticated(true);
            
            // Navigate to home or previous page
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
            TokenService.setToken(authResponse.token);
            if ('refreshToken' in authResponse) {
                TokenService.setRefreshToken((authResponse as any).refreshToken);
            }

            // Update state
            setCurrentUser(authResponse.user);
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