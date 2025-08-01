/**
 * Integration Guide: Production-Safe API Client Implementation
 * 
 * This file provides implementation examples for integrating the new
 * production-ready API client with your EAS thesis project.
 */

import { 
  authApi, 
  eventsApi, 
  attendanceApi, 
  campusApi,
  initializeApiClients,
  performHealthCheck 
} from '../lib/apiClient';
import { logger, authLogger, campusLogger } from '../lib/logger';

/**
 * Authentication Service Integration
 * Implements thesis requirement: "Student authentication system"
 */
export class AuthenticationService {
  async login(credentials) {
    try {
      const result = await authApi.login(credentials);
      
      if (result.success) {
        // Set campus context after successful login
        const user = result.data.user;
        if (user.campus_id) {
          await campusApi.setCampusContext(user.campus_id);
        }
        
        return {
          success: true,
          user: result.data.user,
          message: 'Login successful'
        };
      }
      
      return {
        success: false,
        error: result.error.message,
        code: result.error.code
      };
      
    } catch (error) {
      logger.error('Authentication service error:', error);
      return {
        success: false,
        error: 'Authentication service unavailable'
      };
    }
  }

  async logout() {
    try {
      const result = await authApi.logout();
      
      // Clear campus context
      campusLogger.switch(null, { action: 'logout_clear' });
      
      return result;
    } catch (error) {
      logger.error('Logout service error:', error);
      // Even if API fails, clear local data
      return await authApi.logout();
    }
  }

  async register(userData) {
    return await authApi.register(userData);
  }

  async isAuthenticated() {
    const token = localStorage.getItem('eas_auth_token');
    return !!token;
  }
}

/**
 * Event Management Service
 * Implements thesis requirement: "Event attendance management based on Django"
 */
export class EventManagementService {
  async getEvents(campusFilter = true) {
    try {
      const filters = {};
      
      // Apply campus filtering if enabled
      if (campusFilter) {
        const currentCampus = localStorage.getItem('eas_current_campus');
        if (currentCampus) {
          filters.campus_id = currentCampus;
          campusLogger.filter(currentCampus, 'events');
        }
      }
      
      const result = await eventsApi.getEvents(filters);
      
      if (result.success) {
        logger.performance('events_load', Date.now(), { 
          count: result.data.length,
          filtered: campusFilter 
        });
      }
      
      return result;
      
    } catch (error) {
      logger.error('Event service error:', error);
      return {
        success: false,
        error: 'Failed to load events'
      };
    }
  }

  async createEvent(eventData) {
    try {
      // Add campus context to event
      const currentCampus = localStorage.getItem('eas_current_campus');
      if (currentCampus) {
        eventData.campus_id = parseInt(currentCampus);
      }
      
      const result = await eventsApi.createEvent(eventData);
      
      if (result.success) {
        logger.info('Event created successfully:', { 
          eventId: result.data.id,
          title: result.data.title 
        });
      }
      
      return result;
      
    } catch (error) {
      logger.error('Event creation error:', error);
      return {
        success: false,
        error: 'Failed to create event'
      };
    }
  }

  async generateQRCode(eventId) {
    try {
      const result = await eventsApi.generateQRCode(eventId);
      
      if (result.success) {
        logger.info('QR code generated for event:', { eventId });
      }
      
      return result;
      
    } catch (error) {
      logger.error('QR code generation error:', error);
      return {
        success: false,
        error: 'Failed to generate QR code'
      };
    }
  }
}

/**
 * QR Code Attendance Service
 * Implements thesis requirement: "QR Code-Based Attendance Tracking"
 */
export class QRAttendanceService {
  async validateQRCode(qrData) {
    try {
      const result = await eventsApi.validateQRCode(qrData);
      
      if (result.success) {
        logger.security('qr_validation', 'info', { 
          valid: true,
          eventId: result.data.event_id 
        });
      } else {
        logger.security('qr_validation', 'warn', { 
          valid: false,
          reason: result.error.message 
        });
      }
      
      return result;
      
    } catch (error) {
      logger.security('qr_validation', 'error', { error: error.message });
      return {
        success: false,
        error: 'QR code validation failed'
      };
    }
  }

  async recordAttendance(attendanceData) {
    try {
      // Add timestamp and campus context
      const enhancedData = {
        ...attendanceData,
        timestamp: new Date().toISOString(),
        campus_id: localStorage.getItem('eas_current_campus')
      };
      
      const result = await attendanceApi.recordAttendance(enhancedData);
      
      if (result.success) {
        logger.info('Attendance recorded:', { 
          eventId: attendanceData.event_id,
          userId: attendanceData.user_id 
        });
        
        // Log for analytics
        logger.performance('attendance_record', Date.now(), {
          method: 'qr_scan',
          location_verified: !!attendanceData.location
        });
      }
      
      return result;
      
    } catch (error) {
      logger.error('Attendance recording error:', error);
      return {
        success: false,
        error: 'Failed to record attendance'
      };
    }
  }

  async getAttendanceStats(eventId) {
    try {
      const result = await attendanceApi.getAttendanceByEvent(eventId);
      
      if (result.success) {
        logger.performance('attendance_stats', Date.now(), {
          eventId,
          attendeeCount: result.data.length
        });
      }
      
      return result;
      
    } catch (error) {
      logger.error('Attendance stats error:', error);
      return {
        success: false,
        error: 'Failed to load attendance statistics'
      };
    }
  }
}

