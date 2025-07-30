/**
 * UI component styling constants and configurations
 */

// UI Component styling constants
export const UI_COMPONENT_STYLES = {
  button: {
    variants: {
      primary:
        "bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:ring-primary-500 text-white theme-transition",
      secondary:
        "bg-secondary-200 hover:bg-secondary-300 dark:bg-secondary-700 dark:hover:bg-secondary-600 focus:ring-secondary-500 text-secondary-800 dark:text-secondary-100 theme-transition",
      danger:
        "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:ring-red-500 text-white theme-transition",
      success:
        "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:ring-green-500 text-white theme-transition",
      outline:
        "border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-400 theme-transition",
      ghost:
        "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 theme-transition",
    },
    sizes: {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg",
    },
    base: "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
  },
  card: {
    base: "card-theme rounded-lg shadow-theme border",
    headerDivider: "border-b border-border-light dark:border-border-dark",
  },
  themeToggle: {
    button:
      "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg theme-transition bg-theme hover:bg-theme text-theme",
    dropdown:
      "inline-flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 bg-secondary-100 hover:bg-secondary-200 text-secondary-900 dark:bg-secondary-800 dark:hover:bg-secondary-700 dark:text-secondary-100",
  },
};
