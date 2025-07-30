import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useDataPreload } from "../../services/DataPreloadContext";
import { useLocation } from "react-router-dom";
import Button from "../../components/ui/Button";
import UserManagement from "../users/UserManagement";
import EventManagement from "./EventManagement";
import QuickActions from "../../components/common/QuickActions";
import LoadingSpinner from "../../components/common/loading/LoadingSpinner";
import { Users, Calendar, Settings } from "lucide-react";

const ManagementPage = () => {
  const { user } = useAuth();
  const { isPreloading } = useDataPreload();
  const location = useLocation();
  // Set initial active tab based on user role - default to "events" if organizer
  const [activeTab, setActiveTab] = useState(
    user?.role === "admin" ? "users" : "events"
  );
  const [shouldCreateEvent, setShouldCreateEvent] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    const action = searchParams.get("action");

    // If explicit tab is specified in URL, respect it
    if (tab === "events") {
      setActiveTab("events");
      if (action === "create") {
        setShouldCreateEvent(true);
      }
    }
    // If user is not admin, automatically set to events tab regardless of default
    else if (user?.role === "organizer") {
      setActiveTab("events");
    }
  }, [location.search, user?.role]);

  // Check if user has access to management
  const hasManagementAccess =
    user?.role === "admin" || user?.role === "organizer";

  // Check if user has access to user management (admin only)
  const hasUserManagementAccess = user?.role === "admin";

  if (isPreloading) {
    return <LoadingSpinner message="Loading management page..." />;
  }

  if (!hasManagementAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-eas-dark-text mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You don&apos;t have permission to access management features.
              Contact an administrator if you need access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Quick Actions at the very top */}
      {(user?.role === "admin" || user?.role === "organizer") && (
        <QuickActions current="management" />
      )}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-theme">System Management</h1>
            <p className="text-theme opacity-70">
              Manage users, events, and system configurations
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {hasUserManagementAccess && (
            <Button
              variant={activeTab === "users" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("users")}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Button>
          )}
          <Button
            variant={activeTab === "events" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("events")}
            className="flex-1"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Event Management
          </Button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "users" && hasUserManagementAccess && (
            <UserManagement />
          )}
          {activeTab === "events" && (
            <EventManagement
              shouldCreateEvent={shouldCreateEvent}
              onCreateEventTriggered={() => setShouldCreateEvent(false)}
            />
          )}
          {activeTab === "users" && !hasUserManagementAccess && (
            <div className="bg-theme shadow-theme-md rounded-lg p-6">
              <div className="text-center py-8">
                <div className="text-red-500 text-4xl mb-4">🔒</div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Administrator Access Only
                </h2>
                <div className="max-w-lg mx-auto">
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    The User Management section is restricted to administrators
                    only.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Your current role ({user?.role}) does not have permission to
                    access user management features. Please contact an
                    administrator if you need these permissions.
                  </p>
                  <div className="flex justify-center">
                    {/* Assuming Button is defined elsewhere or needs to be imported */}
                    {/* <Button
                      onClick={() => setActiveTab("events")}
                      className="flex items-center"
                    >
                      Go to Event Management
                    </Button> */}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagementPage;
