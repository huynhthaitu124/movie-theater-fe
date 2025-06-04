import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  role: string;
  fullName: string;
  email: string;
  dateOfBirth?: string;
  sex?: string;
  identityCard?: string;
  phoneNumber?: string;
  address?: string;
}

export interface AuthContextType {
  currentUser: { name: string; role: string } | null;
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
const MOCK_USERS = [
  {
    id: '1',
    fullName: 'Admin User',
    email: 'admin@cinema.com',
    password: 'admin123',
    role: 'admin' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    fullName: 'Staff User',
    email: 'staff@cinema.com',
    password: 'staff123',
    role: 'staff' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    fullName: 'Regular User',
    email: 'user@cinema.com',
    password: 'user123',
    role: 'user' as const,
    createdAt: new Date().toISOString(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('cinema_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = MOCK_USERS.find(user => 
        user.email === email && user.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // Remove password before saving user
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('cinema_user', JSON.stringify(userWithoutPassword));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('cinema_user');
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
      
      const existingUser = MOCK_USERS.find(user => user.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      const newUser = {
        id: String(MOCK_USERS.length + 1),
        fullName: name,
        email,
        password,
        role: 'user' as const,
        createdAt: new Date().toISOString(),
      };
      
      // Remove password before saving user
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('cinema_user', JSON.stringify(userWithoutPassword));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser: user ? { name: user.fullName, role: user.role } : null,
        isAuthenticated: !!user,
        user,
        isLoading,
        login,
        logout,
        register,
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