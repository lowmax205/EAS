import React, { useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  ExternalLink,
  Building,
  UserCheck,
  Eye,
  Star,
  Info,
  AlertCircle,
  CheckCircle,
  Globe,
  Lock,
} from "lucide-react";
import Button from "../ui/Button";
import { formatDate, formatTime } from "../common/formatting";
import { CATEGORY_COLORS, STATUS_CONFIG } from "../common/constants/index";
import { devLog } from "../common/devLogger";
import useScrollLock from "../common/useScrollLock";

/**
 * EventDetailsModal component for displaying detailed information about an event
 */
const EventDetailsModal = ({ isOpen, onClose, event }) => {
  // All hooks must be called before any conditional returns
  // Enable scroll lock when modal is open
  useScrollLock(isOpen, [event?.title]);

  // Return null if modal is not open or no event is provided
  // This must come after all hooks have been called
  if (!isOpen || !event) {
    return null;
  }

  // Safety check for required event properties with enhanced data
  const category = event.category || "Uncategorized";
  const status = event.status || "upcoming";
  const title = event.title || "Unnamed Event";
  const description = event.description || "No description available";
  const date = event.date || "";
  const time = event.time || "";
  const endTime = event.endTime || "";
  const location = event.venue?.name || event.location || "TBD";
  const venueAddress = event.venue?.address || "";
  const venueCapacity = event.venue?.capacity || event.maxAttendees || 100;
  const venueCoordinates = event.venue?.coordinates || null;
  const currentAttendees = event.currentAttendees || 0;
  const maxAttendees = event.maxAttendees || 100;
  const organizerName = event.organizer || event.organizerName || "Unknown Organizer";
  const organizerId = event.organizerId || null;
  const attendancePercentage = event.attendancePercentage || 
    (maxAttendees > 0 ? Math.round((currentAttendees / maxAttendees) * 100) : 0);
  const requiresRegistration = event.requiresRegistration || false;
  const isPublic = event.isPublic !== undefined ? event.isPublic : true;
  const isAvailable = event.allow_entry && status === "upcoming";
  const isFullyBooked = currentAttendees >= maxAttendees;
  const qrCode = event.qrCode || null;
  const eventBackground = event.eventBackground || null;
  const tags = event.tags || [];
  const createdAt = event.createdAt || null;
  const updatedAt = event.updatedAt || null;

  // Get category color
  const getCategoryColor = (category) => {
    return CATEGORY_COLORS[category] || "text-theme";
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative w-full max-w-5xl mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl theme-transition max-h-[90vh] overflow-hidden">
        {/* Enhanced Header with Event Status and Category */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Tag className={`w-6 h-6 ${getCategoryColor(category)}`} />
                <span className={`text-sm font-medium px-3 py-1 rounded-full bg-white dark:bg-gray-700 ${getCategoryColor(category)}`}>
                  {category}
                </span>
                {getStatusBadge(status)}
                <div className="flex items-center space-x-2">
                  {isPublic ? (
                    <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-xs text-orange-600 dark:text-orange-400">
                      <Lock className="w-3 h-3" />
                      <span>Private</span>
                    </div>
                  )}
                  {requiresRegistration && (
                    <div className="flex items-center space-x-1 text-xs text-primary-600 dark:text-primary-400">
                      <UserCheck className="w-3 h-3" />
                      <span>Registration Required</span>
                    </div>
                  )}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground-light dark:text-foreground-dark theme-transition mb-2">
                {title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-foreground-light dark:text-foreground-dark opacity-70">
                <span>Organized by: {organizerName}</span>
                {qrCode && (
                  <span className="flex items-center space-x-1">
                    <span>•</span>
                    <span>QR: {qrCode}</span>
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <X className="w-6 h-6 text-foreground-light dark:text-foreground-dark" />
            </button>
          </div>
        </div>

        {/* Enhanced Body with Card-like Layout */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content - Description and Key Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Event Description Card */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 theme-transition">
                <div className="flex items-center space-x-2 mb-4">
                  <Info className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                    About this event
                  </h3>
                </div>
                <p className="text-foreground-light dark:text-foreground-dark opacity-80 whitespace-pre-line leading-relaxed">
                  {description}
                </p>
                
                {/* Tags below description */}
                {tags && tags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-foreground-light dark:text-foreground-dark opacity-90 whitespace-pre-line leading-relaxed"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Event Schedule & Location Card */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 theme-transition">
                <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span>Schedule & Location</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground-light dark:text-foreground-dark">Date</p>
                        <p className="text-foreground-light dark:text-foreground-dark opacity-70">
                          {date ? formatDate(date) : "Date TBD"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-primary-600 dark:text-primary-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground-light dark:text-foreground-dark">Time</p>
                        <p className="text-foreground-light dark:text-foreground-dark opacity-70">
                          {time ? formatTime(time) : "Start time TBD"}
                          {endTime && time && ` - ${formatTime(endTime)}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground-light dark:text-foreground-dark">Venue</p>
                        <p className="text-foreground-light dark:text-foreground-dark opacity-70">
                          {location}
                        </p>
                        {venueAddress && (
                          <p className="text-sm text-foreground-light dark:text-foreground-dark opacity-60 mt-1">
                            {venueAddress}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Building className="w-5 h-5 text-primary-600 dark:text-primary-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground-light dark:text-foreground-dark">Capacity</p>
                        <p className="text-foreground-light dark:text-foreground-dark opacity-70">
                          {venueCapacity} people maximum
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar - Attendance & Actions */}
            <div className="space-y-6">
              
              {/* Attendance Progress Card */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 theme-transition">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                    Attendance
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground-light dark:text-foreground-dark">
                      {currentAttendees}
                    </span>
                    <span className="text-sm text-foreground-light dark:text-foreground-dark opacity-70">
                      of {maxAttendees}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-foreground-light dark:text-foreground-dark opacity-70">
                      <span>Progress</span>
                      <span>{attendancePercentage}% Full</span>
                    </div>
                    <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-3 theme-transition">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          attendancePercentage >= 90 
                            ? "bg-red-600 dark:bg-red-500" 
                            : attendancePercentage >= 70 
                            ? "bg-yellow-600 dark:bg-yellow-500" 
                            : "bg-primary-600 dark:bg-primary-500"
                        }`}
                        style={{
                          width: `${Math.min(attendancePercentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Indicators */}
                  <div className="space-y-2 pt-2">
                    {isFullyBooked && (
                      <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>Event is fully booked</span>
                      </div>
                    )}
                    {isAvailable && !isFullyBooked && (
                      <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Registration available</span>
                      </div>
                    )}
                    {!isAvailable && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>Registration closed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Metadata Card */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 theme-transition">
                <div className="flex items-center space-x-2 mb-4">
                  <Info className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark">
                    Event Details
                  </h3>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-light dark:text-foreground-dark opacity-70">Event ID:</span>
                    <span className="font-medium text-foreground-light dark:text-foreground-dark">#{event.id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-foreground-light dark:text-foreground-dark opacity-70">Organizer ID:</span>
                    <span className="font-medium text-foreground-light dark:text-foreground-dark">
                      {organizerId ? `#${organizerId}` : "N/A"}
                    </span>
                  </div>
                  
                  {createdAt && (
                    <div className="flex justify-between">
                      <span className="text-foreground-light dark:text-foreground-dark opacity-70">Created:</span>
                      <span className="font-medium text-foreground-light dark:text-foreground-dark">
                        {formatDate(createdAt.split('T')[0])}
                      </span>
                    </div>
                  )}
                  
                  {updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-foreground-light dark:text-foreground-dark opacity-70">Updated:</span>
                      <span className="font-medium text-foreground-light dark:text-foreground-dark">
                        {formatDate(updatedAt.split('T')[0])}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Enhanced Footer with Action Buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 theme-transition">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-4 text-sm text-foreground-light dark:text-foreground-dark opacity-70">
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>Event Details</span>
              </span>
              {venueCoordinates && (
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Location Available</span>
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                disabled={isFullyBooked || !isAvailable}
                className="flex items-center space-x-2"
              >
                {isFullyBooked ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Full</span>
                  </>
                ) : !isAvailable ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Closed</span>
                  </>
                ) : requiresRegistration ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Register Now</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Join Event</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
