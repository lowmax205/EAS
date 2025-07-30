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
      <div className="relative w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl theme-transition">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary-600 dark:text-primary-500" />
            <h2 className="text-xl font-semibold text-theme">
              Attendance Record
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            {getAttendanceStatus()}
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-theme" />
            </button>
          </div>
        </div>
        {/* Body */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Event Information */}
            <div>
              <h3 className="text-lg font-medium text-theme mb-2">
                Event Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <p className="text-theme font-medium">{eventTitle}</p>
                <p className="text-theme opacity-80 text-sm">
                  Event ID: {eventId}
                </p>
              </div>
            </div>

            {/* Attendance Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-theme">
                    Student Information
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMoreDetails(!showMoreDetails)}
                    className="flex items-center space-x-1"
                  >
                    <span>More Details</span>
                    {showMoreDetails ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Basic Student Info */}
                  <div className="flex items-center space-x-3 text-theme">
                    <User className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                    <div>
                      <p className="font-medium">Student</p>
                      <p className="opacity-80">{userName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-theme">
                    <FileText className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                    <div>
                      <p className="font-medium">Student ID</p>
                      <p className="opacity-80">{studentId}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-theme">
                    <Clipboard className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                    <div>
                      <p className="font-medium">Department</p>
                      <p className="opacity-80">{department}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-theme">
                    <Mail className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="opacity-80">{userEmail}</p>
                    </div>
                  </div>

                  {/* Additional Student Info (Expandable) */}
                  {showMoreDetails && (
                    <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {avatar && (
                        <div className="flex items-center space-x-3 text-theme">
                          <Image className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                          <div>
                            <p className="font-medium">Profile Picture</p>
                            <img
                              src={avatar}
                              alt={userName}
                              className="mt-1 w-24 h-24 object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-3 text-theme">
                        <GraduationCap className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                        <div>
                          <p className="font-medium">Academic Details</p>
                          <p className="opacity-80">Course: {course}</p>
                          <p className="opacity-80">Year Level: {yearLevel}</p>
                          <p className="opacity-80">Section: {section}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-theme">
                        <User className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                        <div>
                          <p className="font-medium">Personal Details</p>
                          <p className="opacity-80">Gender: {gender}</p>
                          <p className="opacity-80">Birth Date: {birthDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-theme">
                        <Phone className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                        <div>
                          <p className="font-medium">Contact</p>
                          <p className="opacity-80">{phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-theme">
                        <Home className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="opacity-80">{address}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-theme">
                        <GraduationCap className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                        <div>
                          <p className="font-medium">Campus</p>
                          <p className="opacity-80">{college}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-theme">
                  Attendance Details
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-theme">
                    <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                    <div>
                      <p className="font-medium">Check-in Date</p>
                      <p className="opacity-80">
                        {checkInTime ? formatDate(checkInTime) : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-theme">
                    <Clock className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                    <div>
                      <p className="font-medium">Check-in Time</p>
                      <p className="opacity-80">
                        {checkInTime ? formatDateTime(checkInTime) : "N/A"}
                      </p>
                      {record.timeIn && (
                        <p className="opacity-80 text-sm">
                          Time in: {record.timeIn}
                        </p>
                      )}
                      {record.timeOut && (
                        <p className="opacity-80 text-sm">
                          Time out: {record.timeOut}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-theme">
                    {getCheckInMethodIcon()}
                    <div>
                      <p className="font-medium">Check-in Method</p>
                      <p className="opacity-80">
                        {(checkInMethod && ATTENDANCE_METHOD_CONFIG[checkInMethod]?.label) || 
                         (checkInMethod === "qr" && "QR Code") ||
                         (checkInMethod === "manual" && "Manual Entry") ||
                          ATTENDANCE_METHOD_CONFIG.default.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-theme">
                    <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="opacity-80">{location}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-theme">
                    {isVerified ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">Verification Status</p>
                      <div className="opacity-80">
                        {getVerificationStatus()}
                      </div>
                      <p className="opacity-80 text-sm">
                        Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selfie Preview if available */}
            {record.selfieUrl && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-theme">
                  Verification Selfie
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg flex justify-center">
                  <img
                    src={record.selfieUrl}
                    alt="Check-in Selfie"
                    className="max-h-48 rounded-lg object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetailsModal;
