// Axios Configuration for Backend API
// frontend/src/services/axiosConfig.js

import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Enable CORS credentials if needed
});

// Request interceptor to add authentication tokens
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage or wherever you store it
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add campus context if available
    const campusId = localStorage.getItem('selected_campus_id');
    if (campusId) {
      config.headers['X-Campus-ID'] = campusId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      // Remove invalid tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
