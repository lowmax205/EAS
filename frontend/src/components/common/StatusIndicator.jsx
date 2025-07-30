import React from "react";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { ATTENDANCE_STATUS_CONFIG } from "../../components/common/constants/index";

/**
 * Component for displaying status indicators consistently across the application
 */
const StatusIndicator = ({ status, size = "default" }) => {
  const getStatusConfig = (status) => {
    const config =
      ATTENDANCE_STATUS_CONFIG[status] || ATTENDANCE_STATUS_CONFIG.default;

    // Get the actual icon component
    const iconMap = {
      CheckCircle,
      AlertCircle,
      Clock,
    };

    return {
      ...config,
      icon: iconMap[config.icon] || AlertCircle,
      label:
        config.label ||
        (status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"),
    };
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  const sizeClasses = {
    small: {
      container: "text-xs",
      icon: "h-3 w-3 mr-1",
    },
    default: {
      container: "text-sm",
      icon: "h-4 w-4 mr-2",
    },
    large: {
      container: "text-base",
      icon: "h-5 w-5 mr-2",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  return (
    <div className="flex items-center">
      <StatusIcon className={`${currentSize.icon} ${config.color}`} />
      <span className={`${currentSize.container} ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

export default StatusIndicator;
