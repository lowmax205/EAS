/**
 * API Constants and Endpoints Configuration
 * This file contains all API endpoints, HTTP methods, status codes,
 * and API-related constants that will be used by both frontend and backend
 */

import { SECURITY_CONFIG } from "../security";

// API Base Configuration
export const API_CONFIG = {
  // Base URLs based on environment
  BASE_URL: {
    DEVELOPMENT: "http://localhost:8000/api",
    PRODUCTION: "https://eas-university.onrender.com/api",
    CURRENT: import.meta.env.DEV
      ? "http://localhost:8000/api"
      : "https://eas-university.onrender.com/api",
  },

  // API Settings
  TIMEOUT: 10000,
  MAX_RETRIES: 3,
  BACKEND_DISABLED:
    import.meta.env.VITE_REACT_APP_BACKEND_DISABLED === "true" || true,

  // Security settings
  ENFORCE_HTTPS: SECURITY_CONFIG.API_SECURITY.ENFORCE_SSL,
  SECURE_COOKIES: SECURITY_CONFIG.SECURE_COOKIES,

  // API versioning
  VERSION: "v1",

  // Request configuration
  HEADERS: {
    CONTENT_TYPE: "application/json",
    ACCEPT: "application/json",
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
  OPTIONS: "OPTIONS",
  HEAD: "HEAD",
};

// HTTP Status Codes
export const STATUS_CODES = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // 4xx Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// API Response Types
export const RESPONSE_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  VALIDATION_ERROR: "validation_error",
  AUTHENTICATION_ERROR: "authentication_error",
  AUTHORIZATION_ERROR: "authorization_error",
  NOT_FOUND_ERROR: "not_found_error",
  SERVER_ERROR: "server_error",
};

// API Endpoints Structure
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: "/auth/login/",
    LOGOUT: "/auth/logout/",
    REGISTER: "/auth/register/",
    REFRESH_TOKEN: "/auth/refresh/",
    VERIFY_TOKEN: "/auth/verify/",
    FORGOT_PASSWORD: "/auth/forgot-password/",
    RESET_PASSWORD: "/auth/reset-password/",
    CHANGE_PASSWORD: "/auth/change-password/",
    PROFILE: "/auth/profile/",
    UPDATE_PROFILE: "/auth/profile/update/",
    USERS: "/auth/users/",
    USER_DETAIL: (id) => `/auth/users/${id}/`,
    USER_AVATAR: (id) => `/auth/users/${id}/avatar/`,
    DEACTIVATE_USER: (id) => `/auth/users/${id}/deactivate/`,
  },

  // Events endpoints
  EVENTS: {
    LIST: "/events/",
    CREATE: "/events/",
    DETAIL: (id) => `/events/${id}/`,
    UPDATE: (id) => `/events/${id}/`,
    DELETE: (id) => `/events/${id}/`,
    CATEGORIES: "/events/categories/",
    UPCOMING: "/events/upcoming/",
    BY_CATEGORY: (category) => `/events/category/${category}/`,
    BY_DATE_RANGE: "/events/date-range/",
    SEARCH: "/events/search/",
    PUBLIC: "/events/public/",
    MY_EVENTS: "/events/my-events/",
    BULK_CREATE: "/events/bulk-create/",
    BULK_UPDATE: "/events/bulk-update/",
    BULK_DELETE: "/events/bulk-delete/",
    IMAGE_UPLOAD: (id) => `/events/${id}/image/`,
    QR_CODE: (id) => `/events/${id}/qr-code/`,
    ANALYTICS: (id) => `/events/${id}/analytics/`,
  },

  // Attendance endpoints
  ATTENDANCE: {
    LIST: "/attendance/",
    RECORD: "/attendance/record/",
    BY_EVENT: (eventId) => `/attendance/event/${eventId}/`,
    BY_USER: (userId) => `/attendance/user/${userId}/`,
    BY_DATE: "/attendance/date/",
    STATS: "/attendance/stats/",
    UPDATE: (id) => `/attendance/${id}/`,
    DELETE: (id) => `/attendance/${id}/`,
    BULK_RECORD: "/attendance/bulk-record/",
    VERIFY_LOCATION: "/attendance/verify-location/",
    QR_SCAN: "/attendance/qr-scan/",
    SELFIE_VERIFY: "/attendance/selfie-verify/",
    EXPORT: "/attendance/export/",
    REPORT: "/attendance/report/",
    MY_ATTENDANCE: "/attendance/my-attendance/",
  },

  // University data endpoints
  UNIVERSITY: {
    COLLEGES: "/university/colleges/",
    DEPARTMENTS: "/university/departments/",
    COURSES: "/university/courses/",
    BY_COLLEGE: (collegeId) => `/university/colleges/${collegeId}/departments/`,
    BY_DEPARTMENT: (deptId) => `/university/departments/${deptId}/courses/`,
    STRUCTURE: "/university/structure/",
  },

  // Reports endpoints
  REPORTS: {
    ATTENDANCE: "/reports/attendance/",
    EVENTS: "/reports/events/",
    USERS: "/reports/users/",
    ANALYTICS: "/reports/analytics/",
    EXPORT: "/reports/export/",
    DASHBOARD: "/reports/dashboard/",
    CUSTOM: "/reports/custom/",
  },

  // File upload endpoints
  UPLOADS: {
    IMAGE: "/uploads/image/",
    DOCUMENT: "/uploads/document/",
    AVATAR: "/uploads/avatar/",
    EVENT_IMAGE: "/uploads/event-image/",
    BULK_IMPORT: "/uploads/bulk-import/",
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: "/notifications/",
    MARK_READ: (id) => `/notifications/${id}/mark-read/`,
    MARK_ALL_READ: "/notifications/mark-all-read/",
    UNREAD_COUNT: "/notifications/unread-count/",
    SETTINGS: "/notifications/settings/",
  },

  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: "/analytics/dashboard/",
    EVENTS: "/analytics/events/",
    ATTENDANCE: "/analytics/attendance/",
    USERS: "/analytics/users/",
    EXPORT: "/analytics/export/",
  },

  // System endpoints
  SYSTEM: {
    HEALTH: "/system/health/",
    VERSION: "/system/version/",
    CONFIG: "/system/config/",
    LOGS: "/system/logs/",
  },

  // Campus Management endpoints (NEW for Story 1.3)
  CAMPUS: {
    LIST: "/campuses/",
    DETAIL: (id) => `/campuses/${id}/`,
    DEPARTMENTS: (id) => `/campuses/${id}/departments/`,
    STATISTICS: (id) => `/campuses/${id}/statistics/`,
    USERS: (id) => `/campuses/${id}/users/`,
    EVENTS: (id) => `/campuses/${id}/events/`,
    ATTENDANCE: (id) => `/campuses/${id}/attendance/`,
    ANALYTICS: (id) => `/campuses/${id}/analytics/`,
    SETTINGS: (id) => `/campuses/${id}/settings/`,
  },
};

