import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * Component for displaying error messages consistently
 */
const ErrorDisplay = ({ error, variant = "default" }) => {
  if (!error) return null;

  const variants = {
    default:
      "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg",
    inline: "text-red-600 dark:text-red-400 text-sm mt-1",
    banner:
      "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded",
  };

  const className = variants[variant] || variants.default;

  return (
    <div className={className}>
      {variant !== "inline" && (
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-3" />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}
      {variant === "inline" && <div>{error}</div>}
    </div>
  );
};

export default ErrorDisplay;
