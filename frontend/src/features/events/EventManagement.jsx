import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { useCampus } from "../../contexts/CampusContext";
import { useApi } from "../../hooks/useApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FilterComponent from "../../components/common/FilterComponent";
import useFilters from "../../components/common/useFilters";
import usePagination from "../../components/common/usePagination";
import Pagination from "../../components/ui/Pagination";
import MapPicker from "../../services/mapboxAPI/MapPicker";
import {
  Calendar,
  Edit,
  Trash2,
  Plus,
  MapPin,
  Users,
  Clock,
  Upload,
  Image,
  X,
  LogIn,
  LogOut,
  Map,
  EyeOff,
} from "lucide-react";
import { mapboxService } from "../../services/mapboxapiService";
import mockEventsData from "../../data/mockEvents.json";
import {
  createEventFilterConfig,
  eventFilterFunction,
} from "../../components/common/filterConfigs";
import {
  EVENT_CATEGORIES,
  EVENT_STATUS,
  STATUS_CONFIG,
  CATEGORY_COLORS,
} from "../../components/common/constants/index";
import { formatDate, formatTime } from "../../components/common/formatting";
import { devError, devLog } from "../../components/common/devLogger";
import useScrollLock from "../../components/common/useScrollLock";
import campusQRService from "../../services/campusQRService";

