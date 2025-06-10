import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TokenService from '../services/modules/token.service';
import AuthService from '../services/modules/auth.service';
import { User } from '../types/user';
import { UserRole } from '../types/role';
import { jwtDecode } from "jwt-decode";
import { LoginGoogle } from '@/services/types/request.types';
import Login from '@/pages/auth/Login';

// Hàm helper để lưu user vào localStorage
const saveUserToLocalStorage = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
};

// Hàm helper để lấy user từ localStorage
const getUserFromLocalStorage = (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};

export interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    loginWithGoogle: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => getUserFromLocalStorage());
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!getUserFromLocalStorage());
    const navigate = useNavigate();

    useEffect(() => {
        const initializeAuth = async () => {
            const savedUser = getUserFromLocalStorage();
            // if (TokenService.isLoggedIn() && savedUser) {
            if (savedUser) {
                try {
                    setCurrentUser(savedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error fetching user:', error);
                    TokenService.clearTokens();
                    localStorage.removeItem('user');
                    setCurrentUser(null);
                    setIsAuthenticated(false);
                    navigate('/login');
                }
            } else {
                TokenService.clearTokens();
                localStorage.removeItem('user');
                setCurrentUser(null);
                setIsAuthenticated(false);
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
                accountid: tokenPayload.sub,
                email: tokenPayload.email,
                displayname: tokenPayload.name,
                role: normalizeRole(tokenPayload.role || ''),
                isactive: tokenPayload.EmailVerified || false,
            };

            console.log('Mapped user object:', user);
            
            // Lưu user vào localStorage
            saveUserToLocalStorage(user);
            setCurrentUser(user);
            setIsAuthenticated(true);
            navigate('/');
        } catch (error: any) {
            console.error('Login error:', error);
            // Clear any existing tokens on error
            TokenService.clearTokens();
            localStorage.removeItem('user');
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
            // Clear tokens and user data
            TokenService.clearTokens();
            localStorage.removeItem('user');
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

    const loginWithGoogle = async (credential: string) => {
        setIsLoading(true);
        try {
            // TODO: Replace with your actual API endpoint for Google authentication
            const userInfo = await AuthService.loginWithGoogle(credential);
            
            console.log('Google login response:', userInfo);

            const user: User = {
                email: userInfo.email,
                displayname: userInfo.name,
                role: 'Member', // Default role for Google users
            };

            saveUserToLocalStorage(user);
            setCurrentUser(user);
            setIsAuthenticated(true);
            navigate('/');
        } catch (error: any) {
            console.error('Google login error:', error);
            TokenService.clearTokens();
            localStorage.removeItem('user');
            throw new Error(error.response?.data?.message || 'Google login failed');
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
        register,
        loginWithGoogle
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