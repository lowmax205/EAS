/**
 * MiniCalendar Widget - Displays a compact calendar with color-coded event indicators
 * Features: Date selection, Category-colored event indicators, Month navigation, Monthly events display
 * Dependencies: DataPreloadContext for all events, Event category colors, Date formatting utilities
 * Theme Support: Complete light/dark theme with smooth transitions
 * Accessibility: ARIA attributes, keyboard navigation support
 */

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../../../../components/ui/Card";
import { logUserInteraction } from "../../../../components/common/devLogger";
import { useDataPreload } from "../../../../services/DataPreloadContext";
import { CATEGORY_COLORS } from "../../../../components/common/constants/events";

/**
 * MiniCalendar - Compact calendar widget for dashboard
 * Features: Date selection, Event indicators with category colors, Month navigation, Monthly events list
 * @param {Object} props - Component props
 * @param {string} props.userRole - User role (student, organizer, admin)
 * @returns {JSX.Element} - Calendar widget component
 */
const MiniCalendar = ({ userRole }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { eventsData } = useDataPreload();

  // Get all events from preloaded data
  const allEvents = eventsData?.eventsList || [];

  // Get events for the current month
  const getEventsForCurrentMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    return allEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const currentMonthEvents = getEventsForCurrentMonth();

  /**
   * Get category color for event indicator
   * @param {string} category - Event category
   * @returns {string} - TailwindCSS background color class
   */
  const getCategoryColorBg = (category) => {
    switch (category) {
      case "Academic":
        return "bg-primary-600 dark:bg-primary-400";
      case "Sports":
        return "bg-green-600 dark:bg-green-400";
      case "Cultural":
        return "bg-purple-600 dark:bg-purple-400";
      case "Meeting":
        return "bg-blue-600 dark:bg-blue-400";
      case "Workshop":
        return "bg-orange-600 dark:bg-orange-400";
      case "Seminar":
        return "bg-red-600 dark:bg-red-400";
      default:
        return "bg-gray-600 dark:bg-gray-400";
    }
  };

  /**
   * Get events for a specific date and their categories
   * @param {Date} date - Date to check
   * @returns {Array} - Array of events for that date
   */
  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    return allEvents.filter((event) => event.date === dateString);
  };

  /**
   * Navigate to previous month
   */
  const prevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);

    logUserInteraction("MiniCalendar", "prevMonth", {
      from: currentMonth.toISOString(),
      to: newDate.toISOString(),
      userRole,
    });

    setCurrentMonth(newDate);
  };

  /**
   * Navigate to next month
   */
  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);

    logUserInteraction("MiniCalendar", "nextMonth", {
      from: currentMonth.toISOString(),
      to: newDate.toISOString(),
      userRole,
    });

    setCurrentMonth(newDate);
  };

  /**
   * Handle date selection
   */
  const handleDateSelect = (date) => {
    logUserInteraction("MiniCalendar", "selectDate", {
      date: date.toISOString(),
      userRole,
    });

    setSelectedDate(date);
  };

  /**
   * Get all days in the current month view (including padding days)
   */
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Get the day of the week for the first day (0 = Sunday)
    const firstDayOfWeek = firstDay.getDay();

    // Calculate days from previous month to display
    const daysFromPrevMonth = firstDayOfWeek;

    // Calculate total days in the current month
    const daysInMonth = lastDay.getDate();

    // Calculate how many days to show from next month
    const totalDaysToShow = 42; // 6 rows of 7 days
    const daysFromNextMonth = totalDaysToShow - daysInMonth - daysFromPrevMonth;

    // Generate calendar days
    const days = [];

    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (
      let i = prevMonthLastDay - daysFromPrevMonth + 1;
      i <= prevMonthLastDay;
      i++
    ) {
      days.push({
        date: new Date(year, month - 1, i),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Add days from current month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
        hasEvents: getEventsForDate(date).length > 0,
        eventsForDate: getEventsForDate(date),
      });
    }

    // Add days from next month
    for (let i = 1; i <= daysFromNextMonth; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  const calendarDays = getDaysInMonth();
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <Card title="Calendar" className="h-full flex flex-col">
      <div className="flex-grow flex flex-col">
        {/* Calendar header with month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5 text-theme" />
          </button>
          <h3 className="text-theme font-medium">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5 text-theme" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Weekday headers */}
          {weekdays.map((weekday) => (
            <div
              key={weekday}
              className="text-xs text-center font-medium text-theme opacity-70"
            >
              {weekday}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(day.date)}
              className={`
                h-8 w-8 rounded-full flex items-center justify-center text-xs relative
                ${!day.isCurrentMonth ? "text-theme opacity-30" : "text-theme"}
                ${
                  day.isToday
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-bold"
                    : day.hasEvents
                    ? "bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300 font-semibold"
                    : ""
                }
                ${
                  selectedDate &&
                  day.date.getDate() === selectedDate.getDate() &&
                  day.date.getMonth() === selectedDate.getMonth() &&
                  day.date.getFullYear() === selectedDate.getFullYear()
                    ? "border-2 border-primary-600 dark:border-primary-400"
                    : ""
                }
                hover:bg-gray-100 dark:hover:bg-gray-700
              `}
            >
              {day.date.getDate()}
              {day.hasEvents && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                  {/* Show up to 3 category indicators, group by category */}
                  {Array.from(
                    new Set(day.eventsForDate.map((event) => event.category))
                  )
                    .slice(0, 3)
                    .map((category, index) => (
                      <span
                        key={`${category}-${index}`}
                        className={`h-1 w-1 rounded-full ${getCategoryColorBg(
                          category
                        )}`}
                        title={`${category} event${
                          day.eventsForDate.filter(
                            (e) => e.category === category
                          ).length > 1
                            ? "s"
                            : ""
                        }`}
                      ></span>
                    ))}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Current month events */}
        <div className="flex-grow overflow-y-auto">
          <h4 className="text-sm font-medium text-theme mb-2">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })} Events
          </h4>

          {currentMonthEvents.length > 0 ? (
            <div className="space-y-2 h-full">
              {currentMonthEvents.map((event, index) => (
                <div
                  key={event.id || index}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-theme truncate">
                      {event.title}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColorBg(
                        event.category
                      )} text-white`}
                    >
                      {event.category}
                    </span>
                  </div>
                  <p className="text-xs text-theme opacity-60">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })} at {event.time}
                  </p>
                  {event.location && (
                    <p className="text-xs text-theme opacity-50 truncate">
                      {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-theme opacity-50">No events scheduled</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MiniCalendar;
