import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearStoredToken,
  getCurrentUser,
  getStoredToken,
  loginUser,
  logoutUser,
  registerUser,
  setStoredToken,
  startGoogleLogin,
} from './authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthExpired = () => setUser(null);
    window.addEventListener('datalens:auth-expired', handleAuthExpired);

    const bootstrap = async () => {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const current = await getCurrentUser(token);
        setUser(current);
      } catch {
        clearStoredToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    return () => window.removeEventListener('datalens:auth-expired', handleAuthExpired);
  }, []);

  const handleLogin = async (email, password) => {
    const response = await loginUser({ email, password });
    if (response?.token) {
      setStoredToken(response.token);
      setUser(response.user || null);
    }
    return response;
  };

  const handleRegister = async (name, email, password) => {
    const response = await registerUser({ name, email, password });
    if (response?.token) {
      setStoredToken(response.token);
      setUser(response.user || null);
    }
    return response;
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  const handleGoogleLogin = () => {
    startGoogleLogin();
  };

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    googleLogin: handleGoogleLogin,
    setUser,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
