/**
 * Dashboard Widgets Export File - Organized by Category
 * Centralizes all dashboard widget exports for easier imports
 * Features: Categorized exports, Modular organization, Better maintainability
 */

// Data Display Widgets
import EventsList from "./data-display/EventsList";
import ActivityFeed from "./data-display/ActivityFeed";

// Analytics Widgets
import WebsiteAnalytics from "./analytics/WebsiteAnalytics";
import PerformanceMetrics from "./analytics/PerformanceMetrics";

// UI Widgets
import WelcomeHero from "./ui/WelcomeHero";
import NotificationBell from "./ui/NotificationBell";
import MiniCalendar from "./ui/MiniCalendar";

// Loading Widgets
import DashboardSkeleton from "./loading/DashboardSkeleton";

// Import shared StatsCard
import { StatsCard } from "../../../components/common";

// Re-export all widgets
export {
  // Data Display Widgets
  EventsList,
  ActivityFeed,

  // Analytics Widgets
  WebsiteAnalytics,
  PerformanceMetrics,

  // UI Widgets
  WelcomeHero,
  NotificationBell,
  MiniCalendar,

  // Loading Widgets
  DashboardSkeleton,

  // Shared Widgets
  StatsCard
};
