import React, { useState, useEffect, useMemo } from "react";
import { useModal } from "../components/forms/ModalContext";
import { Calendar, Grid, List, Search, Filter, SortAsc, TrendingUp, Clock, MapPin, Users, Star } from "lucide-react";
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
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(false);
  const { openLogin, openEventDetails } = useModal();

  // Fetch events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const eventsData = mockEventsData.events.map((event) => ({
          ...event,
          location: event.venue?.name || event.location || "Unknown Location",
          attendancePercentage: event.maxAttendees > 0 
            ? Math.round((event.currentAttendees / event.maxAttendees) * 100) 
            : 0,
          organizerName: event.organizer || "Unknown Organizer",
          venueAddress: event.venue?.address || "",
          venueCapacity: event.venue?.capacity || event.maxAttendees || 0,
          coordinates: event.venue?.coordinates || null,
          isAvailable: event.allow_entry && event.status === "upcoming",
          isPublic: event.isPublic !== false, // Default to public
        }));
        setEvents(eventsData);
      } catch (error) {
        devError("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Set up event filtering with enhanced sorting
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
    getActiveFiltersCount,
  } = useFilters(filterConfig, events, eventFilterFunction);

  // Enhanced sorting logic (now after filteredEvents is available)
  const sortedEvents = useMemo(() => {
    let sorted = [...filteredEvents];
    
    switch (sortBy) {
      case "popularity":
        sorted = sorted.sort((a, b) => {
          const aPopularity = (a.currentAttendees / a.maxAttendees) * 100;
          const bPopularity = (b.currentAttendees / b.maxAttendees) * 100;
          return bPopularity - aPopularity;
        });
        break;
      case "alphabetical":
        sorted = sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "date":
      default:
        sorted = sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
    }
    
    return sorted;
  }, [filteredEvents, sortBy]);

  // Get trending events (recently created, growing attendance)
  const trendingEvents = useMemo(() => {
    return events.filter(event => {
      const createdDate = new Date(event.createdAt);
      const daysSinceCreated = (new Date() - createdDate) / (1000 * 60 * 60 * 24);
      return daysSinceCreated <= 7 && event.status === "upcoming";
    }).slice(0, 4);
  }, [events]);

  // Quick stats for hero section
  const eventStats = useMemo(() => {
    const total = events.length;
    const upcoming = events.filter(e => e.status === "upcoming").length;
    const thisWeek = events.filter(e => {
      const eventDate = new Date(e.date);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate >= today && eventDate <= weekFromNow;
    }).length;
    
    return { total, upcoming, thisWeek };
  }, [events]);

  // Pagination for events with dynamic sizing based on view mode
  const itemsPerPageByMode = viewMode === "grid" ? 9 : 12;
  const {
    paginatedData: paginatedEvents,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    onPageChange,
    onItemsPerPageChange,
    resetPagination,
  } = usePagination(sortedEvents, itemsPerPageByMode);

  // Reset pagination when filtered data changes
  useEffect(() => {
    resetPagination();
  }, [sortedEvents.length, resetPagination, viewMode]);

  // Trending Event Card Component
  const TrendingEventCard = ({ event }) => (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700"
      onClick={() => openEventDetails(event)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-xs font-medium text-green-600 dark:text-green-400">Trending</span>
        </div>
        {getStatusBadge(event.status)}
      </div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">{event.title}</h4>
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-2" />
          {formatDate(event.date)}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-3 h-3 mr-2" />
            {event.currentAttendees}/{event.maxAttendees}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(event.category)} bg-opacity-10`}>
            {event.category}
          </span>
        </div>
      </div>
    </div>
  );

  // List View Event Item Component
  const ListEventItem = ({ event }) => (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700"
      onClick={() => openEventDetails(event)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-lg ${getCategoryColor(event.category)} bg-opacity-10 flex items-center justify-center`}>
                <Calendar className={`w-6 h-6 ${getCategoryColor(event.category)}`} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{event.title}</h3>
                {getStatusBadge(event.status)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{event.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              {formatTime(event.time)}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-gray-400" />
              {event.currentAttendees} / {event.maxAttendees}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2 ml-4">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${getCategoryColor(event.category)} bg-opacity-10`}>
            {event.category}
          </span>
          <Button 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openLogin();
            }}
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='5'/%3E%3Ccircle cx='53' cy='7' r='5'/%3E%3Ccircle cx='30' cy='30' r='5'/%3E%3Ccircle cx='7' cy='53' r='5'/%3E%3Ccircle cx='53' cy='53' r='5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                University Events
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto mb-8">
              Discover amazing events, connect with your community, and create unforgettable experiences at {UNIVERSITY_NAME}
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{eventStats.total}</div>
                <div className="text-sm text-primary-200">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{eventStats.upcoming}</div>
                <div className="text-sm text-primary-200">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{eventStats.thisWeek}</div>
                <div className="text-sm text-primary-200">This Week</div>
              </div>
            </div>

            {/* Quick Search */}
            <div className="max-w-xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events, categories, or locations..."
                  value={searchTerm}
                  onChange={(e) => handleSearchTermChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Events Section */}
      {trendingEvents.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending This Week</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingEvents.map((event) => (
              <TrendingEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-6">
        {/* Enhanced Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              All Events ({filteredEvents.length})
            </h2>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "grid" 
                    ? "bg-primary-500 text-white shadow-sm" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "list" 
                    ? "bg-primary-500 text-white shadow-sm" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <SortAsc className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="date">Sort by Date</option>
                <option value="popularity">Sort by Popularity</option>
                <option value="alphabetical">Sort Alphabetically</option>
              </select>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                  {getActiveFiltersCount()}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-8">
            <FilterComponent
              searchTerm={searchTerm}
              setSearchTerm={handleSearchTermChange}
              filters={filterConfig}
              onFilterChange={handleFilterChangeWithLogging}
              onClearFilters={handleClearFilters}
              showActiveFilters={true}
              showResultsCount={true}
              totalResults={events.length}
              filteredResults={filteredEvents.length}
              variant="inline"
            />
          </div>
        )}

        {/* Events Display */}
        {sortedEvents.length === 0 ? (
          <Card className="text-center py-16">
            <Calendar className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Events Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              We couldn't find any events matching your criteria. Try adjusting your search or filters.
            </p>
            <Button onClick={handleClearFilters} variant="outline">
              Clear All Filters
            </Button>
          </Card>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    getCategoryColor={getCategoryColor}
                    getStatusBadge={getStatusBadge}
                    onJoinClick={openLogin}
                    onViewDetails={openEventDetails}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-4 mb-8">
                {paginatedEvents.map((event) => (
                  <ListEventItem key={event.id} event={event} />
                ))}
              </div>
            )}
            
            {/* Enhanced Pagination */}
            {sortedEvents.length > itemsPerPage && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={sortedEvents.length}
                  onPageChange={onPageChange}
                  onItemsPerPageChange={onItemsPerPageChange}
                  itemsPerPageOptions={viewMode === "grid" ? [9, 18, 27, 36] : [12, 24, 36, 48]}
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
