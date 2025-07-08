import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TokenService from '../services/modules/token.service';
import AuthService from '../services/modules/auth.service';
import { userService } from '@/services/modules/user.service';
import { User } from '../types/user';
import { UserRole } from '../types/role';
import { jwtDecode } from "jwt-decode";
import { LoginGoogle, SendOtpRequest } from '@/services/types/request.types';
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
    setCurrentUser: (user: User | null) => void;
    updateCurrentUser?: (user: User | null) => void; // Add this line
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    loginWithGoogle: (token: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

            // After login and token decode
            const accountsRes = await userService.getAll(); // Call /api/Account
            const accounts = accountsRes.data; // Adjust based on your API response structure

            // Find the current user by email or accountId
            const matchedAccount = accounts.find(
            (acc: any) => acc.email === tokenPayload.email
            // or: (acc: any) => acc.accountId === tokenPayload.sub
            );

            console.log('Matched account:', matchedAccount);


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
                displayname: matchedAccount ? matchedAccount.displayName : tokenPayload.name,
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
            if (!userInfo || !userInfo.email) {
                throw new Error('Invalid Google login response');
            }

            const checkRequest : SendOtpRequest = {
                email: userInfo.email,
            };

            const checkedUserInfo = await AuthService.checkEmailExist(checkRequest);

            console.log('Checked user info:', checkedUserInfo.data);

            if (checkedUserInfo.data == false) {
                navigate('/complete-register', { state: { email: userInfo.email } });
                return;
            }

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

    const updateCurrentUser = (user: User) => {
        setCurrentUser(user);
        saveUserToLocalStorage(user);
    };

    const value = {
        currentUser,
        setCurrentUser,
        updateCurrentUser,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        loginWithGoogle
    };

    
    return (
        <AuthContext.Provider value={value}>
            {isLoading ? <Login /> : children}
            
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};