
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';

interface AuthContextType {
  admin: AdminUser | null;
  login: (user: AdminUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('admin');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed.token !== 'string' || parsed.token.trim().length === 0) {
        localStorage.removeItem('admin');
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem('admin');
      return null;
    }
  });

  const login = (user: AdminUser) => {
    if (!user || typeof user.token !== 'string' || user.token.trim().length === 0) return;
    setAdmin(user);
    localStorage.setItem('admin', JSON.stringify(user));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
