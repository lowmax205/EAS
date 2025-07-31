import React from "react";
import { Tag, Calendar, Clock, MapPin, Users, Eye, ArrowRight } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { formatDate, formatTime } from "../../components/common/formatting";
import { logUserInteraction } from "../../components/common/devLogger";

/**
 * EventCard component for displaying individual events
 */
const EventCard = ({
  event,
  getCategoryColor,
  getStatusBadge,
  onJoinClick,
  onViewDetails,
}) => {
  if (!event) {
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
  const currentAttendees = event.currentAttendees || 0;
  const maxAttendees = event.maxAttendees || 100;
  const organizerName = event.organizer || event.organizerName || "Unknown Organizer";
  const attendancePercentage = event.attendancePercentage || 
    (maxAttendees > 0 ? Math.round((currentAttendees / maxAttendees) * 100) : 0);
  const isAvailable = event.allow_entry && status === "upcoming";
  const isFullyBooked = currentAttendees >= maxAttendees;

  return (
    <Card className="hover:shadow-light-lg dark:hover:shadow-dark-lg theme-transition h-full">
      <div className="flex flex-col h-full -m-6 p-4">
        {/* Main Content - grows to fill available space */}
        <div className="flex-grow space-y-3">
          {/* Event Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Tag className={`w-4 h-4 flex-shrink-0 ${getCategoryColor(category)}`} />
              <span
                className={`text-sm font-medium truncate ${getCategoryColor(category)}`}
              >
                {category}
              </span>
            </div>
            {getStatusBadge(status)}
          </div>
          {/* Event Title & Description - Fixed height section */}
          <div className="min-h-[96px]">
            <h3 className="text-lg font-semibold text-foreground-light dark:text-foreground-dark theme-transition mb-4 line-clamp-2 min-h-[56px]">
              {title}
            </h3>
            <p className="text-foreground-light dark:text-foreground-dark opacity-70 text-sm line-clamp-2 theme-transition min-h-[40px]">
              {description}
            </p>
          </div>
          {/* Event Details - Streamlined for summary view - Fixed height section */}
          <div className="space-y-2 min-h-[120px] flex-shrink-0">
            <div className="flex items-center space-x-2 text-sm text-foreground-light dark:text-foreground-dark opacity-70 theme-transition">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{date ? formatDate(date) : "Date TBD"}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-foreground-light dark:text-foreground-dark opacity-70 theme-transition">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {time ? formatTime(time) : "Time TBD"}
                {endTime && time && ` - ${formatTime(endTime)}`}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-foreground-light dark:text-foreground-dark opacity-70 theme-transition">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-foreground-light dark:text-foreground-dark opacity-70 theme-transition">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {currentAttendees} / {maxAttendees} ({attendancePercentage}%)
              </span>
              {isFullyBooked && (
                <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded flex-shrink-0">
                  Full
                </span>
              )}
            </div>

          </div>
          {/* Simplified Progress Bar - Fixed height section */}
          <div className="space-y-2 flex-shrink-0 min-h-[44px]">
            <div className="flex justify-between text-xs text-foreground-light dark:text-foreground-dark opacity-70 theme-transition">
              <span>Attendance</span>
              <span>{attendancePercentage}% Full</span>
            </div>
            <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-2 theme-transition">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
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
        </div>
        
        {/* Simplified Action Buttons - Always at bottom - Fixed height */}
        <div className="flex space-x-2 pt-4 mt-auto flex-shrink-0 min-h-[40px]">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              logUserInteraction("view_details", event.id);
              onViewDetails(event);
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            Details
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={isFullyBooked || !isAvailable}
            onClick={() => {
              logUserInteraction("join_event", event.id);
              onJoinClick();
            }}
          >
            {isFullyBooked ? (
              <>Full</>
            ) : !isAvailable ? (
              <>Closed</>
            ) : (
              <>Register</>
            )}
            {!isFullyBooked && isAvailable && <ArrowRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EventCard;
