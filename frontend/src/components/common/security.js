/**
 * Security Configuration - HTTPS/HTTP handling and security settings
 * This file contains security configurations for different environments
 */

// Environment detection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Security configuration based on environment
export const SECURITY_CONFIG = {
  // HTTPS enforcement
  ENFORCE_HTTPS: isProduction && import.meta.env.VITE_ENFORCE_HTTPS === "true",

  // Secure cookies
  SECURE_COOKIES:
    isProduction && import.meta.env.VITE_SECURE_COOKIES === "true",

  // Content Security Policy
  CSP_ENABLED: isProduction && import.meta.env.VITE_ENABLE_CSP === "true",

  // API Security
  API_SECURITY: {
    ENFORCE_SSL: isProduction,
    TIMEOUT: 10000,
    MAX_RETRIES: 3,
    RATE_LIMIT: {
      ENABLED: isProduction,
      REQUESTS_PER_MINUTE: 60,
    },
  },

  // Headers configuration
  SECURITY_HEADERS: {
    "Strict-Transport-Security": isProduction
      ? "max-age=31536000; includeSubDomains; preload"
      : null,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  },

  // Environment-specific URLs
  URLS: {
    API_BASE: isProduction
      ? "https://eas-university.onrender.com/api"
      : "http://localhost:8000/api",

    FRONTEND_BASE: isProduction
      ? `https://${import.meta.env.VITE_GITHUB_PAGES_CUSTOM_DOMAIN}`
      : "http://localhost:5000",
  },
};

/**
 * Validates if the current connection is secure
 * @returns {boolean} True if connection is secure or in development
 */
export const isSecureConnection = () => {
  if (isDevelopment) {
    return true; // Always allow in development
  }

  return window.location.protocol === "https:";
};

/**
 * Redirects to HTTPS if in production and not already secure
 */
export const enforceHTTPS = () => {
  if (SECURITY_CONFIG.ENFORCE_HTTPS && !isSecureConnection()) {
    const httpsUrl = window.location.href.replace("http://", "https://");
    window.location.replace(httpsUrl);
  }
};

/**
 * Gets the appropriate cookie settings based on environment
 * @returns {object} Cookie configuration
 */
export const getCookieConfig = () => {
  return {
    secure: SECURITY_CONFIG.SECURE_COOKIES,
    sameSite: isProduction ? "strict" : "lax",
    httpOnly: false, // Client-side cookies for theme/preferences
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
};

/**
 * Gets the appropriate fetch configuration based on environment
 * @returns {object} Fetch configuration
 */
export const getFetchConfig = () => {
  return {
    credentials: isProduction ? "same-origin" : "include",
    mode: "cors",
    cache: "default",
    headers: {
      "Content-Type": "application/json",
      ...(isProduction && {
        "X-Requested-With": "XMLHttpRequest",
      }),
    },
  };
};

export default SECURITY_CONFIG;
