import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nyaya_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nyaya_token');
      localStorage.removeItem('nyaya_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('nyaya_theme') || 'dark');

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nyaya_theme', theme);
  }, [theme]);

  // Load user from storage on mount
  useEffect(() => {
    const token = localStorage.getItem('nyaya_token');
    const storedUser = localStorage.getItem('nyaya_user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Validate token with server
        api.get('/auth/me').then((res) => {
          setUser(res.data.user);
          localStorage.setItem('nyaya_user', JSON.stringify(res.data.user));
        }).catch(() => {
          localStorage.removeItem('nyaya_token');
          localStorage.removeItem('nyaya_user');
          setUser(null);
        }).finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('nyaya_token', token);
    localStorage.setItem('nyaya_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('nyaya_token', token);
    localStorage.setItem('nyaya_user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nyaya_token');
    localStorage.removeItem('nyaya_user');
    setUser(null);
    window.location.href = '/';
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('nyaya_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, theme,
      login, register, logout, updateUser, toggleTheme, api,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
