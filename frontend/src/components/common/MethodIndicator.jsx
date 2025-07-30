import React from "react";
import { Smartphone, Edit, AlertCircle } from "lucide-react";
import { ATTENDANCE_METHOD_CONFIG } from "../../components/common/constants/index";

/**
 * Component for displaying check-in method indicators consistently
 */
const MethodIndicator = ({ method, size = "default" }) => {
  const getMethodConfig = (method) => {
    const config =
      ATTENDANCE_METHOD_CONFIG[method] || ATTENDANCE_METHOD_CONFIG.default;

    // Get the actual icon component
    const iconMap = {
      Smartphone,
      Edit,
      AlertCircle,
    };

    return {
      ...config,
      icon: iconMap[config.icon] || AlertCircle,
    };
  };

  const config = getMethodConfig(method);
  const MethodIcon = config.icon;

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
      <MethodIcon className={`${currentSize.icon} ${config.color}`} />
      <span className={`${currentSize.container} ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

export default MethodIndicator;
