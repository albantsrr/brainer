'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { UserResponse } from '@/lib/types';

const TOKEN_KEY = 'brainer_token';

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  setToken: (token: string) => void;
  setUser: (user: UserResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    setState((prev) => ({ ...prev, token: stored, isLoading: false }));
  }, []);

  function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    setState((prev) => ({ ...prev, token }));
  }

  function setUser(user: UserResponse) {
    setState((prev) => ({ ...prev, user }));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setState({ token: null, user: null, isLoading: false });
  }

  return (
    <AuthContext.Provider value={{ ...state, setToken, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
