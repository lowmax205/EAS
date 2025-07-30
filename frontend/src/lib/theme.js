/**
 * EAS Theme Configuration and Helpers
 * Centralized theme management for the Event Attendance System
 */

// Theme constants
export const THEME_VALUES = {
    LIGHT: "light",
    DARK: "dark",
    SYSTEM: "system",
};

// Theme storage key
export const THEME_STORAGE_KEY = "eas-theme";

// Theme labels and strings
export const THEME_LABELS = {
    light: "Light",
    dark: "Dark",
    system: "System",
};

// EAS Theme Colors Configuration
export const easTheme = {
    light: {
        primary: '#22c55e',
        secondary: '#166534',
        accent: '#DCFCE7',
        background: '#ffffff',
        card: '#ffffff',
        text: '#111827',
        border: '#e5e7eb',
        input: '#f9fafb',
        muted: '#9ca3af',
    },
    dark: {
        primary: '#16a34a',
        secondary: '#22c55e',
        accent: '#064e3b',
        background: '#0f172a',
        card: '#1e293b',
        text: '#f1f5f9',
        border: '#334155',
        input: '#1e293b',
        muted: '#64748b',
    }
};

/**
 * Get theme-aware CSS classes
 * @param {string} theme - Current theme ('light' or 'dark')
 * @returns {Object} - Object containing theme-aware CSS classes
 */
export function getThemeClasses(theme = 'light') {
    return {
        background: "bg-white dark:bg-eas-dark-bg",
        text: "text-gray-900 dark:text-eas-dark-text",
        card: "bg-white dark:bg-eas-dark-card",
        border: "border-gray-200 dark:border-eas-dark-accent",
        primary: "text-eas-light-primary dark:text-eas-dark-primary",
        secondary: "text-eas-light-secondary dark:text-eas-dark-secondary",
        accent: "bg-eas-light-accent dark:bg-eas-dark-accent",
        // Button variants
        button: {
            primary: "bg-eas-light-primary hover:bg-eas-light-secondary text-white dark:bg-eas-dark-primary dark:hover:bg-eas-dark-secondary",
            secondary: "bg-eas-light-secondary hover:bg-eas-light-primary text-white dark:bg-eas-dark-secondary dark:hover:bg-eas-dark-primary",
            outline: "border border-eas-light-primary text-eas-light-primary hover:bg-eas-light-primary hover:text-white dark:border-eas-dark-primary dark:text-eas-dark-primary dark:hover:bg-eas-dark-primary dark:hover:text-white",
        },
        // Input elements
        input: "bg-white dark:bg-eas-dark-card border-gray-300 dark:border-eas-dark-accent text-gray-900 dark:text-eas-dark-text",
        // Focus states
        focus: "focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-eas-dark-bg",
    };
}

/**
 * Calendar component constants
 */
export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Theme transition utilities
 */
export const THEME_TRANSITIONS = {
    default: "transition-colors duration-200",
    fast: "transition-colors duration-100",
    slow: "transition-colors duration-300",
    theme: "theme-transition",
};
