/**
 * Attendance-related constants and configurations
 */

// Attendance status configurations for StatusIndicator component
export const ATTENDANCE_STATUS_CONFIG = {
  present: {
    color: "text-green-700 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-800",
    icon: "CheckCircle",
    label: "Present",
  },
  absent: {
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-200 dark:border-red-800",
    icon: "AlertCircle",
    label: "Absent",
  },
  late: {
    color: "text-yellow-700 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: "Clock",
    label: "Late",
  },
  verified: {
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-800",
    icon: "CheckCircle",
    label: "Verified",
  },
  unverified: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-200 dark:border-red-800",
    icon: "AlertCircle",
    label: "Unverified",
  },
  default: {
    color: "text-gray-700 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-900/30",
    border: "border-gray-200 dark:border-gray-800",
    icon: "AlertCircle",
    label: "Unknown",
  },
};

// Method indicator configurations for MethodIndicator component
export const ATTENDANCE_METHOD_CONFIG = {
  qr_code: {
    icon: "Smartphone",
    label: "QR Code",
    color: "text-blue-600 dark:text-blue-400",
  },
  qr: {
    icon: "Smartphone",
    label: "QR Code",
    color: "text-blue-600 dark:text-blue-400",
  },
  manual: {
    icon: "Edit",
    label: "Manual",
    color: "text-purple-600 dark:text-purple-400",
  },
  default: {
    icon: "AlertCircle",
    label: "Unknown",
    color: "text-gray-600 dark:text-gray-400",
  },
};

// Attendance status types
export const ATTENDANCE_STATUS = [
  { value: "all", label: "All Status" },
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
];

// Attendance check-in methods
export const ATTENDANCE_METHODS = [
  { value: "all", label: "All Methods" },
  { value: "qr_code", label: "QR Code" },
  { value: "qr", label: "QR Code" },
  { value: "manual", label: "Manual" },
];

// Attendance verification status
export const ATTENDANCE_VERIFICATION = [
  { value: "all", label: "All Records" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
];

// Attendance stats card configurations
export const ATTENDANCE_STATS_CONFIG = {
  totalRecords: {
    iconBg: "bg-blue-100 dark:bg-blue-900",
    iconColor: "text-blue-600 dark:text-blue-400",
    valueColor: "text-2xl font-bold text-blue-600 dark:text-blue-400",
  },
  present: {
    iconBg: "bg-green-100 dark:bg-green-900",
    iconColor: "text-green-600 dark:text-green-400",
    valueColor: "text-2xl font-bold text-green-600 dark:text-green-400",
  },
  verified: {
    iconBg: "bg-purple-100 dark:bg-purple-900",
    iconColor: "text-purple-600 dark:text-purple-400",
    valueColor: "text-2xl font-bold text-purple-600 dark:text-purple-400",
  },
  rate: {
    iconBg: "bg-orange-100 dark:bg-orange-900",
    iconColor: "text-orange-600 dark:text-orange-400",
    valueColor: "text-2xl font-bold text-orange-600 dark:text-orange-400",
  },
  qrCode: {
    iconBg: "bg-indigo-100 dark:bg-indigo-900",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    valueColor: "text-2xl font-bold text-indigo-600 dark:text-indigo-400",
  },
  manual: {
    iconBg: "bg-amber-100 dark:bg-amber-900",
    iconColor: "text-amber-600 dark:text-amber-400",
    valueColor: "text-2xl font-bold text-amber-600 dark:text-amber-400",
  },
};
