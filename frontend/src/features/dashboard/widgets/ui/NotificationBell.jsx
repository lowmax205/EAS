/**
 * NotificationBell Widget - Displays notification count and indicator
 * Features: Notification count display, Click handling, Role-based notifications
 * Dependencies: Lucide React icons
 * Theme Support: Complete light/dark theme with smooth transitions
 * Accessibility: ARIA labels, keyboard support
 */

import React, { useState } from "react";
import { Bell } from "lucide-react";
import { logUserInteraction } from "../../../../components/common/devLogger";
import { DASHBOARD_STATS } from "../../../../components/common/constants/index";

/**
 * NotificationBell - Displays notification indicator with count
 * Features: Notification count, Click handling
 * @param {Object} props - Component props
 * @param {string} props.userRole - User role (student, organizer, admin)
 * @returns {JSX.Element} - Notification bell component
 */
const NotificationBell = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get notification count based on user role
  const getNotificationCount = () => {
    switch (userRole) {
      case "admin":
        return DASHBOARD_STATS.ADMIN_NOTIFICATIONS || 5;
      case "organizer":
        return DASHBOARD_STATS.ORGANIZER_NOTIFICATIONS || 3;
      case "student":
      default:
        return DASHBOARD_STATS.STUDENT_NOTIFICATIONS || 2;
    }
  };

  const notificationCount = getNotificationCount();

  /**
   * Toggle notification dropdown and log interaction
   */
  const handleToggle = () => {
    logUserInteraction("NotificationBell", "toggle", {
      isOpen: !isOpen,
      notificationCount,
      userRole
    });
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm theme-transition border border-white/20"
        aria-label={`${notificationCount} notifications`}
      >
        <Bell className="h-5 w-5 text-white" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border border-white/20">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-theme">Notifications</h3>
          </div>

          {/* Notification items would go here - mock data for now */}
          <div className="max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="text-sm text-theme">New event has been published</p>
              <p className="text-xs text-theme opacity-60">2 minutes ago</p>
            </div>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="text-sm text-theme">Your attendance has been confirmed</p>
              <p className="text-xs text-theme opacity-60">1 hour ago</p>
            </div>
            <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="text-sm text-theme">System maintenance scheduled</p>
              <p className="text-xs text-theme opacity-60">1 day ago</p>
            </div>
          </div>

          <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
            <button
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              onClick={() => {
                logUserInteraction("NotificationBell", "viewAll", { userRole });
                setIsOpen(false);
              }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
