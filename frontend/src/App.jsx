import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import { EventProvider } from "./features/events/EventContext";
import { ModalProvider } from "./components/forms/ModalContext";
import { DataPreloadProvider } from "./services/DataPreloadContext";
import { CampusProvider } from "./contexts/CampusContext";
import { StagewiseToolbar } from "@stagewise/toolbar-react";
import ReactPlugin from "@stagewise-plugins/react";
import { ThemeProvider } from "./components/layout/ThemeContext";
import { APP_ROUTES } from "./components/common/constants/index";
import { useNavigationLogger } from "./components/common/useNavigationLogger";
import { enforceHTTPS } from "./components/common/security";

// Public Pages
import HomePage from "./pages/HomePage";
import EventListingPage from "./pages/EventListingPage";
import RoadmapPage from "./pages/RoadmapPage";

// Protected Pages
import DashboardPage from "./features/dashboard/DashboardPage";
import AttendancePage from "./features/attendance/AttendancePage";
import ProfilePage from "./features/profile/ProfilePage";
import ReportsPage from "./features/reports/ReportsPage";
import ManagementPage from "./features/events/ManagementPage";

// Layout Components
import AppLayout from "./layouts/DashboardLayout";
import AuthRoute from "./routes/AuthRoute";

/**
 * NavigationTracker - Tracks navigation events for development logging
 */
const NavigationTracker = () => {
  useNavigationLogger();
  return null;
};

/**
 * App - Main application component with provider hierarchy
 */
function App() {
  useEffect(() => {
    enforceHTTPS();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CampusProvider>
          <DataPreloadProvider>
            <EventProvider>
              <ModalProvider>
                <Router>
                  <NavigationTracker />
                  <StagewiseToolbar
                    config={{
                      plugins: [ReactPlugin],
                    }}
                  />
                  <AppLayout>
                  <Routes>
                    {/* Public Routes */}
                    <Route path={APP_ROUTES.HOME} element={<HomePage />} />
                    <Route
                      path={APP_ROUTES.EVENTS}
                      element={<EventListingPage />}
                    />
                    <Route
                      path={APP_ROUTES.ROADMAP}
                      element={<RoadmapPage />}
                    />
                    {/* Protected Routes */}
                    <Route
                      path={APP_ROUTES.DASHBOARD}
                      element={
                        <AuthRoute>
                          <DashboardPage />
                        </AuthRoute>
                      }
                    />
                    <Route
                      path={APP_ROUTES.ATTENDANCE}
                      element={
                        <AuthRoute>
                          <AttendancePage />
                        </AuthRoute>
                      }
                    />
                    <Route
                      path={APP_ROUTES.MANAGEMENT}
                      element={
                        <AuthRoute>
                          <ManagementPage />
                        </AuthRoute>
                      }
                    />
                    <Route
                      path={APP_ROUTES.REPORTS}
                      element={
                        <AuthRoute>
                          <ReportsPage />
                        </AuthRoute>
                      }
                    />
                    <Route
                      path={APP_ROUTES.PROFILE}
                      element={
                        <AuthRoute>
                          <ProfilePage />
                        </AuthRoute>
                      }
                    />
                  </Routes>
                </AppLayout>
              </Router>
            </ModalProvider>
          </EventProvider>
        </DataPreloadProvider>
      </CampusProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
