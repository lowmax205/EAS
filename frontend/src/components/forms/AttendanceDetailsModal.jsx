import React, { useEffect, useState } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  QrCode,
  Clipboard,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  Home,
  ChevronDown,
  ChevronUp,
  Image,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { formatDate, formatDateTime } from "../../components/common/formatting";
import {
  ATTENDANCE_STATUS_CONFIG,
  ATTENDANCE_METHOD_CONFIG,
} from "../../components/common/constants/index";
import useScrollLock from "../../components/common/useScrollLock";

/**
 * AttendanceDetailsModal component for displaying detailed information about an attendance record
 */
const AttendanceDetailsModal = ({ isOpen, onClose, record }) => {
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  // Enable scroll lock when modal is open
  useScrollLock(isOpen);

  // Return null if modal is not open or no record is provided
  // This must come after all hooks have been called
  if (!isOpen || !record) {
    return null;
  }

  // Safety check for required record properties
  const userName = record.fullName || record.userName || "Unknown User";
  const studentId = record.studentId || "N/A";
  const department = record.departmentName || record.department || "N/A";
  const userEmail = record.userEmail || "N/A";
  const checkInTime = record.dateAttended || record.checkInTime || "";
  const checkInMethod = record.method || record.checkInMethod || "N/A";
  const location = record.location ? 
    (record.location.address || `Lat: ${record.location.lat}, Lng: ${record.location.lng}`) : 
    "N/A";
  const isVerified = record.verified || record.isVerified || false;
  const status = record.status || "N/A";
  const eventId = record.eventId || "N/A";
  const eventTitle = record.eventTitle || `Event #${eventId}`;
  const course = record.course || "N/A";
  const yearLevel = record.yearLevel || "N/A";
  const section = record.section || "N/A";
  const gender = record.gender || "N/A";
  const birthDate = record.birthDate || "N/A";
  const phone = record.phone || "N/A";
  const address = record.address || "N/A";
  const college = record.college || "N/A";
  const avatar = record.avatar || null;

  // Get verification status indicator
  const getVerificationStatus = () => {
    const config = isVerified
      ? ATTENDANCE_STATUS_CONFIG.verified
      : ATTENDANCE_STATUS_CONFIG.unverified;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} ${config.border}`}
      >
        {config.label}
      </span>
    );
  };

  // Get attendance status indicator
  const getAttendanceStatus = () => {
    const config =
      ATTENDANCE_STATUS_CONFIG[status] || ATTENDANCE_STATUS_CONFIG.default;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} ${config.border}`}
      >
        {config.label}
      </span>
    );
  };

  // Get check-in method icon
  const getCheckInMethodIcon = () => {
    // Handle both qr and qr_code values
    let configKey = checkInMethod;
    if (checkInMethod === "qr" && !ATTENDANCE_METHOD_CONFIG[checkInMethod]) {
      configKey = "qr_code";
    }
    
    const config =
      ATTENDANCE_METHOD_CONFIG[configKey] ||
      ATTENDANCE_METHOD_CONFIG.default;
    
    const IconComponent =
      config.icon === "Smartphone"
        ? QrCode
        : config.icon === "Edit"
        ? Clipboard
        : AlertCircle;

    return <IconComponent className={`w-5 h-5 ${config.color}`} />;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative w-full max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl theme-transition">
        {/* Compact Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-primary-600 dark:text-primary-500" />
            <h2 className="text-lg font-semibold text-theme">Attendance Record</h2>
          </div>
          <div className="flex items-center space-x-2">
            {getAttendanceStatus()}
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-theme" />
            </button>
          </div>
        </div>

        {/* Compact Body */}
        <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-4">
            {/* Event Information - Compact */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-500" />
                <span className="font-medium text-theme text-sm">Event</span>
              </div>
              <p className="text-theme font-medium text-sm">{eventTitle}</p>
              <p className="text-theme opacity-70 text-xs">ID: {eventId}</p>
            </div>

            {/* Student & Attendance Info - Single Column */}
            <div>
              {/* Student Info Header */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-medium text-theme">Student Information</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMoreDetails(!showMoreDetails)}
                  className="text-xs px-2 py-1 h-auto"
                >
                  {showMoreDetails ? (
                    <>Less <ChevronUp className="w-3 h-3 ml-1" /></>
                  ) : (
                    <>More <ChevronDown className="w-3 h-3 ml-1" /></>
                  )}
                </Button>
              </div>

              {/* Essential Student Info - Grid Layout */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="space-y-2">
                  <div className="text-theme">
                    <p className="font-medium text-sm flex items-center">
                      <User className="w-3 h-3 mr-1.5 text-primary-600 dark:text-primary-500" />
                      {userName}
                    </p>
                    <p className="opacity-70 text-xs ml-4.5">ID: {studentId}</p>
                  </div>
                  
                  <div className="text-theme">
                    <p className="font-medium text-sm flex items-center">
                      <Mail className="w-3 h-3 mr-1.5 text-primary-600 dark:text-primary-500" />
                      Email
                    </p>
                    <p className="opacity-70 text-xs ml-4.5 break-all">{userEmail}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-theme">
                    <p className="font-medium text-sm flex items-center">
                      <GraduationCap className="w-3 h-3 mr-1.5 text-primary-600 dark:text-primary-500" />
                      Department
                    </p>
                    <p className="opacity-70 text-xs ml-4.5">{department}</p>
                  </div>

                  <div className="text-theme">
                    <p className="font-medium text-sm flex items-center">
                      <Clock className="w-3 h-3 mr-1.5 text-primary-600 dark:text-primary-500" />
                      Check-in
                    </p>
                    <p className="opacity-70 text-xs ml-4.5">
                      {checkInTime ? formatDateTime(checkInTime) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendance Status & Method - Compact Row */}
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded text-sm">
                <div className="flex items-center space-x-2">
                  {getCheckInMethodIcon()}
                  <span className="opacity-80">
                    {(checkInMethod && ATTENDANCE_METHOD_CONFIG[checkInMethod]?.label) || 
                     (checkInMethod === "qr" && "QR Code") ||
                     (checkInMethod === "manual" && "Manual Entry") ||
                      ATTENDANCE_METHOD_CONFIG.default.label}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {isVerified ? (
                    <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-500" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-yellow-600 dark:text-yellow-500" />
                  )}
                  {getVerificationStatus()}
                </div>
              </div>

              {/* Location */}
              <div className="mt-2 text-theme">
                <p className="font-medium text-sm flex items-center">
                  <MapPin className="w-3 h-3 mr-1.5 text-primary-600 dark:text-primary-500" />
                  Location
                </p>
                <p className="opacity-70 text-xs ml-4.5">{location}</p>
              </div>

              {/* Expanded Details */}
              {showMoreDetails && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  {avatar && (
                    <div className="flex items-center space-x-3">
                      <Image className="w-4 h-4 text-primary-600 dark:text-primary-500" />
                      <img
                        src={avatar}
                        alt={userName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-medium text-theme mb-1">Academic</p>
                      <div className="space-y-0.5 text-xs opacity-70">
                        <p>Course: {course}</p>
                        <p>Year: {yearLevel}</p>
                        <p>Section: {section}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-theme mb-1">Personal</p>
                      <div className="space-y-0.5 text-xs opacity-70">
                        <p>Gender: {gender}</p>
                        <p>Birth: {birthDate}</p>
                        <p>Campus: {college}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-start space-x-2">
                      <Phone className="w-3 h-3 mt-0.5 text-primary-600 dark:text-primary-500" />
                      <div>
                        <p className="font-medium text-theme">Contact</p>
                        <p className="opacity-70 text-xs">{phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Home className="w-3 h-3 mt-0.5 text-primary-600 dark:text-primary-500" />
                      <div>
                        <p className="font-medium text-theme">Address</p>
                        <p className="opacity-70 text-xs">{address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selfie Preview - Compact */}
            {record.selfieUrl && (
              <div>
                <p className="text-sm font-medium text-theme mb-2">Verification Selfie</p>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg flex justify-center">
                  <img
                    src={record.selfieUrl}
                    alt="Check-in Selfie"
                    className="max-h-32 rounded object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compact Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetailsModal;
