import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../layout/ThemeContext";
import { THEME_VALUES, THEME_LABELS } from "../common/constants/theme";
import Button from "./Button";

/**
 * Enhanced ThemeToggle component with improved theme-aware styling
 */
const ThemeToggle = ({
  className = "",
  showLabel = false,
  variant: _variant = "button", // Currently only button variant is supported
}) => {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  // Get current theme icon based on resolved theme for better visual feedback
  const getCurrentIcon = () => {
    // Show the icon that represents what the user is currently seeing
    if (resolvedTheme === THEME_VALUES.DARK) {
      return <Moon className="w-5 h-5 text-current" />;
    } else {
      return <Sun className="w-5 h-5 text-current" />;
    }
  };

  // Get current theme label with visual indicator
  const getCurrentLabel = () => {
    const currentThemeLabel = THEME_LABELS[theme] || THEME_LABELS.light;
    if (theme === THEME_VALUES.SYSTEM) {
      return `${currentThemeLabel} (${THEME_LABELS[resolvedTheme] || "Light"})`;
    }
    return currentThemeLabel;
  };

  // Handle theme toggle
  const handleToggle = () => {
    toggleTheme();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className={`flex items-center gap-2 hover:border-primary-500 dark:hover:border-primary-400 ${className}`}
      ariaLabel={`Switch theme. Current: ${getCurrentLabel()}`}
      title={`Current theme: ${getCurrentLabel()}`}
    >
      <div className="flex items-center gap-1">
        {getCurrentIcon()}
        {theme === THEME_VALUES.SYSTEM && (
          <Monitor className="w-3 h-3 text-current opacity-60" />
        )}
      </div>
      {showLabel && (
        <span className="text-sm text-current">{getCurrentLabel()}</span>
      )}
    </Button>
  );
};

export default ThemeToggle;
