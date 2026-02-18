
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<User | null>;
  register: (email: string, pass: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from a previous session
    const checkLoggedIn = async () => {
      setLoading(true);
      const currentUser = api.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email: string, pass: string) => {
    const loggedInUser = await api.login(email, pass);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (email: string, pass: string) => {
    const newUser = await api.register(email, pass);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
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
