import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('cg_token') || null);
  const [user, setUser]   = useState(() => {
    const saved = localStorage.getItem('cg_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('cg_token', newToken);
    localStorage.setItem('cg_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cg_token');
    localStorage.removeItem('cg_user');
    setToken(null);
    setUser(null);
  }, []);

  const authFetch = useCallback((url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, authFetch, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
