/**
 * Production-Ready API Client Configuration
 * Implements thesis requirements with production-safe error handling
 * 
 * Features:
 * - Django backend integration
 * - Student authentication system
 * - QR code attendance tracking
 * - Campus-aware API calls
 * - Production-safe logging
 */

import axios from 'axios';
import { logger, apiLogger, authLogger } from '../lib/logger';

/**
 * Environment-based configuration
 */
const getApiConfig = () => {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  
  return {
    baseURL: isDev 
      ? (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1')
      : (import.meta.env.VITE_API_BASE_URL || 'https://your-production-domain.com/api/v1'),
    timeout: isDev ? 30000 : 15000,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: false
  };
};

/**
 * Create axios instance with production-ready configuration
 */
const axiosInstance = axios.create(getApiConfig());

/**
 * Request interceptor for authentication and campus context
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const startTime = Date.now();
    config.metadata = { startTime };
    
    // Add authentication token
    const token = localStorage.getItem('eas_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add campus context for multi-tenant support
    const campusId = localStorage.getItem('eas_current_campus');
    if (campusId) {
      config.headers['X-Campus-ID'] = campusId;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Development-only request logging
    logger.dev('[HTTP Request]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? '[PRESENT]' : '[MISSING]'
      }
    });
    
    return config;
  },
  (error) => {
    logger.error('[HTTP Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling and logging
 */
axiosInstance.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    
    // Log successful API calls
    apiLogger.success(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url || 'unknown',
      duration
    );
    
    // Development-only response logging
    logger.dev('[HTTP Response Success]', {
      status: response.status,
      statusText: response.statusText,
      duration: `${duration}ms`,
      url: response.config.url,
      dataSize: JSON.stringify(response.data).length
    });
    
    return response;
  },
  (error) => {
    const duration = error.config?.metadata?.startTime 
      ? Date.now() - error.config.metadata.startTime 
      : 0;
    
    const errorDetails = {
      method: error.config?.method?.toUpperCase() || 'UNKNOWN',
      url: error.config?.url || 'unknown',
      status: error.response?.status,
      statusText: error.response?.statusText,
      duration: `${duration}ms`,
      message: error.message
    };
    
    // Log API errors
    apiLogger.error(
      errorDetails.method,
      errorDetails.url,
      {
        status: errorDetails.status,
        message: errorDetails.message
      },
      duration
    );
    
    // Handle specific error scenarios
    if (error.response?.status === 401) {
      handleUnauthorizedError(error);
    } else if (error.response?.status === 403) {
      handleForbiddenError(error);
    } else if (error.response?.status >= 500) {
      handleServerError(error);
    } else if (error.code === 'ECONNABORTED') {
      handleTimeoutError(error);
    } else if (!error.response) {
      handleNetworkError(error);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Handle 401 Unauthorized errors
 */
const handleUnauthorizedError = (error) => {
  logger.security('unauthorized_access', 'warn', {
    url: error.config?.url,
    method: error.config?.method
  });
  
  // Clear invalid tokens
  localStorage.removeItem('eas_auth_token');
  localStorage.removeItem('eas_refresh_token');
  localStorage.removeItem('eas_current_campus');
  
  // Clear axios authorization header
  delete axiosInstance.defaults.headers.common['Authorization'];
  
  // Log auth event
  authLogger.logout('error', null, 'Token expired or invalid');
  
  // Redirect to login if not already there
  if (!window.location.pathname.includes('/login')) {
    logger.info('Redirecting to login due to authentication error');
    window.location.href = '/login';
  }
};

/**
 * Handle 403 Forbidden errors
 */
const handleForbiddenError = (error) => {
  logger.security('access_denied', 'warn', {
    url: error.config?.url,
    method: error.config?.method,
    user: getCurrentUserId()
  });
  
  // Show user-friendly error message
  showErrorNotification('Access denied. You do not have permission to perform this action.');
};

/**
 * Handle 5xx Server errors
 */
const handleServerError = (error) => {
  logger.error('[Server Error]', {
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method
  });
  
  // Show user-friendly error message
  showErrorNotification('Server error occurred. Please try again later.');
};

/**
 * Handle request timeout errors
 */
const handleTimeoutError = (error) => {
  logger.warn('[Request Timeout]', {
    url: error.config?.url,
    method: error.config?.method,
    timeout: error.config?.timeout
  });
  
  showErrorNotification('Request timed out. Please check your connection and try again.');
};

/**
 * Handle network errors
 */
const handleNetworkError = (error) => {
  logger.error('[Network Error]', {
    message: error.message,
    code: error.code
  });
  
  showErrorNotification('Network error. Please check your internet connection.');
};

/**
 * Utility functions
 */
const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('eas_auth_user') || '{}');
    return user.id || null;
  } catch {
    return null;
  }
};

