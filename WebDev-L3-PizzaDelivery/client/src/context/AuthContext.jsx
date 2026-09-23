import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem('pizzanest_token') || localStorage.getItem('pizzaro_token') || null
  );
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await API.get('/auth/me');
        setUser(data.user);
      } catch (err) {
        console.warn('[AuthContext] Session expired or invalid:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Customer Login
  const login = async (email, password) => {
    const data = await API.post('/auth/login', { email, password });
    localStorage.setItem('pizzanest_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Dedicated Admin Login
  const adminLogin = async (email, password) => {
    const data = await API.post('/admin/login', { email, password });
    localStorage.setItem('pizzanest_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Customer Register
  const register = async (userData) => {
    const data = await API.post('/auth/register', userData);
    localStorage.setItem('pizzanest_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('pizzanest_token');
    setToken(null);
    setUser(null);
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    const data = await API.patch('/auth/profile', profileData);
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        adminLogin,
        register,
        logout,
        updateProfile,
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
