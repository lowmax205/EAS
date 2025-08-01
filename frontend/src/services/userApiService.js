// Real API Service - User Management
// frontend/src/services/userApiService.js

import axiosInstance from './axiosConfig';
import { devLog, devError } from '../components/common/devLogger';

class UserApiService {
  constructor() {
    this.baseURL = '/api/v1';
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      devLog('[UserAPI] Fetching current user profile...');
      const response = await axiosInstance.get(`${this.baseURL}/users/me/`);
      
      if (response.data) {
        devLog('[UserAPI] Current user profile loaded:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('User profile not found');
    } catch (error) {
      devError('[UserAPI] Error fetching current user:', error);
      return {
        success: false,
        error: error.message || 'Failed to load user profile'
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userData) {
    try {
      devLog('[UserAPI] Updating user profile:', userData);
      const response = await axiosInstance.put(`${this.baseURL}/users/me/`, userData);
      
      if (response.data) {
        devLog('[UserAPI] User profile updated successfully:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Failed to update profile');
    } catch (error) {
      devError('[UserAPI] Error updating user profile:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile'
      };
    }
  }

  /**
   * Change user password
   */
  async changePassword(passwordData) {
    try {
      devLog('[UserAPI] Changing password...');
      const response = await axiosInstance.post(`${this.baseURL}/users/change-password/`, passwordData);
      
      if (response.data) {
        devLog('[UserAPI] Password changed successfully');
        return {
          success: true,
          message: 'Password changed successfully'
        };
      }
      
      throw new Error('Failed to change password');
    } catch (error) {
      devError('[UserAPI] Error changing password:', error);
      return {
        success: false,
        error: error.message || 'Failed to change password'
      };
    }
  }

  /**
   * Get users list (admin/staff only)
   */
  async getUsers(filters = {}) {
    try {
      devLog('[UserAPI] Fetching users list:', filters);
      
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.isActive !== undefined) params.append('is_active', filters.isActive);
      if (filters.campusId) params.append('campus_id', filters.campusId);
      
      const response = await axiosInstance.get(`${this.baseURL}/users/?${params.toString()}`);
      
      if (response.data && Array.isArray(response.data)) {
        devLog('[UserAPI] Users list loaded:', response.data.length);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Invalid users data format');
    } catch (error) {
      devError('[UserAPI] Error fetching users:', error);
      return {
        success: false,
        error: error.message || 'Failed to load users'
      };
    }
  }

  /**
   * Get user details by ID (admin/staff only)
   */
  async getUserDetails(userId) {
    try {
      devLog('[UserAPI] Fetching user details for ID:', userId);
      const response = await axiosInstance.get(`${this.baseURL}/users/${userId}/`);
      
      if (response.data) {
        devLog('[UserAPI] User details loaded:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('User not found');
    } catch (error) {
      devError('[UserAPI] Error fetching user details:', error);
      return {
        success: false,
        error: error.message || 'Failed to load user details'
      };
    }
  }

  /**
   * Create new user (admin only)
   */
  async createUser(userData) {
    try {
      devLog('[UserAPI] Creating new user:', userData);
      const response = await axiosInstance.post(`${this.baseURL}/users/`, userData);
      
      if (response.data) {
        devLog('[UserAPI] User created successfully:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Failed to create user');
    } catch (error) {
      devError('[UserAPI] Error creating user:', error);
      return {
        success: false,
        error: error.message || 'Failed to create user'
      };
    }
  }

  /**
   * Update user (admin/staff only)
   */
  async updateUser(userId, userData) {
    try {
      devLog('[UserAPI] Updating user:', userId, userData);
      const response = await axiosInstance.put(`${this.baseURL}/users/${userId}/`, userData);
      
      if (response.data) {
        devLog('[UserAPI] User updated successfully:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Failed to update user');
    } catch (error) {
      devError('[UserAPI] Error updating user:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user'
      };
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId) {
    try {
      devLog('[UserAPI] Deleting user:', userId);
      await axiosInstance.delete(`${this.baseURL}/users/${userId}/`);
      
      devLog('[UserAPI] User deleted successfully');
      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      devError('[UserAPI] Error deleting user:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete user'
      };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId) {
    try {
      devLog('[UserAPI] Fetching user statistics for ID:', userId);
      const response = await axiosInstance.get(`${this.baseURL}/users/${userId}/statistics/`);
      
      if (response.data) {
        devLog('[UserAPI] User statistics loaded:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Statistics not found');
    } catch (error) {
      devError('[UserAPI] Error fetching user statistics:', error);
      return {
        success: false,
        error: error.message || 'Failed to load user statistics'
      };
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(formData) {
    try {
      devLog('[UserAPI] Uploading user avatar...');
      const response = await axiosInstance.post(`${this.baseURL}/users/me/avatar/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data) {
        devLog('[UserAPI] Avatar uploaded successfully:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Failed to upload avatar');
    } catch (error) {
      devError('[UserAPI] Error uploading avatar:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload avatar'
      };
    }
  }

  /**
   * Get user's campus permissions
   */
  async getUserPermissions() {
    try {
      devLog('[UserAPI] Fetching user permissions...');
      const response = await axiosInstance.get(`${this.baseURL}/users/me/permissions/`);
      
      if (response.data) {
        devLog('[UserAPI] User permissions loaded:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Permissions not found');
    } catch (error) {
      devError('[UserAPI] Error fetching user permissions:', error);
      return {
        success: false,
        error: error.message || 'Failed to load user permissions'
      };
    }
  }
}

// Create and export singleton instance
const userApiService = new UserApiService();
export default userApiService;
