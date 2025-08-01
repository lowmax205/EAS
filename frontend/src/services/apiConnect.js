/**
 * API Utility - Main API configuration and utilities
 * This file contains the main API configuration and utilities
 * for making HTTP requests in the EAS application
 */

import { devLog, devError, devWarn } from "../components/common/devLogger";

/**
 * Determines the appropriate API base URL based on environment
 * Production: Uses HTTPS URLs
 * Development: Uses HTTP URLs
 */
const getApiBaseUrl = () => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  if (isProduction) {
    // Production: Always use HTTPS
    return import.meta.env.VITE_API_BASE_URL;
  } else {
    // Development: Use HTTP
    return import.meta.env.VITE_API_BASE_URL;
  }
};

// Import security configuration
import SECURITY_CONFIG, {
  getFetchConfig,
} from "../components/common/security";

// API Base Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: SECURITY_CONFIG.API_SECURITY.TIMEOUT,
  BACKEND_DISABLED:
    import.meta.env.VITE_REACT_APP_BACKEND_DISABLED === "true" || true, // Force frontend-first
  ENFORCE_HTTPS: SECURITY_CONFIG.API_SECURITY.ENFORCE_SSL,
  SECURE_COOKIES: SECURITY_CONFIG.SECURE_COOKIES,
  MAX_RETRIES: SECURITY_CONFIG.API_SECURITY.MAX_RETRIES,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login/",
    LOGOUT: "/auth/logout/",
    REGISTER: "/auth/register/",
    PROFILE: "/auth/profile/",
    CHANGE_PASSWORD: "/auth/change-password/",
    VERIFY_TOKEN: "/auth/verify-token/",
    USERS: "/auth/users/",
  },

  // Events endpoints
  EVENTS: {
    LIST: "/events/",
    DETAIL: (id) => `/events/${id}/`,
    CREATE: "/events/",
    UPDATE: (id) => `/events/${id}/`,
    DELETE: (id) => `/events/${id}/`,
    CATEGORIES: "/events/categories/",
    SEARCH: "/events/search/",
    UPCOMING: "/events/upcoming/",
    BY_CATEGORY: (category) => `/events/category/${category}/`,
  },

  // Attendance endpoints
  ATTENDANCE: {
    LIST: "/attendance/",
    RECORD: "/attendance/record/",
    BY_EVENT: (eventId) => `/attendance/event/${eventId}/`,
    BY_USER: (userId) => `/attendance/user/${userId}/`,
    STATS: "/attendance/stats/",
    UPDATE: (id) => `/attendance/${id}/`,
    DELETE: (id) => `/attendance/${id}/`,
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
};

// Response Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// API Response Types
export const RESPONSE_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// Generic API request function (for future real API integration)
export const apiRequest = async (endpoint, options = {}) => {
  const {
    method = HTTP_METHODS.GET,
    data = null,
    headers = {},
    timeout = API_CONFIG.TIMEOUT,
  } = options;

  // If backend is disabled, return mock response
  if (API_CONFIG.BACKEND_DISABLED) {
    devWarn("Backend is disabled - using mock data");
    return {
      success: false,
      message: "Backend disabled - using mock services",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const config = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      signal: controller.signal,
    };

    if (data && method !== HTTP_METHODS.GET) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
    clearTimeout(timeoutId);

    const responseData = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: responseData,
        status: response.status,
      };
    } else {
      return {
        success: false,
        message: responseData.message || "Request failed",
        status: response.status,
        errors: responseData.errors || null,
      };
    }
  } catch (error) {
    devError("API Request Error:", error);

    if (error.name === "AbortError") {
      return {
        success: false,
        message: "Request timeout",
        status: 408,
      };
    }

    return {
      success: false,
      message: error.message || "Network error",
      status: 0,
    };
  }
};

// Token management utilities
export const tokenUtils = {
  getToken: () => localStorage.getItem("auth_token"),
  setToken: (token) => localStorage.setItem("auth_token", token),
  removeToken: () => localStorage.removeItem("auth_token"),

  getAuthHeaders: () => {
    const token = tokenUtils.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Response validation utilities
export const responseUtils = {
  isSuccess: (response) => response && response.success === true,
  isError: (response) => response && response.success === false,

  getErrorMessage: (response) => {
    if (response.errors && Array.isArray(response.errors)) {
      return response.errors.join(", ");
    }
    return response.message || "Unknown error occurred";
  },

  getSuccessMessage: (response) => {
    return response.message || "Operation completed successfully";
  },
};

// Request interceptors (for future use)
export const requestInterceptors = {
  // Add auth token to requests
  addAuthToken: (config) => ({
    ...config,
    headers: {
      ...config.headers,
      ...tokenUtils.getAuthHeaders(),
    },
  }),

  // Add request timestamp
  addTimestamp: (config) => ({
    ...config,
    headers: {
      ...config.headers,
      "X-Request-Time": new Date().toISOString(),
    },
  }),
};

// Development utilities
export const devUtils = {
  logRequest: (endpoint, options) => {
    if (import.meta.env.DEV) {
      devLog(`API Request: ${options.method || "GET"} ${endpoint}`, options);
    }
  },

  logResponse: (response) => {
    if (import.meta.env.DEV) {
      devLog("API Response:", response);
    }
  },
};

export default {
  API_CONFIG,
  API_ENDPOINTS,
  HTTP_METHODS,
  STATUS_CODES,
  RESPONSE_TYPES,
  apiRequest,
  tokenUtils,
  responseUtils,
  requestInterceptors,
  devUtils,
};
