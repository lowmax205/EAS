/**
 * Common utility constants and shared values
 * Used across multiple components and services
 */

// Common form validation constants
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  STUDENT_ID: /^\d{4}-\d{5}$/,
  PASSWORD_MIN_LENGTH: 8,
  PHONE: /^(\+63|0)?[0-9]{10}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  AVATAR: 2 * 1024 * 1024, // 2MB
  EVENT_IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  SIGNATURE: 1 * 1024 * 1024, // 1MB
};

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  IMAGES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  DOCUMENTS: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  AVATARS: ["image/jpeg", "image/png", "image/webp"],
};

// Date and time formats
export const DATE_FORMATS = {
  DISPLAY: "MMM DD, YYYY",
  INPUT: "YYYY-MM-DD",
  TIME: "HH:mm",
  DATETIME: "MMM DD, YYYY HH:mm",
  FULL: "dddd, MMMM DD, YYYY",
  SHORT: "MM/DD/YYYY",
  ISO: "YYYY-MM-DDTHH:mm:ss.sssZ",
};

// Common pagination settings
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
};

// Search and filter debounce times
export const DEBOUNCE_TIMES = {
  SEARCH: 300, // 300ms
  FILTER: 200, // 200ms
  AUTOSAVE: 1000, // 1s
  RESIZE: 150, // 150ms
};

// Common breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640, // sm
  MD: 768, // md
  LG: 1024, // lg
  XL: 1280, // xl
  "2XL": 1536, // 2xl
};

// Animation durations (in ms)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
};

// Z-index levels
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  NOTIFICATION: 1080,
};

// Common regex patterns
export const REGEX_PATTERNS = {
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA: /^[a-zA-Z]+$/,
  NUMERIC: /^[0-9]+$/,
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s]+$/,
  WHITESPACE: /\s+/g,
  MULTIPLE_SPACES: /\s{2,}/g,
};

// Common error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  PERMISSION_ERROR: "PERMISSION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  SERVER_ERROR: "SERVER_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: "eas-theme",
  AUTH_TOKEN: "eas_auth_token",
  AUTH_USER: "eas_auth_user",
  REFRESH_TOKEN: "eas_refresh_token",
  FILTERS: "eas_filters",
  PREFERENCES: "eas_preferences",
  LAST_ROUTE: "eas_last_route",
};

// Cache keys
export const CACHE_KEYS = {
  USER_DATA: "user_data",
  EVENTS_LIST: "events_list",
  ATTENDANCE_DATA: "attendance_data",
  UNIVERSITY_DATA: "university_data",
  ANALYTICS_DATA: "analytics_data",
};

// Common success messages
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: "Changes saved successfully",
  CREATE_SUCCESS: "Created successfully",
  UPDATE_SUCCESS: "Updated successfully",
  DELETE_SUCCESS: "Deleted successfully",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  REGISTER_SUCCESS: "Registration successful",
  UPLOAD_SUCCESS: "File uploaded successfully",
};

// Common loading states
export const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

// Common action types
export const ACTION_TYPES = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_SUCCESS: "SET_SUCCESS",
  CLEAR_STATE: "CLEAR_STATE",
  SET_DATA: "SET_DATA",
  UPDATE_DATA: "UPDATE_DATA",
  DELETE_DATA: "DELETE_DATA",
  RESET: "RESET",
};

// GPS and location constants
export const LOCATION_CONFIG = {
  DEFAULT_RADIUS: 50, // meters
  MAX_RADIUS: 500, // meters
  TIMEOUT: 10000, // 10 seconds
  ENABLE_HIGH_ACCURACY: true,
  MAXIMUM_AGE: 60000, // 1 minute
  DISTANCE_THRESHOLD: 10, // meters
};

// QR Code configuration
export const QR_CODE_CONFIG = {
  SIZE: 256,
  ERROR_CORRECTION_LEVEL: "M",
  MARGIN: 4,
  COLOR: {
    DARK: "#000000",
    LIGHT: "#FFFFFF",
  },
  EXPIRY_TIME: 5 * 60 * 1000, // 5 minutes
};

// Notification configuration
export const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 4000, // 4 seconds
  SUCCESS_DURATION: 3000, // 3 seconds
  ERROR_DURATION: 6000, // 6 seconds
  WARNING_DURATION: 5000, // 5 seconds
  MAX_COUNT: 5, // Maximum notifications to show
};

// Form field sizes
export const FIELD_SIZES = {
  SMALL: "sm",
  MEDIUM: "md",
  LARGE: "lg",
  EXTRA_LARGE: "xl",
};

// Common placeholders
export const PLACEHOLDERS = {
  SEARCH: "Search...",
  EMAIL: "Enter your email",
  PASSWORD: "Enter your password",
  NAME: "Enter your name",
  PHONE: "Enter your phone number",
  ADDRESS: "Enter your address",
  DESCRIPTION: "Enter description",
  TITLE: "Enter title",
  DATE: "Select date",
  TIME: "Select time",
};

// Image optimization settings
export const IMAGE_CONFIG = {
  QUALITY: 0.8,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
  THUMBNAIL_SIZE: 150,
  AVATAR_SIZE: 200,
};

export default {
  VALIDATION_PATTERNS,
  FILE_SIZE_LIMITS,
  SUPPORTED_FILE_TYPES,
  DATE_FORMATS,
  PAGINATION_CONFIG,
  DEBOUNCE_TIMES,
  BREAKPOINTS,
  ANIMATION_DURATIONS,
  Z_INDEX,
  REGEX_PATTERNS,
  ERROR_CODES,
  STORAGE_KEYS,
  CACHE_KEYS,
  SUCCESS_MESSAGES,
  LOADING_STATES,
  ACTION_TYPES,
  LOCATION_CONFIG,
  QR_CODE_CONFIG,
  NOTIFICATION_CONFIG,
  FIELD_SIZES,
  PLACEHOLDERS,
  IMAGE_CONFIG,
};
