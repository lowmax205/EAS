import React from "react";
import { formatDate } from "../../../components/common/formatting";

/**
 * DashboardHeader component with title and date
 * @param {Object} props - Component props
 * @param {string} props.userRole - User role (student, organizer, admin)
 * @returns {JSX.Element} Dashboard header with title and date
 */
const DashboardHeader = ({ userRole }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-theme">Dashboard</h1>
        <p className="text-theme opacity-70 mt-1">
          {formatDate(new Date().toISOString(), {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center space-x-4">
        {/* NotificationBell moved to Header component */}
        {/* Add other header actions here if needed */}
      </div>
    </div>
  );
};

export default DashboardHeader;