const EventManagement = ({ shouldCreateEvent, onCreateEventTriggered }) => {
  const { user: _user } = useAuth();
  const { events: _events, loading: _loading, error: _error } = useApi();
  
  // Campus context for multi-campus filtering
  const campusContext = useCampus();
  const { currentCampus, userCampusPermissions, isLoading: campusLoading } = campusContext;

  const [eventsList, setEventsList] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Enable scroll lock when any modal is open
  useScrollLock(showCreateModal || showEditModal);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    venue: "",
    location: {
      address: "",
      coordinates: {
        lat: null,
        lng: null,
      },
    },
    category: EVENT_CATEGORIES[1].value, // Default to Academic
    maxAttendees: "",
    organizer: "",
    status: EVENT_STATUS[1].value, // Default to upcoming
    eventBackground: "",
    coverImagePreview: null,
    allowEntry: true,
    checkInEnabled: false,
    checkOutEnabled: false,
  });

  // Location search and mapping states
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [locationSearchResults, setLocationSearchResults] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const mapPickerRef = useRef(null);

  // Handle the shouldCreateEvent prop to automatically open create modal
  useEffect(() => {
    if (shouldCreateEvent && !showCreateModal) {
      setShowCreateModal(true);
      if (onCreateEventTriggered) {
        onCreateEventTriggered();
      }
    }
  }, [shouldCreateEvent, showCreateModal, onCreateEventTriggered]);

  // Trigger map resize when map becomes visible
  useEffect(() => {
    if (showMap && mapPickerRef.current && mapPickerRef.current.resizeMap) {
      const timer = setTimeout(() => {
        mapPickerRef.current.resizeMap();
      }, 350); // Wait for transition to complete (300ms + buffer)
      return () => clearTimeout(timer);
    }
  }, [showMap]);

  // Memoize the filter configuration to prevent infinite re-renders
  const filterConfig = useMemo(() => {
    const options = {};
    
    // Add campus filtering if user can access multiple campuses
    if (!campusLoading && userCampusPermissions?.canSwitchCampuses) {
      options.includeCampusFilter = true;
      
      // Use multi-select for admin users, single-select for others
      if (userCampusPermissions.canAccessMultipleCampuses) {
        options.campusFilterType = 'multi';
        options.showAllCampusesOption = userCampusPermissions.isSuperAdmin;
      } else {
        options.campusFilterType = 'single';
        options.showAllCampusesOption = false;
      }
    }
    
    return createEventFilterConfig(eventsList, options);
  }, [eventsList, campusLoading, userCampusPermissions]);


  // Use the custom filter hook with centralized filter configuration
  const {
    searchTerm,
    setSearchTerm,
    filters,
    filteredData: filteredEvents,
    handleFilterChange,
    clearAllFilters,
  } = useFilters(
    filterConfig, 
    eventsList, 
    // Custom filter function that passes campus context
    (data, searchTerm, filters) => eventFilterFunction(data, searchTerm, filters, campusContext)
  );

  // Centralized pagination for filtered events
  const {
    paginatedData: paginatedEvents,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    onPageChange,
    onItemsPerPageChange,
    paginationInfo
  } = usePagination(filteredEvents, 10);

  useEffect(() => {
    loadEvents();
  }, [currentCampus.id, userCampusPermissions]); // Reload when campus context changes

  /**
   * Loads events from mock data source with campus-aware filtering
   * Story 1.5: Campus-Filtered Event Listing
   */
  const loadEvents = async () => {
    try {
      // Use mock events data from JSON file
      let eventsData = mockEventsData.events.map((event) => ({
        ...event,
        // Ensure compatibility with existing component structure
        maxAttendees: event.maxAttendees || 0,
        currentAttendees: event.currentAttendees || 0,
        organizer: event.organizer || "Unknown",
        venue: event.venue?.name || event.location || "Unknown",
        location: {
          address: event.venue?.address || event.location || "Unknown",
          coordinates: event.venue?.coordinates || { lat: null, lng: null },
        },
        // Ensure campus data is available (backward compatibility)
        campusId: event.campusId || 1, // Default to SNSU for existing events
        campusCode: event.campusCode || 'SNSU',
        isMultiCampus: event.isMultiCampus || false,
        allowedCampuses: event.allowedCampuses || [event.campusId || 1]
      }));

      // Apply campus filtering based on user permissions
      if (currentCampus && userCampusPermissions) {
        if (userCampusPermissions.isSuperAdmin) {
          // Super admin can see all events (no filtering)
          devLog("[EventManagement] Super admin loading all campus events");
        } else if (userCampusPermissions.canAccessMultipleCampuses) {
          // Campus admin can see events from accessible campuses
          const accessibleCampusIds = userCampusPermissions.accessibleCampusIds || [currentCampus.id];
          eventsData = eventsData.filter(event => 
            accessibleCampusIds.includes(event.campusId)
          );
          devLog("[EventManagement] Campus admin loading events for campuses:", accessibleCampusIds);
        } else {
          // Regular users can only see events from their assigned campus
          eventsData = eventsData.filter(event => 
            event.campusId === currentCampus.id
          );
          devLog("[EventManagement] Regular user loading events for campus:", currentCampus.id);
        }
      }

      setEventsList(eventsData);
      devLog(`[EventManagement] Loaded ${eventsData.length} events for current user context`);
    } catch (error) {
      devError("[EventManagement] Error loading events:", error);
    }
  };

  /**
   * Handles location search using Mapbox service
   */
  const handleLocationSearch = async (query) => {
    if (!query.trim()) {
      setLocationSearchResults([]);
      return;
    }

    setIsSearchingLocation(true);
    try {
      // Get current location first as reference point
      const currentLocation = await mapboxService.getCurrentLocation();

      if (currentLocation.success) {
        // Search for places near current location
        const searchResult = await mapboxService.searchPlaces(
          query,
          currentLocation.data,
          5000 // 5km radius
        );

        if (searchResult.success) {
          setLocationSearchResults(searchResult.data);
        } else {
          setLocationSearchResults([]);
        }
      } else {
        // Fallback: create mock coordinates based on query
        setLocationSearchResults([
          {
            id: 1,
            name: query,
            address: `${query}, Surigao City, Philippines`,
            latitude: 9.7869 + (Math.random() - 0.5) * 0.01,
            longitude: 125.4919 + (Math.random() - 0.5) * 0.01,
            distance: Math.round(Math.random() * 1000),
            category: "venue",
          },
        ]);
      }
    } catch (error) {
      devError("[EventManagement] Error searching location:", error);
      setLocationSearchResults([]);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  /**
   * Handles location selection from the inline map
   */
  const handleMapLocationSelect = (location) => {
    if (!location) return;

    // Create address string if not provided
    const addressString =
      location.address ||
      `${location.latitude?.toFixed(6) || ""}, ${
        location.longitude?.toFixed(6) || ""
      }`;

    setFormData({
      ...formData,
      venue: location.name || "Selected Location",
      location: {
        address: addressString,
        coordinates: {
          lat: location.latitude,
          lng: location.longitude,
        },
      },
    });
    setLocationSearchQuery(addressString);

    devLog("[EventManagement] Location selected from map:", location);
  };

  /**
   * Handles manual coordinate input parsing
   */
  const parseCoordinateInput = (input) => {
    // Try to parse coordinate formats like "lat, lng" or "lat,lng"
    const coordinateRegex = /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/;
    const match = input.trim().match(coordinateRegex);

    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);

      // Validate coordinate ranges
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
    return null;
  };

  /**
   * Handles coordinate input change and validation
   */
  const handleCoordinateInputChange = (value) => {
    setLocationSearchQuery(value);

    // Try to parse as coordinates first
    const coordinates = parseCoordinateInput(value);
    if (coordinates) {
      // Valid coordinates - update form data and show on map
      setFormData({
        ...formData,
        location: {
          address: `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(
            6
          )}`,
          coordinates: {
            lat: coordinates.lat,
            lng: coordinates.lng,
          },
        },
      });
      // Clear search results since we have valid coordinates
      setLocationSearchResults([]);
      return;
    }

    // If not valid coordinates, treat as search query
    if (value.length > 2) {
      handleLocationSearch(value);
    } else {
      setLocationSearchResults([]);
    }
  };

  /**
   * Handles location selection from search results
   */
  const handleLocationSelect = (location) => {
    // Show the map when a location is selected
    setShowMap(true);
    setFormData({
      ...formData,
      location: {
        address: location.address,
        coordinates: {
          lat: location.latitude,
          lng: location.longitude,
        },
      },
    });
    setLocationSearchQuery(location.address);
    setLocationSearchResults([]);
  };

  /**
   * Handles cover image upload
   */
  const handleCoverImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        eventBackground: file.name,
        coverImagePreview: previewUrl,
      });
    }
  };

  /**
   * Removes the uploaded cover image
   */
  const removeCoverImage = () => {
    if (formData.coverImagePreview) {
      URL.revokeObjectURL(formData.coverImagePreview);
    }
    setFormData({
      ...formData,
      eventBackground: "",
      coverImagePreview: null,
    });
  };

  /**
   * Creates a new event with enhanced data structure and campus context
   * Story 1.5: Campus-Aware Event Creation
   */
  const handleCreateEvent = async () => {
    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.date ||
        !formData.time ||
        !formData.organizer ||
        !formData.venue
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Campus validation - ensure current campus context is available
      if (!currentCampus || !currentCampus.id) {
        alert("Campus context required. Please ensure you're properly logged in.");
        devError("[EventManagement] Campus context missing for event creation");
        return;
      }

      // Generate campus-aware QR code using the dedicated service
      const qrResult = campusQRService.generateCampusQRCode(
        { id: eventsList.length + 1, title: formData.title, isMultiCampus: false },
        { currentCampus }
      );

      devLog("[EventManagement] Generated campus-aware QR code:", qrResult);

      // Mock API call - replace with actual implementation
      const newEvent = {
        id: eventsList.length + 1,
        ...formData,
        maxAttendees: parseInt(formData.maxAttendees) || 0,
        currentAttendees: 0,
        createdAt: new Date().toISOString().split("T")[0],
        // Enhanced event data structure
        endTime: formData.endTime,
        allow_entry: formData.allowEntry,
        isPublic: true,
        // Campus-specific data - Story 1.5 enhancements
        campusId: currentCampus.id,
        campusCode: currentCampus.code,
        isMultiCampus: false, // Single campus by default
        allowedCampuses: [currentCampus.id], // Array for future multi-campus events
        // All events now require registration/login by default
        tags: [formData.category.toLowerCase()],
        // Campus-aware QR code from service
        qrCode: qrResult.qrCode,
        qrData: qrResult.qrData,
        qrDisplayText: qrResult.displayText,
        checkInSettings: {
          enabled: formData.checkInEnabled,
          requireLocation: true,
          radius: 50, // meters
          campusValidation: true, // Campus boundary validation
        },
        checkOutSettings: {
          enabled: formData.checkOutEnabled,
          requireLocation: true,
          radius: 50, // meters
          campusValidation: true, // Campus boundary validation
        },
      };

      setEventsList([...eventsList, newEvent]);
      setShowCreateModal(false);
      resetForm();
      devLog("[EventManagement] Event created successfully:", newEvent);
      alert("Event created successfully!");
    } catch (error) {
      devError("[EventManagement] Error creating event:", error);
      alert("Failed to create event");
    }
  };

  /**
   * Updates an existing event with enhanced data structure and campus validation
   * Story 1.5: Campus-Aware Event Management
   */
  const handleEditEvent = async () => {
    try {
      // Validate required fields
      if (
        !formData.title ||
        !formData.date ||
        !formData.time ||
        !formData.organizer ||
        !formData.venue
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Campus validation - ensure user can edit this event
      if (!selectedEvent.campusId || selectedEvent.campusId !== currentCampus.id) {
        // Allow super admin to edit cross-campus, otherwise restrict to same campus
        if (!userCampusPermissions.isSuperAdmin) {
          alert("You can only edit events from your assigned campus.");
          devError("[EventManagement] Campus validation failed for event edit:", {
            eventCampus: selectedEvent.campusId,
            userCampus: currentCampus.id,
            userPermissions: userCampusPermissions
          });
          return;
        }
      }

      // Mock API call - replace with actual implementation
      const updatedEvents = eventsList.map((e) =>
        e.id === selectedEvent.id
          ? {
              ...e,
              ...formData,
              maxAttendees: parseInt(formData.maxAttendees) || 0,
              endTime: formData.endTime,
              allow_entry: formData.allowEntry,
              updatedAt: new Date().toISOString(),
              // Preserve campus context - cannot be changed during edit
              campusId: selectedEvent.campusId,
              campusCode: selectedEvent.campusCode,
              isMultiCampus: selectedEvent.isMultiCampus,
              allowedCampuses: selectedEvent.allowedCampuses,
              qrData: selectedEvent.qrData, // Preserve original QR data
              checkInSettings: {
                enabled: formData.checkInEnabled,
                requireLocation: true,
                radius: 50,
                campusValidation: true, // Campus boundary validation
              },
              checkOutSettings: {
                enabled: formData.checkOutEnabled,
                requireLocation: true,
                radius: 50,
                campusValidation: true, // Campus boundary validation
              },
            }
          : e
      );
      setEventsList(updatedEvents);
      setShowEditModal(false);
      setSelectedEvent(null);
      resetForm();
      devLog("[EventManagement] Event updated successfully:", selectedEvent.id);
      alert("Event updated successfully!");
    } catch (error) {
      devError("[EventManagement] Error updating event:", error);
      alert("Failed to update event");
    }
  };

  /**
   * Deletes an event with campus validation
   * Story 1.5: Campus-Aware Event Management - Campus isolation for delete operations
   */
  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        // Find the event to validate campus context
        const eventToDelete = eventsList.find(e => e.id === eventId);
        
        if (!eventToDelete) {
          alert("Event not found");
          return;
        }

        // Campus validation - ensure user can delete this event
        if (eventToDelete.campusId && eventToDelete.campusId !== currentCampus.id) {
          // Allow super admin to delete cross-campus, otherwise restrict to same campus
          if (!userCampusPermissions.isSuperAdmin) {
            alert("You can only delete events from your assigned campus.");
            devError("[EventManagement] Campus validation failed for event delete:", {
              eventCampus: eventToDelete.campusId,
              userCampus: currentCampus.id,
              userPermissions: userCampusPermissions
            });
            return;
          }
        }

        // Mock API call - replace with actual implementation
        const updatedEvents = eventsList.filter((e) => e.id !== eventId);
        setEventsList(updatedEvents);
        devLog("[EventManagement] Event deleted successfully:", eventId);
        alert("Event deleted successfully!");
      } catch (error) {
        devError("[EventManagement] Error deleting event:", error);
        alert("Failed to delete event");
      }
    }
  };

  /**
   * Resets the form data to initial state
   */
  const resetForm = () => {
    // Clean up image preview URL if it exists
    if (formData.coverImagePreview) {
      URL.revokeObjectURL(formData.coverImagePreview);
    }

    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      endTime: "",
      venue: "",
      location: {
        address: "",
        coordinates: {
          lat: null,
          lng: null,
        },
      },
      category: EVENT_CATEGORIES[1].value, // Default to Academic
      maxAttendees: "",
      organizer: "",
      status: EVENT_STATUS[1].value, // Default to upcoming
      eventBackground: "",
      coverImagePreview: null,
      allowEntry: true,
      checkInEnabled: false,
      checkOutEnabled: false,
    });

    // Reset location search state
    setLocationSearchQuery("");
    setLocationSearchResults([]);
  };

  /**
   * Opens the edit modal with event data pre-filled
   */
  const openEditModal = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      endTime: event.endTime || "",
      venue: event.venue || "",
      location: event.location || {
        address: "",
        coordinates: { lat: null, lng: null },
      },
      category: event.category,
      maxAttendees: event.maxAttendees.toString(),
      organizer: event.organizer,
      status: event.status,
      eventBackground: event.eventBackground || "",
      coverImagePreview: null,
      allowEntry: event.allow_entry !== false,
      checkInEnabled: event.checkInSettings?.enabled || false,
      checkOutEnabled: event.checkOutSettings?.enabled || false,
    });
    setLocationSearchQuery(
      typeof event.location === "string"
        ? event.location
        : event.location?.address || ""
    );
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    const config = STATUS_CONFIG[status];
    return config
      ? `${config.bg} ${config.text}`
      : `${STATUS_CONFIG.upcoming.bg} ${STATUS_CONFIG.upcoming.text}`;
  };

  const getCategoryColor = (category) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS.Academic;
  };

  return (
    <div>
      {/* Header Section */}
      <div className="bg-theme shadow-theme-md rounded-lg mb-6">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-theme mb-2">
                Event Management
              </h1>
              <p className="text-theme opacity-70">
                Create, edit, and manage university events
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={16} className="mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </div>
      {/* Filters Section */}
      <div className="mb-6">
        {/* Reusable Filter Component */}
        <FilterComponent
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Search events by title, category, location, or organizer..."
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearAllFilters}
          showActiveFilters={true}
          showResultsCount={true}
          totalResults={eventsList.length}
          filteredResults={filteredEvents.length}
          variant="dropdown"
        />
      </div>
      {/* Events Table */}
      {filteredEvents.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-16 h-16 text-theme opacity-50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-theme mb-2">
            No Events Found
          </h3>
          <p className="text-theme opacity-70 mb-4">
            {searchTerm ||
            filters.status?.value !== "all" ||
            filters.category?.value !== ""
              ? "Try adjusting your search or filter criteria to find events."
              : "No events have been created yet."}
          </p>
          <Button onClick={clearAllFilters}>Clear Filters</Button>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <Calendar
                                size={20}
                                className="text-gray-600 dark:text-gray-400"
                              />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {event.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {event.organizer}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(event.date)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTime(event.time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                          <MapPin
                            size={16}
                            className="mr-1 text-gray-500 dark:text-gray-400"
                          />
                          <span
                            className="truncate max-w-[150px]"
                            title={event.venue}
                          >
                            {event.venue}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(
                            event.category
                          )}`}
                        >
                          {event.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                            <Users
                              size={16}
                              className="mr-1 text-gray-500 dark:text-gray-400"
                            />
                            <span>
                              {event.currentAttendees} / {event.maxAttendees}
                            </span>
                          </div>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-eas-light-primary dark:bg-eas-dark-primary h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(
                                  (event.currentAttendees / event.maxAttendees) *
                                    100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            event.status
                          )}`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(event)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </>
      )}
      {/* Enhanced Create/Edit Event Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {showCreateModal ? "Create New Event" : "Edit Event"}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {showCreateModal
                      ? "Create and configure a new event with location, settings, and attendance tracking"
                      : "Update event information, location, and configuration settings"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedEvent(null);
                  resetForm();
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Form Body with Scroll */}
            <div className="overflow-y-auto max-h-[calc(100vh-200px)] p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showCreateModal ? handleCreateEvent() : handleEditEvent();
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter event title"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter event description"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Max Attendees */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Attendees
                    </label>
                    <input
                      type="number"
                      value={formData.maxAttendees}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxAttendees: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter maximum attendees"
                      min="1"
                    />
                  </div>

                  {/* Venue Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) =>
                        setFormData({ ...formData, venue: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter venue name"
                      required
                    />
                  </div>

                  {/* Enhanced Location Input with Mapbox Integration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location Coordinates *{" "}
                    </label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={locationSearchQuery}
                          onChange={(e) =>
                            handleCoordinateInputChange(e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter coordinates (9.786900, 125.491900) or search location"
                          required
                        />
                      </div>

                      {/* Location Search Results */}
                      {locationSearchResults.length > 0 && (
                        <div className="border border-gray-200 dark:border-gray-600 rounded-md max-h-40 overflow-y-auto bg-white dark:bg-gray-700">
                          {locationSearchResults.map((location) => (
                            <button
                              key={location.id}
                              type="button"
                              onClick={() => handleLocationSelect(location)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                            >
                              <div className="flex items-center space-x-2">
                                <MapPin size={14} className="text-gray-500" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {location.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {location.address}
                                  </div>
                                  <div className="text-xs text-blue-600 dark:text-blue-400">
                                    Lat: {location.latitude.toFixed(6)}, Lng:{" "}
                                    {location.longitude.toFixed(6)}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Loading Indicator */}
                      {isSearchingLocation && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Loader size={14} className="animate-spin" />
                          <span>Searching locations...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline Map for Location Selection */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Location on Map
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMap(!showMap)}
                        className="flex items-center space-x-1"
                        title={showMap ? "Hide map" : "Show map"}
                      >
                        {showMap ? (
                          <>
                            <EyeOff size={14} />
                            <span className="ml-1">Hide Map</span>
                          </>
                        ) : (
                          <>
                            <Map size={14} />
                            <span className="ml-1">Show Map</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        showMap
                          ? "opacity-100 max-h-[400px]"
                          : "opacity-0 max-h-0 overflow-hidden"
                      }`}
                    >
                      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                        <MapPicker
                          ref={mapPickerRef}
                          onLocationSelect={handleMapLocationSelect}
                          onClose={() => {}} // No close needed for inline
                          initialLocation={
                            formData.location.coordinates.lat &&
                            formData.location.coordinates.lng
                              ? {
                                  lat: formData.location.coordinates.lat,
                                  lng: formData.location.coordinates.lng,
                                }
                              : null
                          }
                          isInline={true}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {EVENT_CATEGORIES.filter((cat) => cat.value !== "").map(
                        (category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Organizer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Organizer *
                    </label>
                    <input
                      type="text"
                      value={formData.organizer}
                      onChange={(e) =>
                        setFormData({ ...formData, organizer: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter organizer name"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {EVENT_STATUS.filter(
                        (status) => status.value !== "all"
                      ).map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cover Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Event Cover Image
                    </label>
                    <div className="space-y-3">
                      {/* Upload Button */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          id="coverImage"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("coverImage").click()
                          }
                          className="flex items-center space-x-2"
                        >
                          <Upload size={16} />
                          <span>Upload Cover Image</span>
                        </Button>
                        <span className="text-xs text-gray-500">
                          Max size: 5MB | Formats: JPG, PNG, GIF
                        </span>
                      </div>

                      {/* Image Preview */}
                      {formData.coverImagePreview && (
                        <div className="relative">
                          <img
                            src={formData.coverImagePreview}
                            alt="Cover preview"
                            className="w-full h-32 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={removeCoverImage}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}

                      {/* Existing Cover Image (for edit mode) */}
                      {!formData.coverImagePreview &&
                        formData.eventBackground && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Image size={16} />
                            <span>Current: {formData.eventBackground}</span>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Attendance Settings */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Attendance Settings
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Allow Entry */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="allowEntry"
                          checked={formData.allowEntry}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              allowEntry: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-eas-light-primary focus:ring-eas-light-primary border-gray-300 rounded"
                        />
                        <label
                          htmlFor="allowEntry"
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          Allow Entry
                        </label>
                      </div>

                      {/* Check-in Enabled */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="checkInEnabled"
                          checked={formData.checkInEnabled}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              checkInEnabled: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-eas-light-primary focus:ring-eas-light-primary border-gray-300 rounded"
                        />
                        <label
                          htmlFor="checkInEnabled"
                          className="text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-1"
                        >
                          <LogIn size={14} />
                          <span>Enable Check-in</span>
                        </label>
                      </div>

                      {/* Check-out Enabled */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="checkOutEnabled"
                          checked={formData.checkOutEnabled}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              checkOutEnabled: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-eas-light-primary focus:ring-eas-light-primary border-gray-300 rounded"
                        />
                        <label
                          htmlFor="checkOutEnabled"
                          className="text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-1"
                        >
                          <LogOut size={14} />
                          <span>Enable Check-out</span>
                        </label>
                      </div>
                    </div>

                    {/* Attendance Settings Info */}
                    {(formData.checkInEnabled || formData.checkOutEnabled) && (
                      <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                        <div className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>Location-based attendance:</strong> Attendees
                          will need to be within 50 meters of the event location
                          to check-in/check-out.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 md:col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setSelectedEvent(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {showCreateModal ? "Create Event" : "Update Event"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
