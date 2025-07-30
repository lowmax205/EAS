import React from "react";
import Card from "../../components/ui/Card";

/**
 * Reusable stats card component for displaying metrics with icon
 */
const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBg = "bg-primary-100 dark:bg-primary-900",
  iconColor = "text-primary-600 dark:text-primary-400",
  valueColor = "text-2xl font-bold text-theme",
  change = null,
  changeType = "positive",
}) => {
  const changeColor =
    changeType === "positive"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  return (
    <Card className="hover:shadow-theme-md transition-all duration-200">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div
            className={`flex items-center justify-center h-12 w-12 rounded-lg ${iconBg}`}
          >
            <div className={`h-6 w-6 ${iconColor}`}>{icon}</div>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-theme opacity-70">
                {title}
              </p>
              <p className={valueColor}>{value}</p>
            </div>
            {change && (
              <div className={`text-sm font-medium ${changeColor}`}>
                {change}
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-theme opacity-60 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
