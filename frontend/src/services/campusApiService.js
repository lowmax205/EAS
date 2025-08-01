/**
 * Campus API Service - Comprehensive API integration for campus-aware endpoints
 * Integrates with AuthContext campus context for seamless multi-campus support
 */

import { useAuth } from '../features/auth/AuthContext';
import { apiRequest, tokenUtils } from './apiConnect';
import { API_ENDPOINTS, CAMPUS_UTILS } from '../components/common/constants/api';

class CampusApiService {
  constructor() {
    this.baseUrl = API_ENDPOINTS.CAMPUS;
  }

  /**
   * Get campus context from authentication
   */
  getCampusContext() {
    // In real implementation, this would get context from useAuth hook
    // For now, simulate campus context
    return {
      userCampusId: 1,
      canAccessMultipleCampuses: false,
      accessibleCampusIds: [1],
      isSuperAdmin: false
    };
  }

  /**
   * List all campuses (with permission filtering)
   */
  async listCampuses() {
    const campusContext = this.getCampusContext();
    
    try {
      // Super admin can see all campuses, others see only accessible ones
      if (campusContext.isSuperAdmin) {
        const response = await apiClient.get(this.baseUrl.LIST);
        return response.data;
      } else {
        // Filter to only show accessible campuses
        const response = await apiClient.get(this.baseUrl.LIST);
        return response.data.filter(campus => 
          campusContext.accessibleCampusIds.includes(campus.id)
        );
      }
    } catch (error) {
      console.error('[CampusApiService] Error listing campuses:', error);
      throw error;
    }
  }

  /**
   * Get campus details
   */
  async getCampusDetails(campusId) {
    const campusContext = this.getCampusContext();
    
    // Validate campus access
    if (!CAMPUS_UTILS.validateCampusAccess(campusContext, campusId)) {
      throw new Error('Insufficient permissions to access this campus');
    }

    try {
      const response = await apiClient.get(this.baseUrl.DETAIL(campusId));
      return response.data;
    } catch (error) {
      console.error('[CampusApiService] Error getting campus details:', error);
      throw error;
    }
  }

  /**
   * Get campus departments
   */
  async getCampusDepartments(campusId) {
    const campusContext = this.getCampusContext();
    
    if (!CAMPUS_UTILS.validateCampusAccess(campusContext, campusId)) {
      throw new Error('Insufficient permissions to access this campus');
    }

    try {
      const response = await apiClient.get(this.baseUrl.DEPARTMENTS(campusId));
      return response.data;
    } catch (error) {
      console.error('[CampusApiService] Error getting campus departments:', error);
      throw error;
    }
  }

  /**
   * Get campus statistics
   */
  async getCampusStatistics(campusId) {
    const campusContext = this.getCampusContext();
    
    if (!CAMPUS_UTILS.validateCampusAccess(campusContext, campusId)) {
      throw new Error('Insufficient permissions to access this campus');
    }

    try {
      const response = await apiClient.get(this.baseUrl.STATISTICS(campusId));
      return response.data;
    } catch (error) {
      console.error('[CampusApiService] Error getting campus statistics:', error);
      throw error;
    }
  }

  /**
   * Get campus users (with filtering)
   */
  async getCampusUsers(campusId, filters = {}) {
    const campusContext = this.getCampusContext();
    
    if (!CAMPUS_UTILS.validateCampusAccess(campusContext, campusId)) {
      throw new Error('Insufficient permissions to access this campus');
    }

    try {
      const endpoint = CAMPUS_UTILS.buildCampusAwareEndpoint(
        this.baseUrl.USERS(campusId),
        { campusId },
        filters
      );
      
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('[CampusApiService] Error getting campus users:', error);
      throw error;
    }
  }

  /**
   * Get campus events (with filtering)
   */
  async getCampusEvents(campusId, filters = {}) {
    const campusContext = this.getCampusContext();
    
    if (!CAMPUS_UTILS.validateCampusAccess(campusContext, campusId)) {
      throw new Error('Insufficient permissions to access this campus');
    }

    try {
      const endpoint = CAMPUS_UTILS.buildCampusAwareEndpoint(
        this.baseUrl.EVENTS(campusId),
        { campusId },
        filters
      );
      
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('[CampusApiService] Error getting campus events:', error);
      throw error;
    }
  }

  /**
   * Get campus attendance data
   */
  async getCampusAttendance(campusId, filters = {}) {
    const campusContext = this.getCampusContext();
    
    if (!CAMPUS_UTILS.validateCampusAccess(campusContext, campusId)) {
      throw new Error('Insufficient permissions to access this campus');
    }

    try {
      const endpoint = CAMPUS_UTILS.buildCampusAwareEndpoint(
        this.baseUrl.ATTENDANCE(campusId),
        { campusId },
        filters
      );
      
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('[CampusApiService] Error getting campus attendance:', error);
      throw error;
    }
  }

  /**
   * Get campus analytics
   */
  async getCampusAnalytics(campusId, timeRange = '30d') {
    const campusContext = this.getCampusContext();
    
    if (!CAMPUS_UTILS.validateCampusAccess(campusContext, campusId)) {
      throw new Error('Insufficient permissions to access this campus');
    }

    try {
      const response = await apiClient.get(this.baseUrl.ANALYTICS(campusId), {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('[CampusApiService] Error getting campus analytics:', error);
      throw error;
    }
  }

  /**
   * Update campus settings (admin only)
   */
  async updateCampusSettings(campusId, settings) {
    const campusContext = this.getCampusContext();
    
    if (!campusContext.isSuperAdmin) {
      throw new Error('Only super administrators can update campus settings');
    }

    try {
      const response = await apiClient.put(this.baseUrl.SETTINGS(campusId), settings);
      return response.data;
    } catch (error) {
      console.error('[CampusApiService] Error updating campus settings:', error);
      throw error;
    }
  }

  /**
   * Get cross-campus analytics (super admin only)
   */
  async getCrossCampusAnalytics(filters = {}) {
    const campusContext = this.getCampusContext();
    
    if (!campusContext.isSuperAdmin) {
      throw new Error('Only super administrators can access cross-campus analytics');
    }

    try {
      const response = await apiClient.get('/api/analytics/cross-campus', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('[CampusApiService] Error getting cross-campus analytics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const campusApiService = new CampusApiService();
export default CampusApiService;
