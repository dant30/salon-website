// filepath: c:\Users\dante\salon-website\frontend\src\context\AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('access');
    const refreshToken = localStorage.getItem('refresh');
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      // Fetch user data
      axios.get(`${process.env.REACT_APP_API_URL}/auth/users/me/`)
        .then(response => {
          setUser(response.data);
          setIsLoading(false);  // Added: Ensure loading stops on success
        })
        .catch(() => {
          // If access token is invalid, try refreshing it
          if (refreshToken) {
            axios.post(`${process.env.REACT_APP_API_URL}/token/refresh/`, { refresh: refreshToken })
              .then(res => {
                localStorage.setItem('access', res.data.access);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;  // Fixed: Use new token
                return axios.get(`${process.env.REACT_APP_API_URL}/auth/users/me/`);
              })
              .then(response => setUser(response.data))
              .catch(() => {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                delete axios.defaults.headers.common['Authorization'];
              })
              .finally(() => setIsLoading(false));  // Ensure loading stops
          } else {
            setIsLoading(false);
          }
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login/`, { email, password });
    const { access, refresh, user } = response.data;
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    setUser(user);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh');
    if (refreshToken) {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/logout/`, { refresh: refreshToken });
    }
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const register = async (data) => {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register/`, data);
    const { access, refresh, user } = response.data;
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    setUser(user);
  };

  const updateProfile = async (data) => {
    const response = await axios.patch(`${process.env.REACT_APP_API_URL}/auth/users/update_me/`, data);
    setUser(response.data);
  };

  // New functions for profile management
  const getUserProfile = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/profiles/my_profile/`);
    return response.data;
  };

  const updateUserProfile = async (data) => {
    const response = await axios.patch(`${process.env.REACT_APP_API_URL}/auth/profiles/my_profile/`, data);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      register, 
      updateProfile, 
      getUserProfile,  // Added
      updateUserProfile  // Added
    }}>
      {children}
    </AuthContext.Provider>
  );
};