/**
 * Services Export File - Real API Implementation
 * Centralizes all service exports for backend integration
 */

// Import services for internal use
import authApiService from './authApiService';
import campusApiService from './campusApiService';
import axiosInstance from './axiosConfig';

// Context Providers (keeping existing)
export { DataPreloadProvider, useDataPreload } from './DataPreloadContext';

// API Connection (keeping existing for compatibility)
export { default as apiConnect } from './apiConnect';

// Real API Services - Connected to Django Backend
export { default as authApiService } from './authApiService';
export { default as campusApiService } from './campusApiService';
export { default as eventsApiService } from './eventsApiService';
export { default as attendanceApiService } from './attendanceApiService';
export { default as userApiService } from './userApiService';

// Export axios configuration
export { default as axiosInstance } from './axiosConfig';

// Re-export for backward compatibility with existing imports
export { default as campusService } from './campusApiService';
export { default as eventsService } from './eventsApiService';
export { default as attendanceService } from './attendanceApiService';
export { default as userService } from './userApiService';
export { default as authService } from './authApiService';

// Legacy Campus Service exports (keeping for transition compatibility)
export { 
  getCampusById,
  getAllCampuses,
  getUsersByCampus,
  getEventsByCampus,
  getAttendanceByCampus
} from './campusService';

/**
 * Initialize all API services
 * Call this function on app startup
 */
export const initializeApiServices = () => {
  // Initialize authentication from stored tokens
  authApiService.initializeAuth();
  
  // Set campus context if stored
  const currentCampus = authApiService.getCurrentCampus();
  if (currentCampus) {
    authApiService.setCurrentCampus(currentCampus);
  }
  
  console.log('[API Services] All services initialized');
};

/**
 * Health check for all API services
 */
export const performHealthCheck = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    services: {}
  };

  try {
    // Check campus API
    const campusHealth = await campusApiService.healthCheck();
    results.services.campus = campusHealth;
    
    // Check if user is authenticated
    results.services.auth = {
      success: authApiService.isAuthenticated(),
      message: authApiService.isAuthenticated() ? 'User authenticated' : 'User not authenticated'
    };
    
    console.log('[API Health Check] Results:', results);
    return results;
  } catch (error) {
    console.error('[API Health Check] Failed:', error);
    return {
      timestamp: new Date().toISOString(),
      services: {
        error: error.message
      }
    };
  }
};

/**
 * API service status for debugging
 */
export const getApiStatus = () => {
  return {
    authenticated: authApiService.isAuthenticated(),
    currentCampus: authApiService.getCurrentCampus(),
    baseURL: axiosInstance.defaults.baseURL,
    hasAuthHeader: !!axiosInstance.defaults.headers.common['Authorization'],
    hasCampusHeader: !!axiosInstance.defaults.headers.common['X-Campus-ID']
  };
};
