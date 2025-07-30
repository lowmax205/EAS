import React from "react";
import { CheckCircle, Calendar, Users, FileText, Activity } from "lucide-react";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import { formatDate } from "../../../../components/common/formatting";
import {
  STATUS_CONFIG,
  DASHBOARD_STATS,
} from "../../../../components/common/constants/index";

const ActivityFeed = ({
  title = "Recent Activity",
  activities = [],
  emptyMessage = "No recent activity",
  showViewAllButton = true,
  onViewAll = null,
  maxItems = 5,
  userRole = "student",
}) => {
  const displayActivities = activities.slice(0, maxItems);
  const getActivityIcon = (type) => {
    switch (type) {
      case "attendance":
        return <CheckCircle className="h-4 w-4" />;
      case "registration":
        return <Users className="h-4 w-4" />;
      case "event":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
      case "success":
        return "text-green-600 dark:text-green-400";
      case "absent":
      case "error":
        return "text-red-600 dark:text-red-400";
      case "pending":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-theme";
    }
  };

  const getActivityIconBg = (type) => {
    switch (type) {
      case "attendance":
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400";
      case "registration":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400";
      case "event":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400";
    }
  };

  return (
    <Card title={title} className="h-fit">
      {displayActivities.length > 0 ? (
        <div className="space-y-4">
          {displayActivities.map((activity, index) => (
            <div
              key={activity.id || index}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <div
                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${getActivityIconBg(
                  activity.type
                )}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-theme truncate">
                    {activity.title || activity.eventTitle || "Activity"}
                  </p>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    {activity.status && (
                      <span
                        className={`text-xs font-medium ${getStatusColor(
                          activity.status
                        )}`}
                      >
                        {activity.status.charAt(0).toUpperCase() +
                          activity.status.slice(1)}
                      </span>
                    )}
                    <span className="text-xs text-theme opacity-60">
                      {formatDate(activity.date || activity.checkInTime, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                {activity.description && (
                  <p className="text-xs text-theme opacity-70 mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                )}
                {activity.checkInMethod && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 mt-1">
                    {activity.checkInMethod.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          ))}
          {showViewAllButton && onViewAll && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onViewAll}
              >
                View All Activity
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-theme opacity-30 mx-auto mb-4" />
          <p className="text-theme opacity-70">{emptyMessage}</p>
          {userRole === "admin" && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between items-center px-4">
                <span className="text-theme opacity-60">
                  Today&apos;s Check-ins
                </span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  {DASHBOARD_STATS.TODAYS_CHECKINS}
                </span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-theme opacity-60">Active Events</span>
                <span className="font-semibold text-secondary-600 dark:text-secondary-400">
                  {DASHBOARD_STATS.ACTIVE_EVENTS}
                </span>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-theme opacity-60">New Registrations</span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  {DASHBOARD_STATS.NEW_REGISTRATIONS}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ActivityFeed;
