/**
 * Events Service - Mock API for event operations
 * This service loads event data from JSON files and provides
 * CRUD operations for event management
 */

import {
  API_DELAYS,
  DEFAULT_EVENT_VALUES,
  EVENT_CATEGORIES,
  API_ENDPOINTS,
  HTTP_METHODS,
  STATUS_CODES,
} from "../../../components/common/constants/index";
import {
  devError,
  devLog,
  logServiceCall,
  logAction,
  logDataOperation,
  logApiCall,
} from "../../../components/common/devLogger";

// Mock API functions for events (replace with real API later)
export const eventsService = {
  // Get all events
  async getEvents() {
    const startTime = Date.now();

    // Log service call start
    logServiceCall("eventsService", "getEvents", null, "pending");
    logAction("DATA", "FETCH_EVENTS", "eventsService", null, "pending");

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.FETCH_EVENTS)
      );
      const mockEventsData = await import("../../../data/mockEvents.json");
      const events = mockEventsData.default.events || mockEventsData.events;
      const duration = Date.now() - startTime;

      const result = {
        success: true,
        data: events,
      };

      // Log successful operations
      logServiceCall("eventsService", "getEvents", null, "success", duration);
      logAction(
        "DATA",
        "FETCH_EVENTS_SUCCESS",
        "eventsService",
        { count: events.length },
        "success"
      );
      logDataOperation(
        "events",
        "read",
        null,
        { count: events.length },
        "success"
      );
      logApiCall(
        "GET",
        API_ENDPOINTS.EVENTS.LIST,
        null,
        result,
        duration,
        "success"
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result = {
        success: false,
        message: "Failed to load events data",
        data: [],
      };

      // Log error operations
      logServiceCall("eventsService", "getEvents", null, "error", duration);
      logAction(
        "DATA",
        "FETCH_EVENTS_ERROR",
        "eventsService",
        { error: error.message },
        "error"
      );
      logDataOperation("events", "read", null, null, "error");
      logApiCall(
        "GET",
        API_ENDPOINTS.EVENTS.LIST,
        null,
        result,
        duration,
        "error"
      );

      devError("Error loading events data:", error);
      return result;
    }
  },

  // Get event by ID
  async getEventById(eventId) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const mockEventsData = await import("../../../data/mockEvents.json");
      const events = mockEventsData.default.events || mockEventsData.events;
      const event = events.find((e) => e.id === parseInt(eventId));

      if (event) {
        return {
          success: true,
          data: event,
        };
      } else {
        return {
          success: false,
          message: "Event not found",
        };
      }
    } catch (error) {
      devError("Error loading event:", error);
      return {
        success: false,
        message: "Failed to load event",
      };
    }
  },

  // Get events by category
  async getEventsByCategory(category) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const mockEventsData = await import("../../../data/mockEvents.json");
      const events = mockEventsData.default.events || mockEventsData.events;
      const filteredEvents = events.filter(
        (event) => event.category.toLowerCase() === category.toLowerCase()
      );

      return {
        success: true,
        data: filteredEvents,
      };
    } catch (error) {
      devError("Error loading events by category:", error);
      return {
        success: false,
        message: "Failed to load events by category",
        data: [],
      };
    }
  },

  // Get upcoming events (within 30 days)
  async getUpcomingEvents() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockEventsData = await import("../../../data/mockEvents.json");
      const events = mockEventsData.default.events || mockEventsData.events;
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const todayString = today.toISOString().split("T")[0];
      const thirtyDaysString = thirtyDaysFromNow.toISOString().split("T")[0];

      const upcomingEvents = events
        .filter((event) => {
          const eventDate = event.date;
          return (
            eventDate >= todayString &&
            eventDate <= thirtyDaysString &&
            event.status === "upcoming"
          );
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // Debug logging to verify events are loaded correctly
      devLog(`[EventsService] Today: ${todayString}`);
      devLog(`[EventsService] 30 days from now: ${thirtyDaysString}`);
      devLog(`[EventsService] Total events in mock data: ${events.length}`);
      devLog(
        `[EventsService] Upcoming events within 30 days: ${upcomingEvents.length}`
      );
      devLog(
        "[EventsService] Upcoming events:",
        upcomingEvents.map((e) => `${e.title} (${e.date})`)
      );

      return {
        success: true,
        data: upcomingEvents,
      };
    } catch (error) {
      devError("Error loading upcoming events:", error);
      return {
        success: false,
        message: "Failed to load upcoming events",
        data: [],
      };
    }
  },

  // Create new event
  async createEvent(eventData) {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.CREATE_EVENT)
      );

      const newEvent = {
        id: Date.now(),
        ...eventData,
        currentAttendees: DEFAULT_EVENT_VALUES.CURRENT_ATTENDEES,
        status: DEFAULT_EVENT_VALUES.STATUS,
        qrCode: `QR_${eventData.title
          .replace(/\s+/g, "_")
          .toUpperCase()}_${Date.now()}`,
        isPublic: eventData.isPublic ?? DEFAULT_EVENT_VALUES.IS_PUBLIC,
        requiresRegistration:
          eventData.requiresRegistration ??
          DEFAULT_EVENT_VALUES.REQUIRES_REGISTRATION,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        message: "Event created successfully",
        data: newEvent,
      };
    } catch (error) {
      devError("Error creating event:", error);
      return {
        success: false,
        message: "Failed to create event",
      };
    }
  },

  // Update event
  async updateEvent(eventId, eventData) {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.UPDATE_EVENT)
      );

      const updatedEvent = {
        id: eventId,
        ...eventData,
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        message: "Event updated successfully",
        data: updatedEvent,
      };
    } catch (error) {
      devError("Error updating event:", error);
      return {
        success: false,
        message: "Failed to update event",
      };
    }
  },

  // Delete event
  async deleteEvent(_eventId) {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.DELETE_EVENT)
      );

      return {
        success: true,
        message: "Event deleted successfully",
      };
    } catch (error) {
      devError("Error deleting event:", error);
      return {
        success: false,
        message: "Failed to delete event",
      };
    }
  },

  // Get event categories
  async getCategories() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Static categories matching project theme colors
      return {
        success: true,
        data: [
          { id: 1, name: "Academic", color: "#22C55E" },
          { id: 2, name: "Sports", color: "#166534" },
          { id: 3, name: "Cultural", color: "#DCFCE7" },
          { id: 4, name: "Meeting", color: "#9CA3AF" },
          { id: 5, name: "Workshop", color: "#22C55E" },
          { id: 6, name: "Seminar", color: "#166534" },
          { id: 7, name: "Competition", color: "#22C55E" },
          { id: 8, name: "Conference", color: "#9CA3AF" },
        ],
      };
    } catch (error) {
      devError("Error loading categories:", error);
      return {
        success: false,
        message: "Failed to load categories",
        data: [],
      };
    }
  },

  // Search events
  async searchEvents(query) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const mockEventsData = await import("../../../data/mockEvents.json");
      const events = mockEventsData.default.events || mockEventsData.events;

      const searchResults = events.filter(
        (event) =>
          event.title.toLowerCase().includes(query.toLowerCase()) ||
          event.description.toLowerCase().includes(query.toLowerCase()) ||
          event.category.toLowerCase().includes(query.toLowerCase()) ||
          event.organizer.toLowerCase().includes(query.toLowerCase())
      );

      return {
        success: true,
        data: searchResults,
      };
    } catch (error) {
      devError("Error searching events:", error);
      return {
        success: false,
        message: "Failed to search events",
        data: [],
      };
    }
  },
};

export default eventsService;
