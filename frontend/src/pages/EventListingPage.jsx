import React, { useState, useEffect, useMemo } from "react";
import { useModal } from "../components/forms/ModalContext";
import { Calendar } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EventCard from "../features/events/EventCard";
import FilterComponent from "../components/common/FilterComponent";
import useFilters from "../components/common/useFilters";
import { usePagination } from "../components/common";
import Pagination from "../components/ui/Pagination";
import {
  createEventFilterConfig,
  eventFilterFunction,
} from "../components/common/filterConfigs";
import {
  STATUS_CONFIG,
  CATEGORY_COLORS,
  UNIVERSITY_NAME,
} from "../components/common/constants/index";
import { formatDate, formatTime } from "../components/common/formatting";
import {
  devError,
  logUserInteraction,
} from "../components/common/devLogger";
import mockEventsData from "../data/mockEvents.json";

/**
 * EventListingPage component displays all public events with filtering capabilities
 */
const EventListingPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { openLogin, openEventDetails } = useModal();

  // Fetch events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        // Use expanded mock events data from JSON file
        const eventsData = mockEventsData.events.map((event) => ({
          ...event,
          // Enhanced location handling with venue details
          location: event.venue?.name || event.location || "Unknown Location",
          // Enhanced capacity and attendance data
          attendancePercentage: event.maxAttendees > 0 
            ? Math.round((event.currentAttendees / event.maxAttendees) * 100) 
            : 0,
          // Enhanced organizer information
          organizerName: event.organizer || "Unknown Organizer",
          // Enhanced venue information
          venueAddress: event.venue?.address || "",
          venueCapacity: event.venue?.capacity || event.maxAttendees || 0,
          coordinates: event.venue?.coordinates || null,
          // Enhanced status handling
          isAvailable: event.allow_entry && event.status === "upcoming",
          // Enhanced registration information
          requiresRegistration: event.requiresRegistration || false,
          isPublic: event.isPublic !== false, // Default to public
        }));
        setEvents(eventsData);
        
        // Log enhanced event loading for development
        devError(`Loaded ${eventsData.length} events with enhanced data structure`);
      } catch (error) {
        devError("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Set up event filtering
  const filterConfig = useMemo(() => createEventFilterConfig(events), [events]);

  // Custom handler for search term changes
  const handleSearchTermChange = (term) => {
    logUserInteraction("EventListingPage", "search", {
      searchTerm: term,
      resultsCount: events.filter(
        (event) =>
          event.title.toLowerCase().includes(term.toLowerCase()) ||
          event.description.toLowerCase().includes(term.toLowerCase())
      ).length,
    });
    setSearchTerm(term);
  };

  // Custom handler for filter changes
  const handleFilterChangeWithLogging = (filterName, value) => {
    logUserInteraction("EventListingPage", "filter", {
      filterName,
      filterValue: value,
    });
    handleFilterChange(filterName, value);
  };

  // Custom handler for clearing filters
  const handleClearFilters = () => {
    logUserInteraction("EventListingPage", "clearFilters");
    clearAllFilters();
  };

  const {
    searchTerm,
    setSearchTerm,
    filters,
    filteredData: filteredEvents,
    handleFilterChange,
    clearAllFilters,
  } = useFilters(filterConfig, events, eventFilterFunction);

  // Pagination for events (default: 9 items per page for better grid layout)
  const {
    paginatedData: paginatedEvents,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    onPageChange,
    onItemsPerPageChange,
    resetPagination,
  } = usePagination(filteredEvents, 9);

  // Reset pagination when filtered data changes
  useEffect(() => {
    resetPagination();
  }, [filteredEvents.length, resetPagination]);

  /**
   * Renders status badge for an event
   */
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

  /**
   * Returns the appropriate color class for a category
   */
  const getCategoryColor = (category) => {
    return (
      CATEGORY_COLORS[category] || "text-primary-600 dark:text-primary-400"
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark theme-transition flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-500 mx-auto mb-4"></div>
          <p className="text-foreground-light dark:text-foreground-dark theme-transition">
            Loading events...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark theme-transition">
      {/* Header Section */}
      <div className="bg-card-light dark:bg-card-dark shadow-light-md dark:shadow-dark-md theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground-light dark:text-foreground-dark theme-transition mb-4">
              University Events
            </h1>
            <p className="text-xl text-foreground-light dark:text-foreground-dark opacity-70 max-w-2xl mx-auto theme-transition">
              Discover and participate in exciting events happening at{" "}
              {UNIVERSITY_NAME}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reusable Filter Component */}
        <FilterComponent
          searchTerm={searchTerm}
          setSearchTerm={handleSearchTermChange}
          searchPlaceholder="Search events..."
          filters={filters}
          onFilterChange={handleFilterChangeWithLogging}
          onClearFilters={handleClearFilters}
          showActiveFilters={true}
          showResultsCount={true}
          totalResults={events.length}
          filteredResults={filteredEvents.length}
          variant="dropdown"
        />

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 text-primary-600 dark:text-primary-400 opacity-50 mx-auto mb-4 theme-transition" />
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark theme-transition mb-2">
              No Events Found
            </h3>
            <p className="text-foreground-light dark:text-foreground-dark opacity-70 mb-4 theme-transition">
              Try adjusting your search or filter criteria to find events.
            </p>
            <Button onClick={handleClearFilters}>Clear Filters</Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {paginatedEvents.map((event) => (
                <div key={event.id} className="h-full">
                  <EventCard
                    event={event}
                    getCategoryColor={getCategoryColor}
                    getStatusBadge={getStatusBadge}
                    onJoinClick={openLogin}
                    onViewDetails={openEventDetails}
                  />
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {filteredEvents.length > itemsPerPage && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredEvents.length}
                  onPageChange={onPageChange}
                  onItemsPerPageChange={onItemsPerPageChange}
                  itemsPerPageOptions={[9, 18, 27, 36]}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventListingPage;
