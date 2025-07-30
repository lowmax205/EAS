/**
 * Button - Enhanced button component with comprehensive features
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content (text, icons, etc.)
 * @param {string} props.variant - Button style variant ('primary', 'secondary', 'outline', 'ghost', 'danger')
 * @param {string} props.size - Button size ('xs', 'sm', 'md', 'lg', 'xl')
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {boolean} props.loading - Whether to show loading state with spinner
 * @param {Function} props.onClick - Click event handler
 * @param {string} props.type - Button type ('button', 'submit', 'reset')
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.ariaLabel - Accessible label for screen readers
 * @param {Object} props...rest - Additional HTML button attributes
 * @returns {JSX.Element} Button component
 */

import React from "react";
import { UI_COMPONENT_STYLES } from "../common/constants/ui";
import { logUserInteraction } from "../common/devLogger";

/**
 * Button - Enhanced button component with accessibility and interaction logging
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  ariaLabel,
  ...props
}) => {
  const baseClasses = UI_COMPONENT_STYLES.button.base;
  const variants = UI_COMPONENT_STYLES.button.variants;
  const sizes = UI_COMPONENT_STYLES.button.sizes;

  const isDisabled = disabled || loading;
  const disabledClasses = "opacity-50 cursor-not-allowed pointer-events-none";

  const classes = `
    ${baseClasses}
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${isDisabled ? disabledClasses : ""}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  /**
   * handleClick - Enhanced click handler with logging
   */
  const handleClick = (event) => {
    if (isDisabled || !onClick) return;

    // Log user interaction
    logUserInteraction("Button", "click", {
      variant,
      size,
      disabled,
      loading,
      buttonText: typeof children === "string" ? children : "non-text-content",
      ariaLabel,
      target: event.target,
      timestamp: new Date().toISOString(),
    });

    onClick(event);
  };

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
      )}
      {children}
    </button>
  );
};

export default Button;
