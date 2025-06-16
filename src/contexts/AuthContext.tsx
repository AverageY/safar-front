import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserDto, RegisterDto } from '../types/UserDto';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: UserDto | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterDto) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Making login API call...');
      const response = await authApi.login({ username, password });
      console.log('Full login response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      
      if (response.success && response.data) {
        console.log('Setting user data:', response.data);
        setUser(response.data);
        return true;
      }
      console.log('Login failed - no success or data in response');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterDto): Promise<boolean> => {
    try {
      console.log('Making register API call...');
      const response = await authApi.register(userData);
      console.log('Full register response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      
      if (response.success && response.data) {
        console.log('Setting user data:', response.data);
        setUser(response.data);
        return true;
      }
      console.log('Register failed - no success or data in response');
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user state on client side regardless of server response
      setUser(null);
    }
  };

  const fetchMe = async (): Promise<void> => {
    try {
      const response = await authApi.getCurrentUser();
      console.log('fetchMe response:', response);
      console.log('fetchMe response.success:', response.success);
      console.log('fetchMe response.data:', response.data);
      
      if (response.success && response.data) {
        console.log('Setting user data in fetchMe:', response.data);
        setUser(response.data);
      } else {
        console.log('fetchMe failed - no success or data');
        setUser(null);
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    register,
    logout,
    fetchMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
