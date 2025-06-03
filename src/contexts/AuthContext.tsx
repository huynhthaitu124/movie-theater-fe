import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@cinema.com',
    password: 'admin123',
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Staff User',
    email: 'staff@cinema.com',
    password: 'staff123',
    role: 'staff' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Regular User',
    email: 'user@cinema.com',
    password: 'user123',
    role: 'user' as const,
    createdAt: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('cinema_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = MOCK_USERS.find(user => 
        user.email === email && user.password === password
      );
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Remove password before saving user
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('cinema_user', JSON.stringify(userWithoutPassword));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      if (MOCK_USERS.some(user => user.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // In a real app, we would make an API call to register the user
      const newUser: User = {
        id: `${MOCK_USERS.length + 1}`,
        name,
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      
      setCurrentUser(newUser);
      localStorage.setItem('cinema_user', JSON.stringify(newUser));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cinema_user');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
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