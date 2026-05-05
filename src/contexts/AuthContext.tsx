'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { db } from '@/lib/db';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for persisted mock session
    const storedUserId = localStorage.getItem('mockUserId');
    if (storedUserId) {
      db.getUsers().then(users => {
        const found = users.find(u => u.id === storedUserId);
        if (found) setUser(found);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    const users = await db.getUsers();
    const found = users.find(u => u.email === email);
    if (found) {
      setUser(found);
      localStorage.setItem('mockUserId', found.id);
    } else {
      throw new Error('User not found');
    }
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUserId');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
