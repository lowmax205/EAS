/**
 * Custom hook for comprehensive logging
 * Provides easy-to-use logging functions for components
 *
 * Usage:
 * const logger = useLogger('ComponentName');
 * logger.userInteraction('button_click', { buttonId: 'submit' });
 * logger.navigation('/dashboard', 'menu_click');
 * logger.stateChange('isLoading', false, true);
 */

import { useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  logUserInteraction,
  logNavigation,
  logApiCall,
  logStateChange,
  logAuthEvent,
  logFormEvent,
  logPerformance,
  logThemeChange,
  devLog,
  devError,
  devWarn,
  devInfo,
} from "./devLogger";

/**
 * Custom hook for component-specific logging
 * @param {string} componentName - Name of the component using the logger
 * @param {Object} options - Configuration options
 * @param {boolean} options.logMountUnmount - Whether to log mount/unmount events (default: false)
 * @returns {Object} Logger functions
 */
export const useLogger = (componentName, options = {}) => {
  const { logMountUnmount = false } = options;
  const location = useLocation();
  const componentMountTime = useRef(Date.now());
  const renderCount = useRef(0);

  // Track component renders
  renderCount.current += 1;

  // Log component mount only if explicitly enabled
  useEffect(() => {
    if (logMountUnmount) {
      devLog(`[COMPONENT_MOUNT] ${componentName}`, {
        pathname: location.pathname,
        mountTime: new Date().toISOString(),
      });

      return () => {
        const unmountTime = Date.now();
        const lifetimeMs = unmountTime - componentMountTime.current;
        devLog(`[COMPONENT_UNMOUNT] ${componentName}`, {
          pathname: location.pathname,
          lifetimeMs,
          renderCount: renderCount.current,
        });
      };
    }
  }, [componentName, location.pathname, logMountUnmount]);

  return {
    // User interaction logging
    userInteraction: useCallback(
      (action, data = null) => {
        logUserInteraction(componentName, action, data);
      },
      [componentName]
    ),

    // Navigation logging
    navigation: useCallback(
      (to, trigger = "unknown") => {
        logNavigation(location.pathname, to, trigger);
      },
      [location.pathname]
    ),

    // API call logging
    apiCall: useCallback(
      (method, endpoint, requestData, responseData, duration, status) => {
        logApiCall(
          method,
          endpoint,
          requestData,
          responseData,
          duration,
          status
        );
      },
      []
    ),

    // State change logging
    stateChange: useCallback(
      (stateName, oldValue, newValue) => {
        logStateChange(componentName, stateName, oldValue, newValue);
      },
      [componentName]
    ),

    // Auth event logging
    authEvent: useCallback((event, status, userData = null, error = null) => {
      logAuthEvent(event, status, userData, error);
    }, []),

    // Form event logging
    formEvent: useCallback((formName, event, data = null, status = "info") => {
      logFormEvent(formName, event, data, status);
    }, []),

    // Performance logging
    performance: useCallback(
      (metric, value, unit = "ms") => {
        logPerformance(componentName, metric, value, unit);
      },
      [componentName]
    ),

    // Theme change logging
    themeChange: useCallback(
      (oldTheme, newTheme) => {
        logThemeChange(oldTheme, newTheme, componentName);
      },
      [componentName]
    ),

    // General logging functions
    log: useCallback(
      (...args) => {
        devLog(`[${componentName}]`, ...args);
      },
      [componentName]
    ),

    error: useCallback(
      (...args) => {
        devError(`[${componentName}]`, ...args);
      },
      [componentName]
    ),

    warn: useCallback(
      (...args) => {
        devWarn(`[${componentName}]`, ...args);
      },
      [componentName]
    ),

    info: useCallback(
      (...args) => {
        devInfo(`[${componentName}]`, ...args);
      },
      [componentName]
    ),

    // Component-specific metrics
    renderCount: renderCount.current,
    componentLifetime: () => Date.now() - componentMountTime.current,
  };
};

/**
 * Higher-order component for automatic logging
 * @param {React.Component} WrappedComponent - Component to wrap with logging
 * @param {string} componentName - Name for logging
 * @returns {React.Component} Wrapped component with logging
 */
export const withLogger = (WrappedComponent, componentName) => {
  return function LoggedComponent(props) {
    const logger = useLogger(componentName);

    return <WrappedComponent {...props} logger={logger} />;
  };
};

// Default export for easier importing
export default useLogger;
