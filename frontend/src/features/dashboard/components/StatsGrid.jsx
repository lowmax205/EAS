import React from "react";
import { Calendar, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { StatsCard } from "../../../components/common";

/**
 * StatsGrid component displaying key dashboard statistics
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics object containing data
 * @param {string} props.userRole - User role (student, organizer, admin)
 * @returns {JSX.Element} Grid of statistics cards
 */
const StatsGrid = ({ stats, userRole }) => {
  if (!stats) {
    stats = {
      totalEvents: 0,
      attendedEvents: 0,
      upcomingEvents: 0,
      attendanceRate: 0
    };
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title={userRole === "student" ? "Available Events" : "Total Events"}
        value={stats.totalEvents}
        subtitle="Events in the system"
        icon={<Calendar />}
        iconBg="bg-blue-100 dark:bg-blue-900"
        iconColor="text-blue-600 dark:text-blue-400"
      />
      <StatsCard
        title={userRole === "student" ? "Events Attended" : "Total Attendance"}
        value={stats.attendedEvents}
        subtitle="Attendance records"
        icon={<CheckCircle />}
        iconBg="bg-green-100 dark:bg-green-900"
        iconColor="text-green-600 dark:text-green-400"
      />
      <StatsCard
        title="Upcoming Events"
        value={stats.upcomingEvents}
        subtitle="Events coming up"
        icon={<Clock />}
        iconBg="bg-purple-100 dark:bg-purple-900"
        iconColor="text-purple-600 dark:text-purple-400"
      />
      <StatsCard
        title={userRole === "student" ? "Attendance Rate" : "Overall Rate"}
        value={`${stats.attendanceRate}%`}
        subtitle="Success rate"
        icon={<BarChart3 />}
        iconBg="bg-orange-100 dark:bg-orange-900"
        iconColor="text-orange-600 dark:text-orange-400"
      />
    </div>
  );
};

export default StatsGrid;
