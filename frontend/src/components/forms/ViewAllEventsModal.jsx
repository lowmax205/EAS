/**
 * ViewAllEventsModal - Modal component for displaying all events
 * Features: Event categorization, Responsive design, Theme support
 * Dependencies: Modal pattern, useModal context, formatDate utility
 * Theme Support: Complete light/dark theme with smooth transitions
 * Mock Data: Integrated with mockEvents.json
 * Accessibility: Semantic structure, keyboard navigation, screen reader support
 */

import React, { useMemo } from "react";
import { X, Calendar, Clock, MapPin, CheckCircle, Clock as ClockIcon } from "lucide-react";
import { useModal } from "../../components/forms/ModalContext";
import { formatDate, formatTime } from "../../components/common/formatting";
import { logUserInteraction } from "../../components/common/devLogger";
import { STATUS_CONFIG } from "../../components/common/constants/index";
import useScrollLock from "../../components/common/useScrollLock";

/**
 * ViewAllEventsModal - Modal for displaying all events in the system
 * Features: All events display, Event details display, Category badges, Status badges
 * @param {Array} events - Array of all events to display
 * @returns {JSX.Element} - Modal with all events list
 */
const ViewAllEventsModal = ({ events = [] }) => {
  const { isViewAllEventsModalOpen, closeViewAllEventsModal } = useModal();

  // Enable scroll lock when modal is open
  useScrollLock(isViewAllEventsModalOpen);

  // Helper function to calculate days difference and event status
  const getEventStatus = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    
    // Set time to midnight for accurate day comparison
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        status: 'completed',
        days: Math.abs(diffDays),
        label: Math.abs(diffDays) === 1 ? '1 day ago' : `${Math.abs(diffDays)} days ago`
      };
    } else if (diffDays === 0) {
      return {
        status: 'today',
        days: 0,
        label: 'Today'
      };
    } else {
      return {
        status: 'upcoming',
        days: diffDays,
        label: diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`
      };
    }
  };

  // Get status badge styling
  const getStatusStyle = (status) => {
    // Map local status types to standard STATUS_CONFIG keys
    const statusMap = {
      completed: "completed",
      today: "ongoing", // Today events are considered ongoing
      upcoming: "upcoming"
    };
    
    const mappedStatus = statusMap[status] || "upcoming";
    const config = STATUS_CONFIG[mappedStatus] || STATUS_CONFIG.upcoming;
    return `${config.bg} ${config.text}`;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'today':
        return <ClockIcon className="h-3 w-3" />;
      case 'upcoming':
        return <Calendar className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  // Enhanced close handler with logging
  const handleClose = () => {
    logUserInteraction("ViewAllEventsModal", "closeModal", {
      eventsCount: events.length,
      timestamp: new Date().toISOString(),
    });
    closeViewAllEventsModal();
  };

  // Event item click handler with logging
  const handleEventClick = (event) => {
    logUserInteraction("ViewAllEventsModal", "eventClick", {
      eventId: event.id,
      eventTitle: event.title,
      eventCategory: event.category,
      eventDate: event.date,
      timestamp: new Date().toISOString(),
    });
    // Could be expanded to handle event item clicks in the future
  };

  // Sort all events by date (upcoming first, then past events)
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

  // Get category styling
  const getCategoryStyle = (category) => {
    const bgStyles = {
      Academic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Sports: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Cultural:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Meeting: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      Workshop:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Seminar: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return bgStyles[category] || bgStyles.Meeting;
  };

  // Enhanced stats calculation
  const eventStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const completed = events.filter(event => event.date < today).length;
    const upcoming = events.filter(event => event.date >= today).length;
    
    return {
      total: events.length,
      completed,
      upcoming
    };
  }, [events]);

  if (!isViewAllEventsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-xl font-semibold text-theme">All Events</h3>
              <p className="text-sm text-theme opacity-70 mt-1">
                {eventStats.upcoming} upcoming • {eventStats.completed} completed • {eventStats.total} total
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-theme" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto p-6">
            {sortedEvents.length > 0 ? (
              <div className="space-y-4">
                {sortedEvents.map((event, index) => {
                  const eventStatus = getEventStatus(event.date);
                  
                  return (
                    <div
                      key={event.id || index}
                      className="group p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-theme group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 flex-1 mr-3">
                              {event.title}
                            </h4>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1 ${getStatusStyle(eventStatus.status)}`}
                              >
                                {getStatusIcon(eventStatus.status)}
                                {eventStatus.status === 'completed' ? 'Completed' : 
                                 eventStatus.status === 'today' ? 'Today' : 'Upcoming'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-theme opacity-70">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                              {formatDate(event.date, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                              {formatTime(event.time)}
                            </span>
                            <span className="flex items-center font-medium text-primary-600 dark:text-primary-400">
                              {eventStatus.label}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-theme opacity-60 flex items-center truncate mr-2">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </span>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getCategoryStyle(
                                  event.category
                                )}`}
                              >
                                {event.category}
                              </span>
                              {event.currentAttendees && event.maxAttendees && (
                                <span className="text-xs text-theme opacity-60 whitespace-nowrap">
                                  {event.currentAttendees}/{event.maxAttendees}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-theme opacity-30 mx-auto mb-4" />
                <p className="text-theme opacity-70 text-lg">No events found</p>
                <p className="text-theme opacity-50 text-sm mt-2">
                  Check back later for new events!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between text-xs text-theme opacity-70">
              <div className="flex items-center space-x-4">
                <span>Total: {eventStats.total} events</span>
                <span className="text-green-600 dark:text-green-400">
                  Upcoming: {eventStats.upcoming}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  Completed: {eventStats.completed}
                </span>
              </div>
              <span>Events sorted by date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllEventsModal;