const showErrorNotification = (message) => {
  // Implement your notification system here
  // For now, we'll use a simple console log in development
  logger.dev('[Error Notification]', message);
  
  // In production, integrate with your notification library
  // Example: toast.error(message);
};

/**
 * API client wrapper with standardized error handling
 */
export class ApiClient {
  constructor(baseService = '') {
    this.baseService = baseService;
  }

  /**
   * Generic API request method
   */
  async request(method, endpoint, data = null, config = {}) {
    try {
      const url = this.baseService ? `/${this.baseService}${endpoint}` : endpoint;
      
      const requestConfig = {
        method,
        url,
        ...config
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        requestConfig.data = data;
      } else if (data && method.toUpperCase() === 'GET') {
        requestConfig.params = data;
      }

      const response = await axiosInstance(requestConfig);
      
      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers
      };

    } catch (error) {
      return {
        success: false,
        error: {
          message: error.response?.data?.message || error.message || 'Request failed',
          status: error.response?.status || 0,
          code: error.response?.data?.code || error.code,
          details: error.response?.data?.details || null
        },
        originalError: error
      };
    }
  }

  // HTTP method shortcuts
  async get(endpoint, params = null, config = {}) {
    return this.request('GET', endpoint, params, config);
  }

  async post(endpoint, data = null, config = {}) {
    return this.request('POST', endpoint, data, config);
  }

  async put(endpoint, data = null, config = {}) {
    return this.request('PUT', endpoint, data, config);
  }

  async patch(endpoint, data = null, config = {}) {
    return this.request('PATCH', endpoint, data, config);
  }

  async delete(endpoint, config = {}) {
    return this.request('DELETE', endpoint, null, config);
  }
}

/**
 * Service-specific API clients for thesis requirements
 */

// Authentication API Client
export class AuthApiClient extends ApiClient {
  constructor() {
    super('auth');
  }

  async login(credentials) {
    logger.auth('login', 'pending', { email: credentials.email });
    const result = await this.post('/login/', credentials);
    
    if (result.success) {
      // Store tokens and user data
      const { access, refresh, user } = result.data;
      localStorage.setItem('eas_auth_token', access);
      localStorage.setItem('eas_refresh_token', refresh);
      localStorage.setItem('eas_auth_user', JSON.stringify(user));
      
      // Update axios default headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      logger.auth('login', 'success', user);
    } else {
      logger.auth('login', 'error', { email: credentials.email }, result.error.message);
    }
    
    return result;
  }

  async logout() {
    logger.auth('logout', 'pending');
    
    try {
      const refreshToken = localStorage.getItem('eas_refresh_token');
      if (refreshToken) {
        await this.post('/logout/', { refresh_token: refreshToken });
      }
    } catch (error) {
      logger.dev('Logout API call failed, but continuing with local cleanup');
    }
    
    // Clear local storage
    localStorage.removeItem('eas_auth_token');
    localStorage.removeItem('eas_refresh_token');
    localStorage.removeItem('eas_auth_user');
    localStorage.removeItem('eas_current_campus');
    
    // Clear axios default headers
    delete axiosInstance.defaults.headers.common['Authorization'];
    
    logger.auth('logout', 'success');
    
    return { success: true };
  }

