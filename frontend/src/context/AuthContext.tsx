import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserResponse } from '../types/auth';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  login: (token: string, user: UserResponse) => void;
  logout: () => void;
  switchRole: () => void;
  updateUser: (updated: Partial<UserResponse>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<UserResponse | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [role, setRole] = useState<'BUYER' | 'SELLER' | 'ADMIN'>(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.role?.includes('ADMIN')) return 'ADMIN';
        if (u.role?.includes('SELLER')) return 'SELLER';
      } catch {}
    }
    return 'BUYER';
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (newToken: string, newUser: UserResponse) => {
    setToken(newToken);
    setUser(newUser);
    if (newUser.role?.includes('ADMIN')) {
      setRole('ADMIN');
    } else if (newUser.role?.includes('SELLER')) {
      setRole('SELLER');
    } else {
      setRole('BUYER');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const switchRole = () => {
    setRole((prev) => {
      if (prev === 'ADMIN') return 'ADMIN';
      return prev === 'BUYER' ? 'SELLER' : 'BUYER';
    });
  };

  const updateUser = (updated: Partial<UserResponse>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      if (next.role?.includes('ADMIN')) {
        setRole('ADMIN');
      } else if (next.role?.includes('SELLER')) {
        setRole('SELLER');
      }
      return next;
    });
  };

  const isAdmin = user?.role?.includes('ADMIN') || role === 'ADMIN';
  const isSeller = user?.role?.includes('SELLER') || role === 'SELLER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoggedIn: !!token,
        isAdmin,
        isSeller,
        login,
        logout,
        switchRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
