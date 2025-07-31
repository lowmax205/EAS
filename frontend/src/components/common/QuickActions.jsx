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
      description: "Overview & analytics",
      icon: <Home className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />,
      onClick: () => handleNavigation(APP_ROUTES.DASHBOARD, "Dashboard"),
      bg: "bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900 dark:to-cyan-800",
    },
    {
      key: "attendance",
      label: "Attendance",
      description: "Track event participation",
      icon: <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      onClick: () => handleNavigation(APP_ROUTES.ATTENDANCE, "Attendance"),
      bg: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800",
    },
    {
      key: "management",
      label: "Management",
      description: "Users & events control",
      icon: <Users className="h-6 w-6 text-green-600 dark:text-green-400" />,
      onClick: () => handleNavigation(APP_ROUTES.MANAGEMENT, "Management"),
      bg: "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800",
    },
    {
      key: "reports",
      label: "Reports",
      description: "Insights & analytics",
      icon: (
        <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
      ),
      onClick: () => handleNavigation(APP_ROUTES.REPORTS, "Reports"),
      bg: "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800",
    },
  ];

  return (
    <div className="card-theme p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
          <Home className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-xl font-bold text-theme">Quick Actions</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={action.key === current ? undefined : action.onClick}
            className={`group relative overflow-hidden rounded-xl border-2 p-5 text-left transition-all duration-300 ${
              action.key === current
                ? "border-primary-500 bg-primary-50 dark:bg-primary-950 cursor-not-allowed"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            }`}
            disabled={action.key === current}
            aria-current={action.key === current ? "page" : undefined}
          >
            {/* Background gradient for active state */}
            {action.key === current && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 to-primary-200/50 dark:from-primary-900/50 dark:to-primary-800/50" />
            )}
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-100/20 dark:to-primary-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex items-start gap-4">
              <div
                className={`relative h-12 w-12 ${action.bg} rounded-xl flex items-center justify-center transition-transform duration-300 ${
                  action.key === current ? "scale-110" : "group-hover:scale-110"
                }`}
              >
                {action.icon}
                {action.key === current && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`font-semibold mb-1 transition-colors duration-300 ${
                  action.key === current 
                    ? "text-primary-700 dark:text-primary-300" 
                    : "text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                }`}>
                  {action.label}
                </p>
                <p className={`text-sm leading-tight transition-colors duration-300 ${
                  action.key === current 
                    ? "text-primary-600 dark:text-primary-400" 
                    : "text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-400"
                }`}>
                  {action.description}
                </p>
              </div>
            </div>
            
            {/* Active state indicator */}
            {action.key === current && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
