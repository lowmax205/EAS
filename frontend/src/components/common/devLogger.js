/**
 * Development Logger Utility - Comprehensive logging system for development
 * Features: Development-only logging, User interaction tracking, Performance monitoring, Error handling
 * Dependencies: Process environment detection
 * Theme Support: N/A (logging utility)
 * Mock Data: N/A (logging utility)
 * Development Tools: Console logging with emojis and categorization
 * Production Safety: All logging disabled in production builds
 *
 * Usage:
 * import { devLog, devError, devWarn, devInfo } from '@/utils/devLogger';
 * devLog("[Component] Some debug message");
 * devError("[Service] Error occurred:", error);
 */

/* eslint-disable no-console */

const isDevelopment = import.meta.env.DEV;

/**
 * devLog - Development-only console.log
 * Features: Development-only logging, Production-safe
 * @param {...any} args - Arguments to log
 */
export const devLog = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

/**
 * devError - Development-only console.error
 * Features: Development-only error logging, Production-safe
 * @param {...any} args - Arguments to log
 */
export const devError = (...args) => {
  if (isDevelopment) {
    console.error(...args);
  }
};

/**
 * devWarn - Development-only console.warn
 * Features: Development-only warning logging, Production-safe
 * @param {...any} args - Arguments to log
 */
export const devWarn = (...args) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

/**
 * devInfo - Development-only console.info
 * Features: Development-only info logging, Production-safe
 * @param {...any} args - Arguments to log
 */
export const devInfo = (...args) => {
  if (isDevelopment) {
    console.info(...args);
  }
};

/**
 * devDebug - Development-only console.debug
 * Features: Development-only debug logging, Production-safe
 * @param {...any} args - Arguments to log
 */
export const devDebug = (...args) => {
  if (isDevelopment) {
    console.debug(...args);
  }
};

/**
 * safeError - Production-safe error logging
 * Features: Always logs errors but only detailed messages in development
 * @param {string} message - Error message
 * @param {any} error - Error object or details
 */
export const safeError = (message, error = null) => {
  if (isDevelopment) {
    console.error(message, error);
  } else {
    console.error(message);
  }
};

/**
 * logUserInteraction - User interaction logging
 * Features: Logs user interactions with component and action details, URL tracking
 * @param {string} component - Component name
 * @param {string} action - Action performed
 * @param {any} data - Additional data about the interaction
 */
export const logUserInteraction = (component, action, data = null) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      component,
      action,
      data,
      url: window.location.pathname,
      userAgent: navigator.userAgent.substring(0, 50) + "...",
    };
    console.log(`[USER_INTERACTION] ${component} -> ${action}`, logData);
  }
};

/**
 * Navigation event logging
 * Logs navigation events with route information
 * @param {string} from - Previous route
 * @param {string} to - New route
 * @param {string} trigger - What triggered the navigation
 */
export const logNavigation = (from, to, trigger = "unknown") => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.log(`[NAVIGATION] ${from} -> ${to} (${trigger})`, {
      timestamp,
      from,
      to,
      trigger,
    });
  }
};

/**
 * API call logging
 * Logs API calls with request/response details
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {any} requestData - Request data
 * @param {any} responseData - Response data
 * @param {number} duration - Request duration in ms
 * @param {string} status - Request status (success/error)
 */
export const logApiCall = (
  method,
  endpoint,
  requestData,
  responseData,
  duration,
  status
) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      method,
      endpoint,
      requestData,
      responseData,
      duration,
      status,
    };

    if (status === "success") {
      console.log(
        `[API_SUCCESS] ${method} ${endpoint} (${duration}ms)`,
        logData
      );
    } else {
      console.error(
        `[API_ERROR] ${method} ${endpoint} (${duration}ms)`,
        logData
      );
    }
  }
};

/**
 * State change logging
 * Logs state changes with before/after values
 * @param {string} component - Component name
 * @param {string} stateName - Name of the state
 * @param {any} oldValue - Previous state value
 * @param {any} newValue - New state value
 */
export const logStateChange = (component, stateName, oldValue, newValue) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.log(`[STATE_CHANGE] ${component}.${stateName}`, {
      timestamp,
      component,
      stateName,
      oldValue,
      newValue,
    });
  }
};

/**
 * Authentication event logging
 * Logs authentication-related events
 * @param {string} event - Auth event type (login, logout, register, etc.)
 * @param {string} status - Event status (success/failure)
 * @param {any} userData - User data (sanitized)
 * @param {string} error - Error message if any
 */
export const logAuthEvent = (event, status, userData = null, error = null) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    const sanitizedUserData = userData
      ? {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          name: userData.name,
        }
      : null;

    const logData = {
      timestamp,
      event,
      status,
      userData: sanitizedUserData,
      error,
    };

    if (status === "success") {
      console.log(`[AUTH_SUCCESS] ${event}`, logData);
    } else {
      console.error(`[AUTH_ERROR] ${event}`, logData);
    }
  }
};