  async register(userData) {
    logger.auth('register', 'pending', { email: userData.email });
    const result = await this.post('/register/', userData);
    
    if (result.success) {
      logger.auth('register', 'success', { email: userData.email });
    } else {
      logger.auth('register', 'error', { email: userData.email }, result.error.message);
    }
    
    return result;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('eas_refresh_token');
    if (!refreshToken) {
      return { success: false, error: { message: 'No refresh token available' } };
    }

    const result = await this.post('/token/refresh/', { refresh: refreshToken });
    
    if (result.success && result.data.access) {
      localStorage.setItem('eas_auth_token', result.data.access);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${result.data.access}`;
      logger.auth('token_refresh', 'success');
    } else {
      logger.auth('token_refresh', 'error', null, result.error?.message);
      // Clear invalid tokens
      localStorage.removeItem('eas_auth_token');
      localStorage.removeItem('eas_refresh_token');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
    
    return result;
  }
}

// Events API Client (for QR code attendance tracking)
export class EventsApiClient extends ApiClient {
  constructor() {
    super('events');
  }

  async getEvents(filters = {}) {
    return this.get('/', filters);
  }

  async getEvent(eventId) {
    return this.get(`/${eventId}/`);
  }

  async createEvent(eventData) {
    return this.post('/', eventData);
  }

  async updateEvent(eventId, eventData) {
    return this.put(`/${eventId}/`, eventData);
  }

  async deleteEvent(eventId) {
    return this.delete(`/${eventId}/`);
  }

  async generateQRCode(eventId) {
    return this.post(`/${eventId}/generate-qr/`);
  }

  async validateQRCode(qrData) {
    return this.post('/validate-qr/', { qr_data: qrData });
  }
}

// Attendance API Client
export class AttendanceApiClient extends ApiClient {
  constructor() {
    super('attendance');
  }

  async recordAttendance(attendanceData) {
    return this.post('/record/', attendanceData);
  }

  async getAttendanceByEvent(eventId) {
    return this.get(`/event/${eventId}/`);
  }

  async getAttendanceByUser(userId) {
    return this.get(`/user/${userId}/`);
  }

  async validateAttendance(validationData) {
    return this.post('/validate/', validationData);
  }
}

// Campus API Client (for multi-tenant support)
export class CampusApiClient extends ApiClient {
  constructor() {
    super('campuses');
  }

  async getCampuses() {
    return this.get('/');
  }

  async getCampus(campusId) {
    return this.get(`/${campusId}/`);
  }

  async setCampusContext(campusId) {
    localStorage.setItem('eas_current_campus', campusId);
    axiosInstance.defaults.headers.common['X-Campus-ID'] = campusId;
    logger.campus('switch', campusId, { timestamp: new Date().toISOString() });
    return { success: true, campusId };
  }

  async getCampusStats(campusId) {
    return this.get(`/${campusId}/stats/`);
  }
}

// Export configured axios instance
export default axiosInstance;

// Export API client instances
export const authApi = new AuthApiClient();
export const eventsApi = new EventsApiClient();
export const attendanceApi = new AttendanceApiClient();
export const campusApi = new CampusApiClient();

/**
 * Initialize API clients on app startup
 */
export const initializeApiClients = () => {
  // Initialize authentication from stored tokens
  const token = localStorage.getItem('eas_auth_token');
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Initialize campus context
  const campusId = localStorage.getItem('eas_current_campus');
  if (campusId) {
    axiosInstance.defaults.headers.common['X-Campus-ID'] = campusId;
  }
  
  logger.info('API clients initialized successfully');
};

/**
 * Health check for API connectivity
 */
export const performHealthCheck = async () => {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    services: {}
  };

  try {
    const response = await axiosInstance.get('/health/');
    healthCheck.status = 'healthy';
    healthCheck.services.api = { status: 'up', response_time: response.headers['x-response-time'] };
  } catch (error) {
    healthCheck.status = 'unhealthy';
    healthCheck.services.api = { 
      status: 'down', 
      error: error.message,
      status_code: error.response?.status 
    };
  }

  logger.info('Health check completed', healthCheck);
  return healthCheck;
};
