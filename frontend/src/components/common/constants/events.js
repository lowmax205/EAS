/**
 * Event-related constants and configurations
 */

// Event categories
export const EVENT_CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "Academic", label: "Academic" },
  { value: "Sports", label: "Sports" },
  { value: "Cultural", label: "Cultural" },
  { value: "Meeting", label: "Meeting" },
  { value: "Workshop", label: "Workshop" },
  { value: "Seminar", label: "Seminar" },
];

// Event status
export const EVENT_STATUS = [
  { value: "all", label: "All Events" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

// Status styling configurations with proper theme-aware classes
export const STATUS_CONFIG = {
  upcoming: {
    bg: "bg-primary-100 dark:bg-primary-900",
    text: "text-primary-700 dark:text-primary-300",
    label: "Upcoming",
  },
  ongoing: {
    bg: "bg-green-100 dark:bg-green-900",
    text: "text-green-700 dark:text-green-300",
    label: "Ongoing",
  },
  completed: {
    bg: "bg-secondary-100 dark:bg-secondary-800",
    text: "text-secondary-700 dark:text-secondary-300",
    label: "Completed",
  },
};

// Category color configurations with theme-aware classes
export const CATEGORY_COLORS = {
  Academic: "text-primary-600 dark:text-primary-400",
  Sports: "text-green-600 dark:text-green-400",
  Cultural: "text-purple-600 dark:text-purple-400",
  Meeting: "text-blue-600 dark:text-blue-400",
  Workshop: "text-orange-600 dark:text-orange-400",
  Seminar: "text-red-600 dark:text-red-400",
};

// Default event values
export const DEFAULT_EVENT_VALUES = {
  STATUS: "upcoming",
  IS_PUBLIC: true,
  REQUIRES_REGISTRATION: true,
  CURRENT_ATTENDEES: 0,
};

// Feature sections for homepage
export const HOME_FEATURES = [
  {
    icon: "Smartphone",
    title: "Mobile-First Design",
    description:
      "Access the system from any mobile device without downloading apps. Works seamlessly on smartphones and tablets.",
  },
  {
    icon: "MapPin",
    title: "GPS Verification",
    description:
      "Ensure students are physically present at events with accurate GPS location tracking and verification.",
  },
  {
    icon: "Camera",
    title: "Selfie Authentication",
    description:
      "Prevent proxy attendance with selfie verification against event backgrounds for added security.",
  },
  {
    icon: "CheckCircle",
    title: "QR Code Scanning",
    description:
      "Quick and easy attendance marking through QR code scanning for each event.",
  },
  {
    icon: "BarChart3",
    title: "Real-time Analytics",
    description:
      "Get instant insights and attendance reports with comprehensive analytics dashboard.",
  },
  {
    icon: "Shield",
    title: "Fraud Prevention",
    description:
      "Multiple authentication layers prevent attendance fraud and ensure data accuracy.",
  },
];

// How it works steps for homepage
export const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Scan QR Code",
    description:
      "Students scan the unique QR code displayed at the event venue using their mobile device.",
  },
  {
    step: 2,
    title: "Verify Location & Identity",
    description:
      "System verifies GPS location and captures selfie with event background for authentication.",
  },
  {
    step: 3,
    title: "Record Attendance",
    description:
      "Attendance is automatically recorded and real-time reports are updated instantly.",
  },
];
