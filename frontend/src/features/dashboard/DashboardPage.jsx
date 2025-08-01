/**
 * DashboardPage - Main dashboard component with comprehensive widgets and analytics
 */

import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useCampus } from "../../contexts/CampusContext";
import { useModal } from "../../components/forms/ModalContext";
import { useDataPreload } from "../../services/DataPreloadContext";
import { APP_ROUTES } from "../../components/common/constants/index";
import { useLogger } from "../../components/common/useLogger.jsx";
import { logUserInteraction } from "../../components/common/devLogger";
import { WelcomeHero, DashboardSkeleton } from "./widgets";
import { QuickActions } from "../../components/common";
import { DashboardHeader, StatsGrid, MainContentGrid } from "./components";
import CampusDashboard from "./components/CampusDashboard";

/**
 * DashboardPage - Main dashboard component with role-based content
 */
const DashboardPage = () => {
  // Only log mount/unmount for page components that need tracking
  useLogger("DashboardPage", { logMountUnmount: true });
  const { user } = useAuth();
  const { currentCampus, userCampusPermissions } = useCampus();
  const { openViewAllEventsModal } = useModal();
  const { dashboardData, isPreloading, error: preloadError } = useDataPreload();
  const navigate = useNavigate();

  // Navigation handlers
  const handleViewAllEvents = useCallback(() => {
    // Log user interaction
    logUserInteraction("DashboardPage", "viewAllEvents", {
      userRole: user?.role,
      timestamp: new Date().toISOString(),
    });
    // Open the modal instead of navigating to Event Management page
    openViewAllEventsModal();
  }, [openViewAllEventsModal, user?.role]);

  const handleViewAllActivity = useCallback(() => {
    // Log user interaction
    logUserInteraction("DashboardPage", "viewAllActivity", {
      userRole: user?.role,
      destination:
        user?.role === "student" ? APP_ROUTES.ATTENDANCE : APP_ROUTES.REPORTS,
      timestamp: new Date().toISOString(),
    });
    // Navigate to attendance page for students, reports for admin/organizer
    if (user?.role === "student") {
      navigate(APP_ROUTES.ATTENDANCE);
    } else {
      navigate(APP_ROUTES.REPORTS);
    }
  }, [user?.role, navigate]);

  // Show loading skeleton while preloading
  if (isPreloading) {
    return <DashboardSkeleton />;
  }

  // Show error if preloading failed
  if (preloadError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <strong>Error:</strong> {preloadError}
          </div>
        </div>
      </div>
    );
  }

  // Use preloaded data or fallback to default values
  const currentDashboardData = dashboardData || {
    upcomingEvents: [],
    recentAttendance: [],
    stats: {
      totalEvents: 0,
      attendedEvents: 0,
      upcomingEvents: 0,
      attendanceRate: 0,
    },
  };

  return (
    <div className="min-h-screen bg-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions at the very top */}
        {(user?.role === "admin" || user?.role === "organizer") && (
          <QuickActions current="dashboard" />
        )}
        <div className="space-y-8">
          {/* Dashboard Header with Notifications */}
          <DashboardHeader userRole={user?.role} />

          {/* Welcome Hero Section */}
          <WelcomeHero user={user} />

          {/* Stats Grid Section */}
          <StatsGrid stats={currentDashboardData.stats} userRole={user?.role} />

          {/* Main Content Grid Section */}
          <MainContentGrid
            upcomingEvents={currentDashboardData.upcomingEvents}
            recentAttendance={currentDashboardData.recentAttendance}
            userRole={user?.role}
            onViewAllEvents={handleViewAllEvents}
            onViewAllActivity={handleViewAllActivity}
          />

          {/* Campus Analytics Section - Story 1.6: Campus-Specific Analytics */}
          {currentCampus && (
            <div className="mt-8">
              <CampusDashboard />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
