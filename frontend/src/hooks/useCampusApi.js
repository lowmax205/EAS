/**
 * Campus-Aware API Integration Hook
 * Provides seamless integration between campus context and all API services
 */

import { useAuth } from '../features/auth/AuthContext';
import { useCampus } from '../contexts/CampusContext';
import { eventsService } from '../features/events/services/eventsService';
import { attendanceService } from '../services/attendanceService';
import { campusApiService } from '../services/campusApiService';
import { CampusService } from '../services/campusService';

/**
 * Custom hook for campus-aware API operations
 * Automatically injects campus context into all API calls
 */
export const useCampusApi = () => {
  const { campusContext, canAccessCampus, getCampusPermissions } = useAuth();
  const { currentCampus, availableCampuses, userCampusPermissions } = useCampus();

  // Construct comprehensive campus context for API calls
  const apiCampusContext = {
    userCampusId: campusContext?.userCampusId || currentCampus?.id || 1,
    canAccessMultipleCampuses: campusContext?.campusPermissions?.canAccessMultipleCampuses || userCampusPermissions?.canAccessMultipleCampuses || false,
    accessibleCampusIds: campusContext?.campusPermissions?.accessibleCampusIds || userCampusPermissions?.accessibleCampusIds || [1],
    isSuperAdmin: campusContext?.campusPermissions?.isSuperAdmin || userCampusPermissions?.isSuperAdmin || false,
    isCampusAdmin: campusContext?.campusPermissions?.isCampusAdmin || userCampusPermissions?.isCampusAdmin || false,
  };

  // Campus-aware Events API
  const eventsApi = {
    /**
     * Get events with automatic campus filtering
     */
    getEvents: async (filters = {}) => {
      return await eventsService.getEvents(filters, apiCampusContext);
    },

    /**
     * Get events for specific campus (with permission check)
     */
    getCampusEvents: async (campusId, filters = {}) => {
      if (!canAccessCampus(campusId)) {
        throw new Error('Insufficient permissions to access this campus events');
      }
      return await eventsService.getEvents({ ...filters, campusId }, apiCampusContext);
    },

    /**
     * Get events for current campus
     */
    getCurrentCampusEvents: async (filters = {}) => {
      return await eventsService.getEvents({ ...filters, campusId: 'current' }, apiCampusContext);
    },

    /**
     * Get all campus events (super admin only)
     */
    getAllCampusEvents: async (filters = {}) => {
      if (!apiCampusContext.isSuperAdmin) {
        throw new Error('Only super administrators can access all campus events');
      }
      return await eventsService.getEvents({ ...filters, campusId: 'all' }, apiCampusContext);
    }
  };

  // Campus-aware Attendance API
  const attendanceApi = {
    /**
     * Get attendance with automatic campus filtering
     */
    getAttendance: async (filters = {}) => {
      return await attendanceService.getAttendance(filters, apiCampusContext);
    },

    /**
     * Get attendance for specific campus (with permission check)
     */
    getCampusAttendance: async (campusId, filters = {}) => {
      if (!canAccessCampus(campusId)) {
        throw new Error('Insufficient permissions to access this campus attendance');
      }
      return await attendanceService.getAttendance({ ...filters, campusId }, apiCampusContext);
    },

    /**
     * Get attendance by event with campus validation
     */
    getAttendanceByEvent: async (eventId) => {
      return await attendanceService.getAttendanceByEvent(eventId, apiCampusContext);
    }
  };

  // Campus Management API
  const campusManagementApi = {
    /**
     * List accessible campuses
     */
    listCampuses: async () => {
      return await campusApiService.listCampuses();
    },

    /**
     * Get campus details
     */
    getCampusDetails: async (campusId) => {
      return await campusApiService.getCampusDetails(campusId);
    },

    /**
     * Get campus departments
     */
    getCampusDepartments: async (campusId) => {
      return await campusApiService.getCampusDepartments(campusId);
    },

    /**
     * Get campus statistics
     */
    getCampusStatistics: async (campusId) => {
      return await campusApiService.getCampusStatistics(campusId);
    },

    /**
     * Get cross-campus analytics (super admin only)
     */
    getCrossCampusAnalytics: async (filters = {}) => {
      return await campusApiService.getCrossCampusAnalytics(filters);
    }
  };

  // Campus Service Integration
  const campusService = new CampusService();
  const campusDataApi = {
    /**
     * Get all campuses from service layer
     */
    getAllCampuses: () => {
      return campusService.getAllCampuses();
    },

    /**
     * Get campus by ID
     */
    getCampusById: (campusId) => {
      return campusService.getCampusById(campusId);
    },

    /**
     * Get campus by college (backward compatibility)
     */
    getCampusByCollege: (college) => {
      return campusService.getCampusByCollege(college);
    },

    /**
     * Get filtered users with campus context
     */
    getFilteredUsers: (options = {}) => {
      return campusService.getFilteredUsers({
        ...options,
        campusId: apiCampusContext.userCampusId,
        superAdminMode: apiCampusContext.isSuperAdmin
      });
    }
  };

  // Utility functions
  const utils = {
    /**
     * Validate campus access
     */
    canAccessCampus: (campusId) => {
      return canAccessCampus(campusId);
    },

    /**
     * Get current campus context
     */
    getCampusContext: () => {
      return apiCampusContext;
    },

    /**
     * Get campus permissions
     */
    getCampusPermissions: () => {
      return getCampusPermissions();
    },

    /**
     * Build campus-aware API endpoint
     */
    buildCampusEndpoint: (endpoint, params = {}) => {
      const CAMPUS_UTILS = require('../components/common/constants/api').CAMPUS_UTILS;
      return CAMPUS_UTILS.buildCampusAwareEndpoint(endpoint, apiCampusContext, params);
    }
  };

  return {
    events: eventsApi,
    attendance: attendanceApi,
    campus: campusManagementApi,
    data: campusDataApi,
    utils,
    context: apiCampusContext
  };
};

export default useCampusApi;