/**
 * Form event logging
 * Logs form interactions and validations
 * @param {string} formName - Name of the form
 * @param {string} event - Form event (submit, validate, field_change, etc.)
 * @param {any} data - Form data or field information
 * @param {string} status - Event status
 */
export const logFormEvent = (formName, event, data = null, status = "info") => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      formName,
      event,
      data,
      status,
    };

    console.log(`[FORM_EVENT] ${formName} -> ${event}`, logData);
  }
};

/**
 * Performance logging
 * Logs performance metrics
 * @param {string} component - Component name
 * @param {string} metric - Performance metric name
 * @param {number} value - Metric value
 * @param {string} unit - Unit of measurement
 */
export const logPerformance = (component, metric, value, unit = "ms") => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.log(`[PERFORMANCE] ${component} ${metric}: ${value}${unit}`, {
      timestamp,
      component,
      metric,
      value,
      unit,
    });
  }
};

/**
 * Theme change logging
 * Logs theme switching events
 * @param {string} oldTheme - Previous theme
 * @param {string} newTheme - New theme
 * @param {string} component - Component that triggered the change
 */
export const logThemeChange = (oldTheme, newTheme, component) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.log(`[THEME_CHANGE] ${oldTheme} -> ${newTheme}`, {
      timestamp,
      oldTheme,
      newTheme,
      component,
    });
  }
};

/**
 * Enhanced Action Logging System
 * Comprehensive logging for all user actions and system events
 */

/**
 * Log component lifecycle events
 * @param {string} component - Component name
 * @param {string} lifecycle - Lifecycle event (mount, unmount, update)
 * @param {any} props - Component props (sanitized)
 */
export const logComponentLifecycle = (component, lifecycle, props = null) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.log(`[LIFECYCLE] ${component} -> ${lifecycle}`, {
      timestamp,
      component,
      lifecycle,
      props: props ? Object.keys(props) : null,
      url: window.location.pathname,
    });
  }
};

/**
 * Log button and UI element interactions
 * @param {string} element - Element type (button, link, input, etc.)
 * @param {string} identifier - Element identifier (id, class, text)
 * @param {string} action - Action performed (click, hover, focus, etc.)
 * @param {any} metadata - Additional metadata about the interaction
 */
export const logUIInteraction = (
  element,
  identifier,
  action,
  metadata = null
) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.log(`[UI_INTERACTION] ${element}(${identifier}) -> ${action}`, {
      timestamp,
      element,
      identifier,
      action,
      metadata,
      url: window.location.pathname,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });
  }
};

/**
 * Log modal and dialog actions
 * @param {string} modalName - Modal identifier
 * @param {string} action - Action (open, close, confirm, cancel)
 * @param {any} data - Modal data or result
 */
export const logModalAction = (modalName, action, data = null) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.log(`[MODAL] ${modalName} -> ${action}`, {
      timestamp,
      modalName,
      action,
      data,
      url: window.location.pathname,
    });
  }
};

/**
 * Log data operations (CRUD)
 * @param {string} entity - Data entity (user, event, attendance)
 * @param {string} operation - CRUD operation (create, read, update, delete)
 * @param {string} id - Entity ID
 * @param {any} data - Operation data
 * @param {string} status - Operation status (success, error, pending)
 */
export const logDataOperation = (
  entity,
  operation,
  id = null,
  data = null,
  status = "pending"
) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    const logLevel = status === "error" ? "error" : "log";
    console[logLevel](
      `[DATA_OP] ${entity}.${operation}${id ? `(${id})` : ""} -> ${status}`,
      {
        timestamp,
        entity,
        operation,
        id,
        data: data
          ? typeof data === "object"
            ? Object.keys(data)
            : data
          : null,
        status,
        url: window.location.pathname,
      }
    );
  }
};

/**
 * Log filter and search operations
 * @param {string} component - Component using filters
 * @param {string} filterType - Type of filter (search, category, date, etc.)
 * @param {any} filterValue - Filter value
 * @param {number} resultCount - Number of results after filtering
 */
export const logFilterAction = (
  component,
  filterType,
  filterValue,
  resultCount = null
) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.log(`[FILTER] ${component} -> ${filterType}`, {
      timestamp,
      component,
      filterType,
      filterValue,
      resultCount,
      url: window.location.pathname,
    });
  }
};

/**
 * Log file operations (upload, download, delete)
 * @param {string} operation - File operation (upload, download, delete)
 * @param {string} fileName - File name
 * @param {string} fileType - File type/extension
 * @param {number} fileSize - File size in bytes
 * @param {string} status - Operation status
 */