// API Request/Response Patterns
export const API_PATTERNS = {
  // Standard list response
  LIST_RESPONSE: {
    count: 0,
    next: null,
    previous: null,
    results: [],
  },

  // Standard error response
  ERROR_RESPONSE: {
    success: false,
    message: "",
    errors: {},
    status_code: 400,
  },

  // Standard success response
  SUCCESS_RESPONSE: {
    success: true,
    message: "",
    data: {},
    status_code: 200,
  },

  // Campus-aware response (NEW for Story 1.3)
  CAMPUS_AWARE_RESPONSE: {
    success: true,
    message: "",
    data: {},
    campus_context: {
      user_campus_id: null,
      accessible_campuses: [],
      cross_campus_access: false,
    },
    status_code: 200,
  },
};

// API Request Delays (for mock services)
export const API_DELAYS = {
  // Authentication
  LOGIN: 1000,
  LOGOUT: 500,
  REGISTER: 1200,
  VERIFY_TOKEN: 300,

  // Events
  FETCH_EVENTS: 800,
  CREATE_EVENT: 1000,
  UPDATE_EVENT: 800,
  DELETE_EVENT: 500,
  FETCH_CATEGORIES: 500,

  // Attendance
  RECORD_ATTENDANCE: 1200,
  FETCH_ATTENDANCE: 600,
  UPDATE_ATTENDANCE: 800,

  // Campus operations (NEW for Story 1.3)
  FETCH_CAMPUSES: 500,
  FETCH_CAMPUS_DETAILS: 400,
  FETCH_CAMPUS_STATISTICS: 700,

  // General
  DEFAULT: 500,
  QUICK: 200,
  SLOW: 2000,
};

