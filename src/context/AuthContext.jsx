import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || '/api/auth';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password, mobile) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, mobile })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async (mobile) => {
    try {
      const res = await fetch(`${API_URL}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      return { success: res.ok, error: data.error };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const resetPassword = async (mobile, otp, newPassword) => {
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, newPassword })
      });
      const data = await res.json();
      return { success: res.ok, error: data.error };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileData, id: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, requestOTP, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
