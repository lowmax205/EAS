/**
 * Shared Formatting Utilities for EAS-React
 * Used across both public and protected pages for consistent data formatting
 */

// =============================================================================
// DATE FORMATTING
// =============================================================================

/**
 * Format date to readable string
 * @param {string|Date} dateString - Date string or Date object
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", { ...defaultOptions, ...options });
};

/**
 * Format date to short format (MM/DD/YYYY)
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Short formatted date
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

/**
 * Format date to relative time (e.g., "2 days ago", "in 3 hours")
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  const now = new Date();
  const diffInSeconds = Math.floor((date - now) / 1000);
  const absDiff = Math.abs(diffInSeconds);

  // Define time intervals
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const count = Math.floor(absDiff / seconds);
    if (count >= 1) {
      const suffix = diffInSeconds < 0 ? "ago" : "from now";
      const plural = count > 1 ? "s" : "";
      return `${count} ${unit}${plural} ${suffix}`;
    }
  }

  return "just now";
};

/**
 * Format date and time together
 * @param {string|Date} dateString - Date string or Date object
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleString("en-US", { ...defaultOptions, ...options });
};

// =============================================================================
// TIME FORMATTING
// =============================================================================

/**
 * Format time string to 12-hour format
 * @param {string} timeString - Time string (HH:MM format)
 * @returns {string} Formatted time with AM/PM
 */
export const formatTime = (timeString) => {
  if (!timeString) return "N/A";

  try {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Invalid Time";
  }
};

/**
 * Format time to 24-hour format
 * @param {string} timeString - Time string
 * @returns {string} 24-hour formatted time
 */
export const formatTime24Hour = (timeString) => {
  if (!timeString) return "N/A";

  try {
    const [hours, minutes] = timeString.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  } catch {
    return "Invalid Time";
  }
};

/**
 * Format duration in minutes to readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "2h 30m")
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return "N/A";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}h ${remainingMinutes}m`;
};

// =============================================================================
// NUMBER FORMATTING
// =============================================================================

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @returns {string} Formatted number with commas
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return "N/A";
  if (isNaN(number)) return "Invalid Number";

  return number.toLocaleString("en-US");
};

/**
 * Format percentage
 * @param {number} value - Value to convert to percentage
 * @param {number} total - Total value for percentage calculation
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, total, decimals = 1) => {
  if (!value || !total || total === 0) return "0%";

  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// =============================================================================
// TEXT FORMATTING
// =============================================================================

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Title case text
 */
export const formatTitleCase = (text) => {
  if (!text) return "";

  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis
 */
export const formatTruncate = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength).trim() + "...";
};

/**
 * Convert text to URL-friendly slug
 * @param {string} text - Text to convert
 * @returns {string} URL slug
 */