/**
 * Campus Management Service
 * Implements thesis requirement: Multi-campus support
 */
export class CampusManagementService {
  async getCampuses() {
    return await campusApi.getCampuses();
  }

  async switchCampus(campusId) {
    try {
      const result = await campusApi.setCampusContext(campusId);
      
      if (result.success) {
        campusLogger.switch(campusId, { 
          timestamp: new Date().toISOString(),
          method: 'manual_switch'
        });
        
        // Trigger data refresh for new campus context
        window.dispatchEvent(new CustomEvent('campusChanged', { 
          detail: { campusId } 
        }));
      }
      
      return result;
      
    } catch (error) {
      logger.error('Campus switch error:', error);
      return {
        success: false,
        error: 'Failed to switch campus'
      };
    }
  }

  async getCampusStats(campusId) {
    return await campusApi.getCampusStats(campusId);
  }
}

/**
 * Application Initialization Service
 */
export class AppInitializationService {
  async initialize() {
    try {
      logger.info('Initializing EAS application...');
      
      // Initialize API clients
      initializeApiClients();
      
      // Perform health check
      const healthCheck = await performHealthCheck();
      
      if (healthCheck.status === 'unhealthy') {
        logger.warn('API health check failed:', healthCheck);
        return {
          success: false,
          error: 'Backend services are unavailable'
        };
      }
      
      logger.info('EAS application initialized successfully');
      
      return {
        success: true,
        healthCheck
      };
      
    } catch (error) {
      logger.error('Application initialization failed:', error);
      return {
        success: false,
        error: 'Application initialization failed'
      };
    }
  }
}

/**
 * Error Handler Service
 * Centralized error handling for production safety
 */
export class ErrorHandlerService {
  static handleApiError(error, context = {}) {
    const errorDetails = {
      message: error.message || 'Unknown error',
      status: error.status || 0,
      code: error.code || 'UNKNOWN',
      context
    };
    
    logger.error('API Error:', errorDetails);
    
    // Return user-friendly error message
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in and try again.';
      case 403:
        return 'Access denied. You do not have permission for this action.';
      case 404:
        return 'Requested resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  static handleNetworkError(error, context = {}) {
    logger.error('Network Error:', { error: error.message, context });
    return 'Network connection error. Please check your internet connection.';
  }

  static handleValidationError(errors) {
    logger.warn('Validation Error:', { errors });
    
    if (Array.isArray(errors)) {
      return errors.join(', ');
    }
    
    if (typeof errors === 'object') {
      return Object.values(errors).flat().join(', ');
    }
    
    return 'Please check your input and try again.';
  }
}

/**
 * Usage Examples for React Components
 */

// Example 1: Login Component
export const useAuthenticationExample = () => {
  const authService = new AuthenticationService();
  
  const handleLogin = async (credentials) => {
    const result = await authService.login(credentials);
    
    if (result.success) {
      // Redirect to dashboard or show success message
      logger.info('User logged in successfully');
    } else {
      // Show error message to user
      const errorMessage = ErrorHandlerService.handleApiError(result);
      logger.dev('Login failed:', errorMessage);
    }
    
    return result;
  };
  
  return { handleLogin };
};

// Example 2: Event Management Component
export const useEventManagementExample = () => {
  const eventService = new EventManagementService();
  
  const loadEvents = async () => {
    const result = await eventService.getEvents();
    
    if (result.success) {
      return result.data;
    } else {
      const errorMessage = ErrorHandlerService.handleApiError(result);
      throw new Error(errorMessage);
    }
  };
  
  const createEvent = async (eventData) => {
    const result = await eventService.createEvent(eventData);
    
    if (result.success) {
      logger.info('Event created successfully');
      return result.data;
    } else {
      const errorMessage = ErrorHandlerService.handleApiError(result);
      throw new Error(errorMessage);
    }
  };
  
  return { loadEvents, createEvent };
};

// Example 3: QR Code Attendance Component
export const useQRAttendanceExample = () => {
  const qrService = new QRAttendanceService();
  
  const handleQRScan = async (qrData) => {
    // Validate QR code first
    const validationResult = await qrService.validateQRCode(qrData);
    
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Invalid QR code'
      };
    }
    
    // Record attendance
    const attendanceData = {
      event_id: validationResult.data.event_id,
      user_id: getCurrentUserId(),
      qr_data: qrData,
      location: await getCurrentLocation(), // If location verification is enabled
      device_info: getDeviceInfo()
    };
    
    const result = await qrService.recordAttendance(attendanceData);
    
    if (result.success) {
      logger.info('Attendance recorded via QR scan');
    }
    
    return result;
  };
  
  return { handleQRScan };
};

/**
 * Helper functions
 */
const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('eas_auth_user') || '{}');
    return user.id;
  } catch {
    return null;
  }
};

const getCurrentLocation = async () => {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }),
        () => resolve(null)
      );
    } else {
      resolve(null);
    }
  });
};

const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
};

export {
  AuthenticationService,
  EventManagementService,
  QRAttendanceService,
  CampusManagementService,
  AppInitializationService,
  ErrorHandlerService
};
