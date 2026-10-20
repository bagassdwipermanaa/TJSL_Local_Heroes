import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContextInstance';
import {
  getStoredUser,
  getStoredToken,
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser
} from '../services/authService';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function verifySession() {
      const activeUser = await fetchCurrentUser();
      if (mounted) {
        setUser(activeUser);
        setToken(getStoredToken());
        setIsLoading(false);
      }
    }
    verifySession();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await loginUser(credentials);
    setUser(res.user);
    setToken(res.token);
    return res.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await registerUser(payload);
    setUser(res.user);
    setToken(res.token);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