export const logFileOperation = (
  operation,
  fileName,
  fileType = null,
  fileSize = null,
  status = "pending"
) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    const logLevel = status === "error" ? "error" : "log";
    console[logLevel](`[FILE_OP] ${operation} -> ${fileName} (${status})`, {
      timestamp,
      operation,
      fileName,
      fileType,
      fileSize: fileSize ? `${(fileSize / 1024).toFixed(2)}KB` : null,
      status,
      url: window.location.pathname,
    });
  }
};

/**
 * Log route/page changes with timing
 * @param {string} fromRoute - Previous route
 * @param {string} toRoute - New route
 * @param {string} method - Navigation method (push, replace, back, forward)
 * @param {number} loadTime - Page load time in ms
 */
export const logRouteChange = (
  fromRoute,
  toRoute,
  method = "unknown",
  loadTime = null
) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.log(`[ROUTE_CHANGE] ${fromRoute} -> ${toRoute} (${method})`, {
      timestamp,
      fromRoute,
      toRoute,
      method,
      loadTime: loadTime ? `${loadTime}ms` : null,
      referrer: document.referrer || "direct",
    });
  }
};

/**
 * Log error boundaries and exception handling
 * @param {string} component - Component where error occurred
 * @param {Error} error - Error object
 * @param {any} errorInfo - Error boundary info
 * @param {string} severity - Error severity (low, medium, high, critical)
 */
export const logErrorBoundary = (
  component,
  error,
  errorInfo = null,
  severity = "high"
) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR_BOUNDARY] ${component} -> ${severity}`, {
      timestamp,
      component,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo,
      severity,
      url: window.location.pathname,
      userAgent: navigator.userAgent,
    });
  }
};

/**
 * Log context and state management operations
 * @param {string} contextName - Context name (Auth, Theme, Modal, etc.)
 * @param {string} action - Context action (update, reset, initialize)
 * @param {any} payload - Action payload
 * @param {any} previousState - Previous state (sanitized)
 */
export const logContextAction = (
  contextName,
  action,
  payload = null,
  previousState = null
) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    console.log(`[CONTEXT] ${contextName} -> ${action}`, {
      timestamp,
      contextName,
      action,
      payload: payload
        ? typeof payload === "object"
          ? Object.keys(payload)
          : payload
        : null,
      previousState: previousState
        ? typeof previousState === "object"
          ? Object.keys(previousState)
          : previousState
        : null,
      url: window.location.pathname,
    });
  }
};

/**
 * Log service and API service calls
 * @param {string} serviceName - Service name (authService, eventsService, etc.)
 * @param {string} method - Service method name
 * @param {any} params - Method parameters
 * @param {string} status - Call status (pending, success, error)
 * @param {number} duration - Call duration in ms
 */
export const logServiceCall = (
  serviceName,
  method,
  params = null,
  status = "pending",
  duration = null
) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    const logLevel = status === "error" ? "error" : "log";
    console[logLevel](`[SERVICE] ${serviceName}.${method} -> ${status}`, {
      timestamp,
      serviceName,
      method,
      params: params
        ? typeof params === "object"
          ? Object.keys(params)
          : params
        : null,
      status,
      duration: duration ? `${duration}ms` : null,
      url: window.location.pathname,
    });
  }
};

/**
 * Log validation events
 * @param {string} formName - Form or field name
 * @param {string} validationType - Type of validation (required, email, length, etc.)
 * @param {boolean} isValid - Validation result
 * @param {string} message - Validation message
 */
export const logValidation = (
  formName,
  validationType,
  isValid,
  message = null
) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    const logLevel = isValid ? "log" : "warn";
    console[logLevel](
      `[VALIDATION] ${formName}.${validationType} -> ${
        isValid ? "PASS" : "FAIL"
      }`,
      {
        timestamp,
        formName,
        validationType,
        isValid,
        message,
        url: window.location.pathname,
      }
    );
  }
};

/**
 * Comprehensive action logger - Main function to log any action
 * @param {string} category - Action category (UI, API, DATA, AUTH, etc.)
 * @param {string} action - Specific action name
 * @param {string} component - Component or context
 * @param {any} data - Action data
 * @param {string} status - Action status (success, error, pending, info)
 * @param {any} metadata - Additional metadata
 */
export const logAction = (
  category,
  action,
  component = null,
  data = null,
  status = "info",
  metadata = null
) => {
  if (isDevelopment) {
    const timestamp = new Date().toISOString();
    const logLevel =
      status === "error" ? "error" : status === "warn" ? "warn" : "log";

    const logData = {
      timestamp,
      category,
      action,
      component,
      data: data ? (typeof data === "object" ? Object.keys(data) : data) : null,
      status,
      metadata,
      url: window.location.pathname,
      sessionInfo: {
        userAgent: navigator.userAgent.substring(0, 50) + "...",
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        connection: navigator.connection?.effectiveType || "unknown",
      },
    };

    console[logLevel](
      `[${category}] ${
        component ? `${component} -> ` : ""
      }${action} (${status})`,
      logData
    );
  }
};
