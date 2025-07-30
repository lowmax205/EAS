import React from "react";
import { Users, BarChart3, Calendar, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../components/common/constants/index";
import { logUserInteraction } from "../../components/common/devLogger";

/**
 * QuickActions - Shows navigation to Dashboard, Attendance, Management, and Reports pages
 * @param {Object} props
 * @param {string} props.current - The current page (dashboard, attendance, management, reports)
 * @returns {JSX.Element}
 */
const QuickActions = ({ current }) => {
  const navigate = useNavigate();

  // Enhanced navigation handler with logging
  const handleNavigation = (destination, label) => {
    logUserInteraction("QuickActions", "navigation", {
      from: current,
      to: destination,
      label: label,
    });
    navigate(destination);
  };

  const actions = [
    {
      key: "dashboard",
      label: "Dashboard",
      description: "Go to dashboard",
      icon: <Home className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />,
      onClick: () => handleNavigation(APP_ROUTES.DASHBOARD, "Dashboard"),
      bg: "bg-cyan-100 dark:bg-cyan-900",
    },
    {
      key: "attendance",
      label: "Attendance",
      description: "Go to attendance records",
      icon: <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      onClick: () => handleNavigation(APP_ROUTES.ATTENDANCE, "Attendance"),
      bg: "bg-blue-100 dark:bg-blue-900",
    },
    {
      key: "management",
      label: "Management",
      description: "User & event management",
      icon: <Users className="h-5 w-5 text-green-600 dark:text-green-400" />,
      onClick: () => handleNavigation(APP_ROUTES.MANAGEMENT, "Management"),
      bg: "bg-green-100 dark:bg-green-900",
    },
    {
      key: "reports",
      label: "Reports",
      description: "Analytics & reports",
      icon: (
        <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      ),
      onClick: () => handleNavigation(APP_ROUTES.REPORTS, "Reports"),
      bg: "bg-purple-100 dark:bg-purple-900",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-theme mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={action.key === current ? undefined : action.onClick}
            className={`flex items-center p-4 card-theme rounded-lg shadow-theme border transition-shadow duration-200 text-left ${
              action.key === current
                ? "opacity-60 cursor-not-allowed border-2 border-primary-400 dark:border-primary-600"
                : "hover:shadow-theme-md hover:border-primary-400 dark:hover:border-primary-600"
            }`}
            disabled={action.key === current}
            aria-current={action.key === current ? "page" : undefined}
          >
            <div
              className={`h-10 w-10 ${action.bg} rounded-lg flex items-center justify-center mr-3`}
            >
              {action.icon}
            </div>
            <div>
              <p className="font-medium text-theme">{action.label}</p>
              <p className="text-sm text-theme opacity-70">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
