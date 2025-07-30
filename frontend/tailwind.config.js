/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // EAS Project Primary Colors (Light Theme)
        primary: {
          // Core colors used throughout the app
          400: "#4ade80", // Used in icons and accents
          500: "#22c55e", // Primary color for light theme
          600: "#16a34a", // Primary color for dark theme (deeper version)
          700: "#166534", // Secondary color for light theme
        },
        // EAS Project Secondary/Neutral Colors
        secondary: {
          // Core colors used throughout the app
          100: "#f1f5f9", // Used in hover states and backgrounds
          200: "#e2e8f0", // Used in components and progress bars
          300: "#cbd5e1", // Used in button variants
          500: "#64748b", // Used in text and accents
          600: "#475569", // Used in button variants
          700: "#334155", // Used in backgrounds and text
          800: "#1e293b", // Used in dark theme cards and hover states
          900: "#0f172a", // Used in text and dark theme
        },
        // EAS Project Specific Colors
        eas: {
          // Light Theme Colors
          "light-primary": "#22c55e",
          "light-secondary": "#166534",
          "light-accent": "#dcfce7",
          "light-neutral": "#9ca3af",
          "light-text": "#000000",
          "light-bg": "#ffffff",
          "light-card": "#ffffff",

          // Dark Theme Colors
          "dark-primary": "#16a34a",
          "dark-secondary": "#14532d",
          "dark-accent": "#1e293b",
          "dark-neutral": "#64748b",
          "dark-highlight": "#064e3b",
          "dark-text": "#f8fafc",
          "dark-bg": "#0f172a",
          "dark-card": "#1e293b",
        },
        // Semantic colors for better component usage
        background: {
          light: "#ffffff",
          dark: "#0f172a",
        },
        foreground: {
          light: "#000000",
          dark: "#f8fafc",
        },
        card: {
          light: "#ffffff",
          dark: "#1e293b",
        },
        border: {
          light: "#e5e7eb",
          dark: "#374151",
        },
        input: {
          light: "#ffffff",
          dark: "#1e293b",
        },
        ring: {
          light: "#22c55e",
          dark: "#16a34a",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      // Custom spacing for EAS components
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      // Custom border radius
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      // Custom box shadows for light/dark themes
      boxShadow: {
        light:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "light-md":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "light-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        dark: "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)",
        "dark-md":
          "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
        "dark-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
      },
      // Animation for theme transitions
      transitionProperty: {
        theme:
          "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform",
      },
      transitionDuration: {
        theme: "200ms",
      },
    },
  },
  plugins: [
    // Plugin to add theme-aware utilities
    function ({ addUtilities, theme }) {
      const newUtilities = {
        ".theme-transition": {
          "transition-property": theme("transitionProperty.theme"),
          "transition-duration": theme("transitionDuration.theme"),
          "transition-timing-function": "ease-in-out",
        },
        ".bg-theme": {
          "@apply bg-background-light dark:bg-background-dark theme-transition":
            {},
        },
        ".text-theme": {
          "@apply text-foreground-light dark:text-foreground-dark theme-transition":
            {},
        },
        ".card-theme": {
          "@apply bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark theme-transition":
            {},
        },
        ".input-theme": {
          "@apply bg-input-light dark:bg-input-dark border-border-light dark:border-border-dark text-theme theme-transition":
            {},
        },
        ".shadow-theme": {
          "@apply shadow-light dark:shadow-dark theme-transition": {},
        },
        ".shadow-theme-md": {
          "@apply shadow-light-md dark:shadow-dark-md theme-transition": {},
        },
        ".shadow-theme-lg": {
          "@apply shadow-light-lg dark:shadow-dark-lg theme-transition": {},
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
