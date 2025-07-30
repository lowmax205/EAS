/**
 * EventsList Widget - Displays a list of upcoming events with interactive features
 * Features: Event display, Category badges, Status badges, View All functionality
 * Dependencies: Card component, Button component, date formatting utilities
 * Theme Support: Complete light/dark theme with smooth transitions
 * Accessibility: Proper semantic markup, keyboard navigation
 */

import React, { useMemo } from "react";
import { Calendar, Clock, MapPin, Users, Tag } from "lucide-react";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import {
  formatDate,
  formatTime,
} from "../../../../components/common/formatting";
import { CATEGORY_COLORS, STATUS_CONFIG } from "../../../../components/common/constants/index";
import { logUserInteraction } from "../../../../components/common/devLogger";

const EventsList = ({
  title = "Events",
  events = [],
  emptyMessage = "No events found",
  showViewAllButton = true,
  onViewAll = null,
  maxItems = 5,
}) => {
  // Sort events by date (upcoming first, then past events)
  const sortedEvents = useMemo(() => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    // Separate upcoming and past events
    const upcomingEvents = events
      .filter((event) => event.date >= todayString)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const pastEvents = events
      .filter((event) => event.date < todayString)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent past events first

    return [...upcomingEvents, ...pastEvents];
  }, [events]);

  const displayEvents = sortedEvents.slice(0, maxItems);

  // Enhanced onViewAll handler with logging
  const handleViewAll = () => {
    logUserInteraction("EventsList", "viewAllEvents", {
      eventsCount: events.length,
      displayedCount: displayEvents.length,
      title,
    });

    if (onViewAll) onViewAll();
  };

  // Event item click handler with logging
  const handleEventClick = (event) => {
    logUserInteraction("EventsList", "eventClick", {
      eventId: event.id,
      eventTitle: event.title,
      eventCategory: event.category,
    });
    // Could be expanded to handle event item clicks in the future
  };

  // Enhanced Category and Status styling based on expanded data
  const getCategoryStyle = (category) => {
    const bgStyles = {
      Academic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Sports: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Cultural: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Technology: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      Environmental: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      Leadership: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      Career: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      Workshop: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Competition: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Conference: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
      Health: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      Business: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Alumni: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
      Meeting: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      Seminar: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
    };
    return bgStyles[category] || bgStyles.Meeting;
  };

  // Get status styling
  const getStatusStyle = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming;
    return `${config.bg} ${config.text}`;
  };

  // Calculate relative time for events
  const getEventTimeInfo = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: "Today", isPast: false };
    if (diffDays === 1) return { text: "Tomorrow", isPast: false };
    if (diffDays > 0) return { text: `${diffDays} days away`, isPast: false };

    const pastDays = Math.abs(diffDays);
    if (pastDays === 1) return { text: "Yesterday", isPast: true };
    return { text: `${pastDays} days ago`, isPast: true };
  };

  return (
    <div className="lg:col-span-2">
      <Card title={title} className="h-fit">
        {displayEvents.length > 0 ? (
          <div className="space-y-4">
            {displayEvents.map((event, index) => {
              const timeInfo = getEventTimeInfo(event.date);

              return (
                <div
                  key={event.id || index}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    timeInfo.isPast
                      ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-75"
                      : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600"
                  }`}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Event Title and Time Info */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-theme">
                          {event.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs font-medium ${
                              timeInfo.isPast
                                ? "text-gray-500 dark:text-gray-400"
                                : "text-primary-600 dark:text-primary-400"
                            }`}
                          >
                            {timeInfo.text}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                              event.status
                            )}`}
                          >
                            {event.status}
                          </span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-theme opacity-70 mb-3">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(event.date, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(event.time)}
                          {event.endTime &&
                            ` - ${formatTime(event.endTime)}`}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </span>
                        {event.currentAttendees !== undefined &&
                          event.maxAttendees && (
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {event.currentAttendees}/{event.maxAttendees}{" "}
                              attendees
                            </span>
                          )}
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p className="text-xs text-theme opacity-60 mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {/* Category and Organizer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyle(
                              event.category
                            )}`}
                          >
                            <Tag className="h-3 w-3 inline mr-1" />
                            {event.category}
                          </span>
                          {event.requiresRegistration && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              Registration Required
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-theme opacity-50">
                          Organized by {event.organizer}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {showViewAllButton && onViewAll && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleViewAll} // Log view all button click
                >
                  View All Events
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-theme opacity-30 mx-auto mb-4" />
            <p className="text-theme opacity-70">{emptyMessage}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EventsList;
