/**
 * Services Export File
 * Centralizes all service exports
 */

// Context Providers
export { DataPreloadProvider, useDataPreload } from './DataPreloadContext';

// API Connection
export { default as apiConnect } from './apiConnect';

// Campus Service - Story 1.1: Campus Data Model Foundation
export { 
  campusService,
  getCampusById,
  getAllCampuses,
  getUsersByCampus,
  getEventsByCampus,
  getAttendanceByCampus
} from './campusService';

// External services will be added here as they're implemented
// export * from './external/';
