import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('bakery_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('bakery_token');
    if (token) {
      authService.getMe()
        .then(({ data }) => setUser(data.user))
        .catch(() => { localStorage.removeItem('bakery_token'); localStorage.removeItem('bakery_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const persistUser = useCallback((userData, token) => {
    localStorage.setItem('bakery_token', token);
    localStorage.setItem('bakery_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authService.login(credentials);
    persistUser(data.user, data.token);
    toast.success(`Welcome back, ${data.user.name}! 🍰`);
    return data.user;
  }, [persistUser]);

  const register = useCallback(async (userData) => {
    const { data } = await authService.register(userData);
    persistUser(data.user, data.token);
    toast.success('Account created! Welcome to My Bakery 🎉');
    return data.user;
  }, [persistUser]);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    localStorage.removeItem('bakery_token');
    localStorage.removeItem('bakery_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem('bakery_user', JSON.stringify(merged));
    setUser(merged);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
