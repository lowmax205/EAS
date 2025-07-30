/**
 * ThemeContext - Optimized theme management context provider with system preference support
 * Features: Light/Dark/System themes, Persistent settings, System preference detection, Smooth transitions
 * Dependencies: React context, localStorage, system media queries
 * Theme Support: Complete theme management system (Light/Dark/System)
 * Global State: Theme preference, system theme detection, resolved theme
 * Mock Data Integration: N/A (UI state management only)
 * Accessibility: Respects system accessibility preferences for color schemes
 *
 * Note: Color definitions are centralized in tailwind.config.js to avoid redundancy.
 * This context provides theme switching logic and Tailwind class utilities.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { THEME_VALUES, THEME_STORAGE_KEY } from "../common/constants/theme";
import { logThemeChange } from "../common/devLogger";

/**
 * Theme context instance
 * Features: Provides theme state and controls to child components
 */
const ThemeContext = createContext();

/**
 * useTheme - Custom hook for accessing theme context
 * Features: Theme state access, Theme switching functions, Error handling
 * Dependencies: ThemeContext
 * @returns {Object} - Theme state and control functions
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

/**
 * ThemeProvider - Theme context provider component
 * Features: Theme persistence, System preference detection, Theme switching, Development logging
 * Dependencies: localStorage, system media queries, devLogger
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} - Theme provider wrapper
 */
export const ThemeProvider = ({ children }) => {
  /**
   * getInitialTheme - Get initial theme from localStorage or default to system
   * @returns {string} - Initial theme value
   */
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme || THEME_VALUES.SYSTEM;
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const previousTheme = useRef(getInitialTheme());

  /**
   * getInitialSystemTheme - Detect initial system theme preference
   * @returns {string} - System theme preference (light or dark)
   */
  const getInitialSystemTheme = () => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? THEME_VALUES.DARK
        : THEME_VALUES.LIGHT;
    }
    return THEME_VALUES.LIGHT;
  };

  const [systemTheme, setSystemThemeState] = useState(getInitialSystemTheme);

  /**
   * resolvedTheme - Current resolved theme (light or dark)
   * Features: Resolves system theme to actual light/dark value
   */
  const resolvedTheme = useMemo(() => {
    return theme === THEME_VALUES.SYSTEM ? systemTheme : theme;
  }, [theme, systemTheme]);

  /**
   * Enhanced theme change logging that prevents duplicates
   */
  useEffect(() => {
    const current = theme;
    const previous = previousTheme.current;

    // Only log if theme actually changed
    if (previous !== current) {
      logThemeChange(previous, current, "ThemeContext");
      previousTheme.current = current;
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setSystemThemeState(e.matches ? THEME_VALUES.DARK : THEME_VALUES.LIGHT);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    if (resolvedTheme === THEME_VALUES.DARK) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Save theme preference
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [resolvedTheme, theme]);

  // Theme switching functions - removed duplicate logging
  const setLightTheme = useCallback(() => {
    setTheme(THEME_VALUES.LIGHT);
  }, []);

  const setDarkTheme = useCallback(() => {
    setTheme(THEME_VALUES.DARK);
  }, []);

  const setSystemTheme = useCallback(() => {
    setTheme(THEME_VALUES.SYSTEM);
  }, []);

  const toggleTheme = useCallback(() => {
    if (theme === THEME_VALUES.LIGHT) {
      setTheme(THEME_VALUES.DARK);
    } else if (theme === THEME_VALUES.DARK) {
      setTheme(THEME_VALUES.SYSTEM);
    } else {
      setTheme(THEME_VALUES.LIGHT);
    }
  }, [theme]);

  // Get theme classes based on current resolved theme
  const getThemeClasses = useCallback(() => {
    return {
      background: "bg-white dark:bg-eas-dark-bg",
      text: "text-gray-900 dark:text-eas-dark-text",
      card: "bg-white dark:bg-eas-dark-card",
      border: "border-gray-200 dark:border-eas-dark-accent",
      primary: "text-eas-light-primary dark:text-eas-dark-primary",
      secondary: "text-eas-light-secondary dark:text-eas-dark-secondary",
      accent: "bg-eas-light-accent dark:bg-eas-dark-accent",
      // Button and interactive elements
      button: {
        primary:
          "bg-eas-light-primary hover:bg-eas-light-secondary text-white dark:bg-eas-dark-primary dark:hover:bg-eas-dark-secondary",
        secondary:
          "bg-eas-light-secondary hover:bg-eas-light-primary text-white dark:bg-eas-dark-secondary dark:hover:bg-eas-dark-primary",
        outline:
          "border border-eas-light-primary text-eas-light-primary hover:bg-eas-light-primary hover:text-white dark:border-eas-dark-primary dark:text-eas-dark-primary dark:hover:bg-eas-dark-primary dark:hover:text-white",
      },
      // Input elements
      input:
        "bg-white dark:bg-eas-dark-card border-gray-300 dark:border-eas-dark-accent text-gray-900 dark:text-eas-dark-text",
      // Focus rings
      focus:
        "focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-eas-dark-bg",
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      theme,
      resolvedTheme,
      systemTheme,
      setTheme,
      setLightTheme,
      setDarkTheme,
      setSystemTheme,
      toggleTheme,
      getThemeClasses,
    }),
    [
      theme,
      resolvedTheme,
      systemTheme,
      setLightTheme,
      setDarkTheme,
      setSystemTheme,
      toggleTheme,
      getThemeClasses,
    ]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
