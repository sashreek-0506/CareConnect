import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cc_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cc_access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ data }) => {
        setUser(data.data.user);
        localStorage.setItem('cc_user', JSON.stringify(data.data.user));
      })
      .catch(() => {
        localStorage.removeItem('cc_access_token');
        localStorage.removeItem('cc_refresh_token');
        localStorage.removeItem('cc_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = useCallback((data) => {
    localStorage.setItem('cc_access_token', data.accessToken);
    localStorage.setItem('cc_refresh_token', data.refreshToken);
    localStorage.setItem('cc_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await authApi.login({ email, password });
      persistSession(data.data);
      return data.data.user;
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await authApi.register(payload);
      persistSession(data.data);
      return data.data.user;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('cc_access_token');
    localStorage.removeItem('cc_refresh_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
