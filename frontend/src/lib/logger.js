/**
 * Production-Safe Logger Utility
 * Replaces all console.log statements with environment-aware logging
 * Critical Rule: "Never use console.log in production code - use logger"
 * 
 * Usage:
 * import { logger } from '@/lib/logger';
 * logger.dev('Debug message');
 * logger.info('Info message');
 * logger.error('Error message');
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

/**
 * Logger class with environment-aware methods
 */
class Logger {
  constructor() {
    this.isDev = isDevelopment;
    this.isProd = isProduction;
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
  }

  /**
   * Development-only logging
   * @param {...any} args - Arguments to log
   */
  dev(...args) {
    if (this.isDev) {
      console.log('[DEV]', ...args);
    }
  }

  /**
   * Debug logging (development only)
   * @param {...any} args - Arguments to log
   */
  debug(...args) {
    if (this.isDev) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * Info logging (always logs but sanitized in production)
   * @param {...any} args - Arguments to log
   */
  info(...args) {
    if (this.isDev) {
      console.info('[INFO]', ...args);
    } else {
      // In production, log only essential info to external service
      this._logToService('info', args);
    }
  }

  /**
   * Warning logging (always logs)
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    if (this.isDev) {
      console.warn('[WARN]', ...args);
    } else {
      console.warn('[WARN]', this._sanitizeForProduction(args));
      this._logToService('warn', args);
    }
  }

  /**
   * Error logging (always logs)
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    if (this.isDev) {
      console.error('[ERROR]', ...args);
    } else {
      console.error('[ERROR]', this._sanitizeForProduction(args));
      this._logToService('error', args);
    }
  }

  /**
   * API call logging with structured format
   * @param {string} method - HTTP method
   * @param {string} url - API endpoint
   * @param {object} data - Request data
   * @param {object} response - Response data
   * @param {number} duration - Request duration
   * @param {string} status - Request status
   */
  api(method, url, data = null, response = null, duration = null, status = 'success') {
    const logData = {
      timestamp: new Date().toISOString(),
      method,
      url,
      status,
      duration: duration ? `${duration}ms` : null,
      ...(this.isDev && { data, response })
    };

    if (this.isDev) {
      const statusColor = status === 'success' ? '✅' : status === 'error' ? '❌' : '⚠️';
      console.log(`[API] ${statusColor} ${method} ${url}`, logData);
    } else if (status === 'error') {
      this._logToService('error', [`API Error: ${method} ${url}`, { status, duration }]);
    }
  }

  /**
   * Service call logging
   * @param {string} service - Service name
   * @param {string} method - Service method
   * @param {any} params - Parameters
   * @param {string} status - Call status
   * @param {number} duration - Duration in ms
   */
  service(service, method, params = null, status = 'pending', duration = null) {
    const logData = {
      timestamp: new Date().toISOString(),
      service,
      method,
      status,
      duration: duration ? `${duration}ms` : null,
      ...(this.isDev && { params })
    };

    if (this.isDev) {
      const statusEmoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '🔄';
      console.log(`[SERVICE] ${statusEmoji} ${service}.${method}`, logData);
    } else if (status === 'error') {
      this._logToService('error', [`Service Error: ${service}.${method}`, { status, duration }]);
    }
  }

  /**
   * Authentication event logging
   * @param {string} event - Auth event type
   * @param {string} status - Event status
   * @param {object} userData - User data (sanitized)
   * @param {string} error - Error message if any
   */
  auth(event, status, userData = null, error = null) {
    const sanitizedUserData = userData ? {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      campus: userData.campus_id
    } : null;

    const logData = {
      timestamp: new Date().toISOString(),
      event,
      status,
      userData: sanitizedUserData,
      error
    };

    if (this.isDev) {
      const statusEmoji = status === 'success' ? '🔐✅' : '🔐❌';
      console.log(`[AUTH] ${statusEmoji} ${event}`, logData);
    } else {
      // Always log auth events (security critical)
      this._logToService(status === 'success' ? 'info' : 'error', [`Auth ${event}:`, { event, status, error }]);
    }
  }

  /**
   * Performance logging
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in ms
   * @param {object} metadata - Additional metadata
   */
  performance(operation, duration, metadata = {}) {
    const logData = {
      timestamp: new Date().toISOString(),
      operation,
      duration: `${duration}ms`,
      ...metadata
    };

    if (this.isDev) {
      const perfColor = duration > 1000 ? '🐌' : duration > 500 ? '⚠️' : '⚡';
      console.log(`[PERF] ${perfColor} ${operation}`, logData);
    } else if (duration > 2000) {
      // Log slow operations in production
      this._logToService('warn', [`Slow operation: ${operation}`, { duration }]);
    }
  }

  /**
   * Security event logging
   * @param {string} event - Security event
   * @param {string} level - Security level (info, warn, error)
   * @param {object} context - Event context
   */
  security(event, level = 'info', context = {}) {
    const logData = {
      timestamp: new Date().toISOString(),
      event,
      level,
      context: this._sanitizeForProduction(context)
    };

    if (this.isDev) {
      console.log(`[SECURITY] 🔒 ${event}`, logData);
    }

    // Always log security events to external service
    this._logToService(level, [`Security: ${event}`, logData]);
  }

  /**
   * Campus context logging
   * @param {string} action - Campus action
   * @param {number} campusId - Campus ID
   * @param {object} context - Additional context
   */
  campus(action, campusId, context = {}) {
    const logData = {
      timestamp: new Date().toISOString(),
      action,
      campusId,
      ...context
    };

    if (this.isDev) {
      console.log(`[CAMPUS] 🏛️ ${action}`, logData);
    }
  }

  /**
   * Sanitize data for production logging
   * @param {any} data - Data to sanitize
   * @returns {any} Sanitized data
   */
  _sanitizeForProduction(data) {
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      // Remove sensitive fields
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          sanitized[field] = '[REDACTED]';
        }
      });
      
      return sanitized;
    }
    
    return data;
  }

  /**
   * Log to external service (implement based on your logging service)
   * @param {string} level - Log level
   * @param {any} data - Data to log
   */
  _logToService(level, data) {
    // Implement your external logging service here
    // Examples: Sentry, LogRocket, DataDog, etc.
    
    if (window.Sentry && level === 'error') {
      window.Sentry.captureMessage(JSON.stringify(data), level);
    }
    
    // For now, store in sessionStorage for debugging
    try {
      const logs = JSON.parse(sessionStorage.getItem('app_logs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        level,
        data
      });
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      sessionStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Silently fail if storage is unavailable
    }
  }

  /**
   * Get stored logs (for debugging)
   * @returns {Array} Array of log entries
   */
  getLogs() {
    try {
      return JSON.parse(sessionStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearLogs() {
    sessionStorage.removeItem('app_logs');
  }
}

// Create singleton instance
export const logger = new Logger();

// Export individual methods for convenience
export const {
  dev: devLog,
  debug: devDebug,
  info: devInfo,
  warn: devWarn,
  error: devError
} = logger;

// Export specialized loggers
export const apiLogger = {
  call: (method, url, data, response, duration, status) => 
    logger.api(method, url, data, response, duration, status),
  success: (method, url, duration) => 
    logger.api(method, url, null, null, duration, 'success'),
  error: (method, url, error, duration) => 
    logger.api(method, url, null, error, duration, 'error')
};

export const serviceLogger = {
  call: (service, method, params, status, duration) => 
    logger.service(service, method, params, status, duration),
  success: (service, method, duration) => 
    logger.service(service, method, null, 'success', duration),
  error: (service, method, error, duration) => 
    logger.service(service, method, error, 'error', duration)
};

export const authLogger = {
  login: (status, userData, error) => logger.auth('login', status, userData, error),
  logout: (status, userData, error) => logger.auth('logout', status, userData, error),
  register: (status, userData, error) => logger.auth('register', status, userData, error),
  tokenRefresh: (status, error) => logger.auth('token_refresh', status, null, error)
};

export const campusLogger = {
  switch: (campusId, context) => logger.campus('switch', campusId, context),
  access: (campusId, action) => logger.campus('access', campusId, { action }),
  filter: (campusId, filterType) => logger.campus('filter', campusId, { filterType })
};

export default logger;