export const formatSlug = (text) => {
  if (!text) return "";

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Format initials from full name
 * @param {string} fullName - Full name
 * @param {number} maxInitials - Maximum number of initials (default: 2)
 * @returns {string} Formatted initials
 */
export const formatInitials = (fullName, maxInitials = 2) => {
  if (!fullName) return "";

  return fullName
    .split(" ")
    .filter((name) => name.length > 0)
    .slice(0, maxInitials)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");
};

// =============================================================================
// STATUS & EVENT FORMATTING
// =============================================================================

/**
 * Format event status with proper styling classes
 * @param {string} status - Event status
 * @returns {Object} Status object with label and styling
 */
export const formatEventStatus = (status) => {
  const statusConfig = {
    upcoming: {
      label: "Upcoming",
      bgClass: "bg-blue-100 dark:bg-blue-900",
      textClass: "text-blue-800 dark:text-blue-200",
      dotClass: "bg-blue-500",
    },
    ongoing: {
      label: "Ongoing",
      bgClass: "bg-green-100 dark:bg-green-900",
      textClass: "text-green-800 dark:text-green-200",
      dotClass: "bg-green-500",
    },
    completed: {
      label: "Completed",
      bgClass: "bg-gray-100 dark:bg-gray-700",
      textClass: "text-gray-800 dark:text-gray-200",
      dotClass: "bg-gray-500",
    },
    cancelled: {
      label: "Cancelled",
      bgClass: "bg-red-100 dark:bg-red-900",
      textClass: "text-red-800 dark:text-red-200",
      dotClass: "bg-red-500",
    },
  };

  return statusConfig[status?.toLowerCase()] || statusConfig.upcoming;
};

/**
 * Format attendance status
 * @param {string} status - Attendance status
 * @returns {Object} Status object with label and styling
 */
export const formatAttendanceStatus = (status) => {
  const statusConfig = {
    present: {
      label: "Present",
      bgClass: "bg-green-100 dark:bg-green-900",
      textClass: "text-green-800 dark:text-green-200",
    },
    absent: {
      label: "Absent",
      bgClass: "bg-red-100 dark:bg-red-900",
      textClass: "text-red-800 dark:text-red-200",
    },
    late: {
      label: "Late",
      bgClass: "bg-yellow-100 dark:bg-yellow-900",
      textClass: "text-yellow-800 dark:text-yellow-200",
    },
    excused: {
      label: "Excused",
      bgClass: "bg-blue-100 dark:bg-blue-900",
      textClass: "text-blue-800 dark:text-blue-200",
    },
  };

  return statusConfig[status?.toLowerCase()] || statusConfig.absent;
};

// =============================================================================
// UNIVERSITY-SPECIFIC FORMATTING
// =============================================================================

/**
 * Format course name with abbreviation
 * @param {Object} course - Course object with name and abbreviation
 * @returns {string} Formatted course display name
 */
export const formatCourseName = (course) => {
  if (!course) return "N/A";

  if (course.abbreviation && course.name) {
    return `${course.abbreviation} - ${course.name}`;
  }

  return course.name || course.abbreviation || "Unknown Course";
};

/**
 * Format department name with abbreviation
 * @param {Object} department - Department object
 * @returns {string} Formatted department display name
 */
export const formatDepartmentName = (department) => {
  if (!department) return "N/A";

  if (department.abbreviation && department.name) {
    return `${department.name} (${department.abbreviation})`;
  }

  return department.name || department.abbreviation || "Unknown Department";
};

/**
 * Format semester information
 * @param {string} semester - Semester value
 * @param {number|string} year - Academic year
 * @returns {string} Formatted semester display
 */
export const formatSemester = (semester, year) => {
  if (!semester) return "N/A";

  const semesterLabels = {
    "1st": "1st Semester",
    "2nd": "2nd Semester",
    summer: "Summer Term",
  };

  const semesterLabel = semesterLabels[semester] || semester;

  if (year) {
    return `${semesterLabel} ${year}`;
  }

  return semesterLabel;
};

/**
 * Get semester from date (SNSU academic calendar)
 * @param {string|Date} dateString - Date to evaluate
 * @returns {string} Semester ('1st', '2nd', 'summer')
 */
export const getSemesterFromDate = (dateString) => {
  if (!dateString) return "unknown";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "unknown";

  const month = date.getMonth() + 1; // getMonth() returns 0-11

  if (month >= 8 && month <= 12) {
    return "1st"; // August to December
  } else if (month >= 1 || month <= 5) {
    return "2nd"; // January to May
  } else {
    return "summer"; // June to July
  }
};

// =============================================================================
// LOCATION & COORDINATES FORMATTING
// =============================================================================

/**
 * Format coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} precision - Decimal precision (default: 6)
 * @returns {string} Formatted coordinates
 */
export const formatCoordinates = (lat, lng, precision = 6) => {
  if (!lat || !lng) return "N/A";

  return `${Number(lat).toFixed(precision)}, ${Number(lng).toFixed(precision)}`;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - First latitude
 * @param {number} lng1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lng2 - Second longitude
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Format distance for display
 * @param {number} distanceInMeters - Distance in meters
 * @returns {string} Formatted distance with appropriate unit
 */
export const formatDistance = (distanceInMeters) => {
  if (!distanceInMeters || distanceInMeters < 0) return "N/A";

  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m`;
  } else {
    return `${(distanceInMeters / 1000).toFixed(1)}km`;
  }
};

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Check if date is in the past
 * @param {string|Date} dateString - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isDateInPast = (dateString) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  const now = new Date();

  return date < now;
};

/**
 * Check if date is today
 * @param {string|Date} dateString - Date to check
 * @returns {boolean} True if date is today
 */
export const isDateToday = (dateString) => {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();

  return date.toDateString() === today.toDateString();
};

/**
 * Check if time is within event duration
 * @param {string} currentTime - Current time (HH:MM)
 * @param {string} startTime - Event start time (HH:MM)
 * @param {string} endTime - Event end time (HH:MM)
 * @returns {boolean} True if current time is within event duration
 */
export const isTimeWithinEvent = (currentTime, startTime, endTime) => {
  if (!currentTime || !startTime || !endTime) return false;

  const current = new Date(`2000-01-01T${currentTime}:00`);
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);

  return current >= start && current <= end;
};

// =============================================================================
// EXPORT DEFAULT OBJECT (for convenience)
// =============================================================================

const formatters = {
  // Date & Time
  formatDate,
  formatDateShort,
  formatRelativeTime,
  formatTime,
  formatTime24Hour,
  formatDuration,
  formatDateTime,

  // Numbers
  formatNumber,
  formatPercentage,
  formatFileSize,

  // Text
  formatTitleCase,
  formatTruncate,
  formatSlug,
  formatInitials,

  // Status
  formatEventStatus,
  formatAttendanceStatus,

  // University
  formatCourseName,
  formatDepartmentName,
  formatSemester,
  getSemesterFromDate,

  // Location
  formatCoordinates,
  calculateDistance,
  formatDistance,

  // Validation
  isDateInPast,
  isDateToday,
  isTimeWithinEvent,
};

export default formatters;