// API Error Messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Network connection failed. Please check your internet connection.",
  TIMEOUT_ERROR: "Request timeout. Please try again.",
  SERVER_ERROR: "Server error occurred. Please try again later.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access forbidden.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UNKNOWN_ERROR: "An unknown error occurred. Please try again.",

  // Specific errors
  INVALID_CREDENTIALS: "Invalid email or password.",
  USER_NOT_FOUND: "User not found.",
  EVENT_NOT_FOUND: "Event not found.",
  ATTENDANCE_EXISTS: "Attendance already recorded for this event.",
  INVALID_QR_CODE: "Invalid or expired QR code.",
  LOCATION_VERIFICATION_FAILED:
    "Location verification failed. You must be at the event location.",

  // File upload errors
  FILE_TOO_LARGE: "File size exceeds the maximum limit.",
  INVALID_FILE_TYPE: "Invalid file type. Please select a valid file.",
  UPLOAD_FAILED: "File upload failed. Please try again.",
  
  // Campus-specific errors (NEW for Story 1.3)
  CAMPUS_ACCESS_DENIED: "Access denied for this campus.",
  CAMPUS_NOT_FOUND: "Campus not found or unavailable.",
  INVALID_CAMPUS_CONTEXT: "Invalid campus context provided.",
  CAMPUS_ISOLATION_VIOLATION: "Operation violates campus data isolation.",
};

// Token management
export const TOKEN_CONFIG = {
  STORAGE_KEY: "eas_auth_token",
  REFRESH_STORAGE_KEY: "eas_refresh_token",
  USER_STORAGE_KEY: "eas_auth_user",
  EXPIRES_KEY: "eas_token_expires",

  // Token patterns
  MOCK_PREFIX: "mock_token_",
  JWT_PREFIX: "Bearer ",

  // Expiration times (in milliseconds)
  ACCESS_TOKEN_EXPIRY: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  REMEMBER_ME_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// API Rate Limiting
export const RATE_LIMITS = {
  DEFAULT: 60, // requests per minute
  AUTH: 30, // auth requests per minute
  UPLOAD: 10, // upload requests per minute
  EXPORT: 5, // export requests per minute
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],

  // File size limits by type
  LIMITS: {
    AVATAR: 2 * 1024 * 1024, // 2MB
    EVENT_IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
  },
};

// Cache Configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  USER_DATA_TTL: 30 * 60 * 1000, // 30 minutes
  EVENT_DATA_TTL: 10 * 60 * 1000, // 10 minutes
  STATIC_DATA_TTL: 60 * 60 * 1000, // 1 hour
};

// Campus Parameter Injection Utilities (NEW for Story 1.3)
export const CAMPUS_UTILS = {
  /**
   * Inject campus parameter into URL query string
   * @param {string} baseUrl - Base URL
   * @param {number|string} campusId - Campus ID to inject
   * @param {Object} existingParams - Existing query parameters
   * @returns {string} URL with campus parameter
   */
  injectCampusParam: (baseUrl, campusId, existingParams = {}) => {
    if (!campusId || campusId === "default") return baseUrl;
    
    const params = new URLSearchParams(existingParams);
    params.set("campus_id", campusId);
    
    return `${baseUrl}?${params.toString()}`;
  },

  /**
   * Build campus-aware API endpoint
   * @param {string} endpoint - Base endpoint
   * @param {Object} campusContext - Campus context from AuthContext
   * @param {Object} queryParams - Additional query parameters
   * @returns {string} Campus-aware endpoint URL
   */
  buildCampusAwareEndpoint: (endpoint, campusContext, queryParams = {}) => {
    if (!campusContext?.campusId) return endpoint;
    
    const params = {
      ...queryParams,
      campus_id: campusContext.campusId,
    };
    
    return CAMPUS_UTILS.injectCampusParam(endpoint, campusContext.campusId, params);
  },

  /**
   * Extract campus context from API response
   * @param {Object} response - API response
   * @returns {Object} Campus context or null
   */
  extractCampusContext: (response) => {
    return response?.campus_context || null;
  },

  /**
   * Validate campus access for operation
   * @param {Object} campusContext - User's campus context
   * @param {number} targetCampusId - Target campus ID
   * @returns {boolean} Whether access is allowed
   */
  validateCampusAccess: (campusContext, targetCampusId) => {
    if (!campusContext || !targetCampusId) return false;
    
    // Admin with cross-campus access can access any campus
    if (campusContext.canAccessMultipleCampuses) return true;
    
    // User can access their own campus
    if (campusContext.campusId === targetCampusId) return true;
    
    // Check if campus is in accessible list
    return campusContext.accessibleCampusIds?.includes(targetCampusId) || false;
  },
};

export default {
  API_CONFIG,
  HTTP_METHODS,
  STATUS_CODES,
  RESPONSE_TYPES,
  API_ENDPOINTS,
  API_PATTERNS,
  API_DELAYS,
  API_ERROR_MESSAGES,
  TOKEN_CONFIG,
  RATE_LIMITS,
  UPLOAD_CONFIG,
  CACHE_CONFIG,
  CAMPUS_UTILS, // NEW for Story 1.3
};
