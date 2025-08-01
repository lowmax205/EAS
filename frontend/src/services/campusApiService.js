// Real API Service - Campus Management
// frontend/src/services/campusApiService.js

import axiosInstance from './axiosConfig';
import { devLog, devError } from '../components/common/devLogger';

class CampusApiService {
  constructor() {
    this.baseURL = '/api/v1';
  }

  /**
   * Get current user's campus context
   */
  async getCampusContext() {
    try {
      devLog('[CampusAPI] Fetching campus context...');
      const response = await axiosInstance.get(`${this.baseURL}/campuses/accessible/`);
      
      if (response.data) {
        devLog('[CampusAPI] Campus context loaded:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('No campus context data received');
    } catch (error) {
      devError('[CampusAPI] Error fetching campus context:', error);
      return {
        success: false,
        error: error.message || 'Failed to load campus context'
      };
    }
  }

  /**
   * List all campuses (with permission filtering)
   */
  async listCampuses() {
    try {
      devLog('[CampusAPI] Fetching campuses list...');
      const response = await axiosInstance.get(`${this.baseURL}/campuses/`);
      
      if (response.data && Array.isArray(response.data)) {
        devLog('[CampusAPI] Campuses loaded:', response.data.length);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Invalid campus data format');
    } catch (error) {
      devError('[CampusAPI] Error fetching campuses:', error);
      return {
        success: false,
        error: error.message || 'Failed to load campuses'
      };
    }
  }

  /**
   * Get campus details by ID
   */
  async getCampusDetails(campusId) {
    try {
      devLog('[CampusAPI] Fetching campus details for ID:', campusId);
      const response = await axiosInstance.get(`${this.baseURL}/campuses/${campusId}/`);
      
      if (response.data) {
        devLog('[CampusAPI] Campus details loaded:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Campus not found');
    } catch (error) {
      devError('[CampusAPI] Error fetching campus details:', error);
      return {
        success: false,
        error: error.message || 'Failed to load campus details'
      };
    }
  }

  /**
   * Get campus analytics
   */
  async getCampusAnalytics(campusId) {
    try {
      devLog('[CampusAPI] Fetching campus analytics for ID:', campusId);
      const response = await axiosInstance.get(`${this.baseURL}/campuses/${campusId}/statistics/`);
      
      if (response.data) {
        devLog('[CampusAPI] Campus analytics loaded:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Analytics data not found');
    } catch (error) {
      devError('[CampusAPI] Error fetching campus analytics:', error);
      return {
        success: false,
        error: error.message || 'Failed to load campus analytics'
      };
    }
  }

  /**
   * Health check for API connectivity
   */
  async healthCheck() {
    try {
      devLog('[CampusAPI] Performing health check...');
      const response = await axiosInstance.get(`${this.baseURL}/campuses/`);
      
      return {
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      devError('[CampusAPI] Health check failed:', error);
      return {
        success: false,
        message: 'API is unavailable',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create and export singleton instance
const campusApiService = new CampusApiService();
export default campusApiService;
