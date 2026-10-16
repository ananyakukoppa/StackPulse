import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('stackpulse_token'));
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('stackpulse_token');
      if (storedToken) {
        try {
          const userData = await apiService.getMe();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.warn('[Auth] Session token invalid or expired, clearing session');
          localStorage.removeItem('stackpulse_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const { user: userData, token: jwtToken } = await apiService.login({ email, password });
    localStorage.setItem('stackpulse_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  const register = async (email: string, password: string, name?: string): Promise<void> => {
    const { user: userData, token: jwtToken } = await apiService.register({ email, password, name });
    localStorage.setItem('stackpulse_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = (): void => {
    localStorage.removeItem('stackpulse_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
