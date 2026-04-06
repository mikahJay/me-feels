import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface AuthUser {
  sub: string;
  email: string;
  name: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await apiClient.get<{ user: AuthUser }>('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Handle token from OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    const authError = params.get('auth_error');

    if (token) {
      localStorage.setItem('access_token', token);
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (authError) {
      console.error('Auth error:', authError);
      window.history.replaceState({}, '', window.location.pathname);
    }

    fetchMe();
  }, [fetchMe]);

  const login = useCallback(() => {
    const serviceUrl = import.meta.env.VITE_SERVICE_URL ?? '/api';
    window.location.href = `${serviceUrl}/auth/google`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
