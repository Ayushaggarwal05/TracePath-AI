import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/user';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenStatus: 'VALID' | 'EXPIRED' | 'REVOKED';
  isTokenExpired: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, fullName?: string) => Promise<User>;
  connectGitHub: (token?: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHED_USER_KEY = 'tracepath_cached_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(CACHED_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !localStorage.getItem(CACHED_USER_KEY);
  });
  const [error, setError] = useState<string | null>(null);

  const tokenStatus =
    user?.token_status ||
    user?.github_connections?.[0]?.token_status ||
    'VALID';
  const isTokenExpired = user?.github_connected ? tokenStatus !== 'VALID' : false;

  const saveUserState = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(CACHED_USER_KEY);
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      setError(null);
      const res = await authService.getMe();
      if (res && res.user) {
        saveUserState(res.user);
      } else {
        saveUserState(null);
      }
    } catch {
      // If server session expired or invalid, clear cached state
      saveUserState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth session on initial load (background revalidation)
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);
      saveUserState(res.user);
      return res.user;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName?: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.signup(email, password, fullName);
      saveUserState(res.user);
      return res.user;
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const connectGitHub = async (token?: string, username?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.connectGitHub(token, username);
      saveUserState(res.user);
    } catch (err: any) {
      setError(err.message || 'Connecting GitHub failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      localStorage.removeItem('tracepath_github_user');
      saveUserState(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        tokenStatus,
        isTokenExpired,
        login,
        signup,
        connectGitHub,
        logout,
        refreshUser,
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
