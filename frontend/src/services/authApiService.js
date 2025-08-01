// Authentication API Service - Real Implementation
// frontend/src/services/authApiService.js

import axiosInstance from './axiosConfig';
import { devLog, devError } from '../components/common/devLogger';

class AuthApiService {
  constructor() {
    this.baseURL = '/api/v1/auth';
    this.tokenKey = 'eas_auth_token';
    this.refreshTokenKey = 'eas_refresh_token';
    this.campusKey = 'eas_current_campus';
  }

  /**
   * User login
   */
  async login(credentials) {
    try {
      devLog('[AuthAPI] Attempting login for:', credentials.email);
      const response = await axiosInstance.post(`${this.baseURL}/login/`, credentials);
      
      if (response.data && response.data.access) {
        const { access, refresh, user } = response.data;
        
        // Store tokens
        localStorage.setItem(this.tokenKey, access);
        localStorage.setItem(this.refreshTokenKey, refresh);
        
        // Set default axios authorization header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        devLog('[AuthAPI] Login successful for user:', user.email);
        return {
          success: true,
          data: {
            user,
            tokens: { access, refresh }
          }
        };
      }
      
      throw new Error('Invalid login response');
    } catch (error) {
      devError('[AuthAPI] Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  }

  /**
   * User logout
   */
  async logout() {
    try {
      devLog('[AuthAPI] Logging out user...');
      
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      if (refreshToken) {
        // Attempt to invalidate refresh token on server
        await axiosInstance.post(`${this.baseURL}/logout/`, {
          refresh_token: refreshToken
        });
      }
      
      // Clear local storage
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.campusKey);
      
      // Clear axios authorization header
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      devLog('[AuthAPI] Logout successful');
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      devError('[AuthAPI] Logout error:', error);
      // Even if server logout fails, clear local data
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.campusKey);
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  }

  /**
   * User registration
   */
  async register(userData) {
    try {
      devLog('[AuthAPI] Attempting registration for:', userData.email);
      const response = await axiosInstance.post(`${this.baseURL}/register/`, userData);
      
      if (response.data) {
        devLog('[AuthAPI] Registration successful:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Registration failed');
    } catch (error) {
      devError('[AuthAPI] Registration failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed'
      };
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      devLog('[AuthAPI] Refreshing authentication token...');
      const response = await axiosInstance.post(`${this.baseURL}/token/refresh/`, {
        refresh: refreshToken
      });
      
      if (response.data && response.data.access) {
        const { access } = response.data;
        
        // Update stored token
        localStorage.setItem(this.tokenKey, access);
        
        // Update axios authorization header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        
        devLog('[AuthAPI] Token refreshed successfully');
        return {
          success: true,
          data: { access }
        };
      }
      
      throw new Error('Invalid refresh response');
    } catch (error) {
      devError('[AuthAPI] Token refresh failed:', error);
      
      // Clear invalid tokens
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      return {
        success: false,
        error: error.message || 'Token refresh failed'
      };
    }
  }

  /**
   * Password reset request
   */
  async requestPasswordReset(email) {
    try {
      devLog('[AuthAPI] Requesting password reset for:', email);
      const response = await axiosInstance.post(`${this.baseURL}/password-reset/`, { email });
      
      if (response.data) {
        devLog('[AuthAPI] Password reset request sent');
        return {
          success: true,
          message: 'Password reset instructions sent to your email'
        };
      }
      
      throw new Error('Failed to send reset instructions');
    } catch (error) {
      devError('[AuthAPI] Password reset request failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send reset instructions'
      };
    }
  }

  /**
   * Password reset confirmation
   */
  async confirmPasswordReset(resetData) {
    try {
      devLog('[AuthAPI] Confirming password reset...');
      const response = await axiosInstance.post(`${this.baseURL}/password-reset/confirm/`, resetData);
      
      if (response.data) {
        devLog('[AuthAPI] Password reset successful');
        return {
          success: true,
          message: 'Password reset successfully'
        };
      }
      
      throw new Error('Failed to reset password');
    } catch (error) {
      devError('[AuthAPI] Password reset confirmation failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to reset password'
      };
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token) {
    try {
      devLog('[AuthAPI] Verifying email with token...');
      const response = await axiosInstance.post(`${this.baseURL}/verify-email/`, { token });
      
      if (response.data) {
        devLog('[AuthAPI] Email verification successful');
        return {
          success: true,
          message: 'Email verified successfully'
        };
      }
      
      throw new Error('Email verification failed');
    } catch (error) {
      devError('[AuthAPI] Email verification failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Email verification failed'
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem(this.tokenKey);
    return !!token;
  }

  /**
   * Get stored authentication token
   */
  getAuthToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Initialize authentication from stored tokens
   */
  initializeAuth() {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      devLog('[AuthAPI] Authentication initialized from stored token');
      return true;
    }
    return false;
  }

  /**
   * Set current campus context
   */
  setCurrentCampus(campusId) {
    localStorage.setItem(this.campusKey, campusId);
    // Update axios header for campus context
    axiosInstance.defaults.headers.common['X-Campus-ID'] = campusId;
    devLog('[AuthAPI] Campus context updated:', campusId);
  }

  /**
   * Get current campus context
   */
  getCurrentCampus() {
    return localStorage.getItem(this.campusKey);
  }

  /**
   * Clear campus context
   */
  clearCampusContext() {
    localStorage.removeItem(this.campusKey);
    delete axiosInstance.defaults.headers.common['X-Campus-ID'];
    devLog('[AuthAPI] Campus context cleared');
  }
}

// Create and export singleton instance
const authApiService = new AuthApiService();

// Initialize authentication on module load
authApiService.initializeAuth();

export default authApiService;
