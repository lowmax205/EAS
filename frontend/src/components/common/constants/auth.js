/**
 * Authentication-related constants and configurations
 */

// Authentication constants
export const AUTH_STORAGE_KEYS = {
  TOKEN: "eas_auth_token",
  USER: "eas_auth_user",
};

// Authentication error messages
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  SERVICE_UNAVAILABLE: "Authentication service temporarily unavailable",
  LOGIN_FAILED: "Login failed",
  PARSING_ERROR: "Error parsing stored user data",
};

// Token generation patterns
export const TOKEN_PATTERNS = {
  MOCK: "mock_token_",
};
