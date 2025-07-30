/**
 * Application metadata and configuration constants
 */

export const APP_CONFIG = {
  NAME: "Event Attendance System",
  DESCRIPTION: "Digital Attendance Management for Campus Events and Activities",
  UNIVERSITY: {
    NAME: "Surigao del Norte State University",
    SHORT: "SNSU",
    EMAIL: "usccitycampus@ssct.edu.ph",
    ADDRESS: "Narciso st., Surigao City, Surigao del Norte",
  },
};

// Application routes
export const APP_ROUTES = {
  HOME: "/",
  EVENTS: "/events",
  ROADMAP: "/roadmap",
  DASHBOARD: "/dashboard",
  ATTENDANCE: "/attendance",
  MANAGEMENT: "/management",
  REPORTS: "/reports",
  PROFILE: "/profile",
};

// Public routes
export const PUBLIC_ROUTES = ["/", "/events", "/roadmap"];

// Navigation items
export const NAVIGATION_ITEMS = {
  PUBLIC: [
    { name: "Home", href: APP_ROUTES.HOME, icon: "Home" },
    { name: "Events", href: APP_ROUTES.EVENTS, icon: "Calendar" },
    { name: "Roadmap", href: APP_ROUTES.ROADMAP, icon: "Map" },
  ],
  PROTECTED: [
    { name: "Home", href: APP_ROUTES.HOME, icon: "Home" },
    { name: "Events", href: APP_ROUTES.EVENTS, icon: "Calendar" },
    { name: "Roadmap", href: APP_ROUTES.ROADMAP, icon: "Map" },
  ],
};

// Dashboard statistics constants
export const DASHBOARD_STATS = {
  TODAYS_CHECKINS: 24,
  ACTIVE_EVENTS: 3,
  NEW_REGISTRATIONS: 12,
  WEBSITE_ANALYTICS: {
    VISITORS_TODAY: "157",
    AVERAGE_TIME_SPENT: "4m 32s",
    CURRENT_ACTIVE: "23",
    BOUNCE_RATE: "34.2%",
  },
};

// Welcome messages by user role
export const WELCOME_MESSAGES = {
  student: "Check out your upcoming events and attendance records.",
  organizer: "Manage your events and monitor attendance.",
  admin: "Overview of all system activities and statistics.",
  default: "Welcome to the Event Attendance System.",
};
