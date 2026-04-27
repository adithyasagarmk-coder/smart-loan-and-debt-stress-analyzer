import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI
        .me()
        .then((res) => setUser(res.data.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      console.log('Login Response Status:', res.status);
      console.log('Login Response Data:', JSON.stringify(res.data, null, 2));
      
      let token = null;
      let user = null;
      
      // Extract token from response - handle multiple possible structures
      if (res.data?.data?.token) {
        token = res.data.data.token;
        user = res.data.data.user;
        console.log('✓ Token found in res.data.data.token');
      } else if (res.data?.token) {
        token = res.data.token;
        user = res.data.user;
        console.log('✓ Token found in res.data.token');
      }
      
      console.log('Extracted Token:', token ? '✓ Found' : '✗ NOT FOUND');
      console.log('Extracted User:', user);
      
      // If no token found, throw meaningful error
      if (!token) {
        const errorMsg = res.data?.message || 'Login failed - server did not return a token';
        console.error('Token extraction failed:', errorMsg);
        console.error('Full response:', res.data);
        throw new Error(errorMsg);
      }
      
      // Store token and user data
      localStorage.setItem('token', token);
      setUser(user || { email });
      
      console.log('✓ Login successful - token stored');
      return res.data;
    } catch (err) {
      console.error('Login error caught:', err.message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    console.log('Full Register response:', JSON.stringify(res.data, null, 2));
    
    // Extract token from various possible response structures
    let token = null;
    let user = null;
    
    if (res.data?.data?.token) {
      token = res.data.data.token;
      user = res.data.data.user;
    } else if (res.data?.token) {
      token = res.data.token;
      user = res.data.user;
    }
    
    console.log('Token extracted:', token ? 'Success' : 'Not found in response');
    
    if (token) {
      localStorage.setItem('token', token);
      setUser(user || null);
    }
    
    // Registration success doesn't require token in localStorage
    // User can login on next page
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshKey, triggerRefresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
