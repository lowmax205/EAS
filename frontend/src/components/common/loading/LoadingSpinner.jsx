import React from "react";

/**
 * Loading state component for consistent loading spinners
 */
const LoadingSpinner = ({
  message = "Loading...",
  size = "default",
  fullPage = false,
}) => {
  const sizes = {
    small: "h-8 w-8",
    default: "h-12 w-12",
    large: "h-16 w-16",
  };

  const spinnerSize = sizes[size] || sizes.default;
  const containerClasses = fullPage
    ? "flex items-center justify-center min-h-screen"
    : "flex items-center justify-center min-h-96";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div
          className={`animate-spin rounded-full ${spinnerSize} border-b-2 border-primary-500 mx-auto mb-4`}
        ></div>
        <p className="text-theme opacity-70">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
