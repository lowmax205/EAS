/**
 * MainContentGrid component displaying events, analytics, activity feed, and calendar
 * Features: Responsive grid layout, Role-based content display, Widget positioning
 * Dependencies: EventsList, ActivityFeed, WebsiteAnalytics, MiniCalendar widgets
 * Theme Support: Complete light/dark theme with smooth transitions
 * Grid Layout: 3-column layout with proper component positioning
 * Note: MiniCalendar now fetches all events from DataPreloadContext
 */
import React from "react";
import {
  EventsList,
  ActivityFeed,
  WebsiteAnalytics,
  MiniCalendar,
} from "../../../components/common";

/**
 * MainContentGrid component displaying events, analytics, activity feed, and calendar
 * @param {Object} props - Component props
 * @param {Array} props.upcomingEvents - List of upcoming events
 * @param {Array} props.recentAttendance - List of recent attendance records
 * @param {string} props.userRole - User role (student, organizer, admin)
 * @param {Function} props.onViewAllEvents - Handler for viewing all events
 * @param {Function} props.onViewAllActivity - Handler for viewing all activity
 * @returns {JSX.Element} Main dashboard content grid
 */
const MainContentGrid = ({
  upcomingEvents = [],
  recentAttendance = [],
  userRole,
  onViewAllEvents,
  onViewAllActivity,
}) => {
  // Transform attendance records to activity format
  const activities = recentAttendance.map((record) => ({
    id: record.id,
    type: "attendance",
    eventTitle: `Event #${record.eventId}`,
    status: record.status,
    checkInTime: record.checkInTime,
    checkInMethod: record.checkInMethod,
    description:
      record.status === "present"
        ? "Successfully checked in"
        : "Marked as absent",
  }));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-min">
      {/* Left Column - Events and Analytics */}
      <div className="lg:col-span-2 space-y-6">
        {/* EventsList - Flexible height based on content */}
        <div className="h-fit">
          <EventsList
            title="Upcoming Events"
            events={upcomingEvents}
            emptyMessage="No upcoming events found."
            onViewAll={onViewAllEvents}
            maxItems={5}
          />
        </div>

        {/* Website Analytics for Admin/Organizer - Flexible height */}
        <div className="h-fit">
          <WebsiteAnalytics userRole={userRole} />
        </div>
      </div>

      {/* Right Column - Activity & Calendar */}
      <div className="flex flex-col space-y-6 h-full">
        <div className="h-fit">
          <ActivityFeed
            title={
              userRole === "student"
                ? "My Recent Attendance"
                : "Recent Activity"
            }
            activities={activities}
            emptyMessage={
              userRole === "student"
                ? "No attendance records yet."
                : "System activity will appear here."
            }
            onViewAll={onViewAllActivity}
            userRole={userRole}
            maxItems={5}
          />
        </div>
        <div className="flex-1">
          <MiniCalendar userRole={userRole} />
        </div>
      </div>
    </div>
  );
};

export default MainContentGrid;
