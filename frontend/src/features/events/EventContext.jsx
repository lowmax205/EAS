/**
 * EventContext - Event management context provider with comprehensive state management
 * Features: Event CRUD operations, Category management, Active event tracking, Loading states, Error handling
 * Dependencies: React context, useReducer, devLogger
 * Theme Support: Category colors with theme integration
 * Mock Data: Integrated with mockEvents.json for development
 * Global State: Events list, categories, active event, loading/error states
 * Accessibility: Provides event data for all event-related components
 *
 * Note: In development mode with React StrictMode, useEffect runs twice
 * to help detect side effects. This is prevented using a ref flag.
 */
import React, { createContext, useContext, useReducer } from "react";
import {
  EVENT_CATEGORIES,
  API_DELAYS,
  DEFAULT_EVENT_VALUES,
  CATEGORY_COLORS,
} from "../../components/common/constants/index";
import {
  devError,
  devLog,
  logUserInteraction,
  logStateChange,
} from "../../components/common/devLogger.js";

/**
 * Event actions enum
 * Features: Complete event management actions for state transitions
 */
const EVENT_ACTIONS = {
  FETCH_EVENTS_START: "FETCH_EVENTS_START",
  FETCH_EVENTS_SUCCESS: "FETCH_EVENTS_SUCCESS",
  FETCH_EVENTS_FAILURE: "FETCH_EVENTS_FAILURE",
  CREATE_EVENT: "CREATE_EVENT",
  UPDATE_EVENT: "UPDATE_EVENT",
  DELETE_EVENT: "DELETE_EVENT",
  SET_ACTIVE_EVENT: "SET_ACTIVE_EVENT",
  FETCH_CATEGORIES: "FETCH_CATEGORIES",
};

/**
 * Initial event state
 * Features: Complete event state structure with loading and error handling
 */
const initialState = {
  events: [],
  categories: [],
  activeEvent: null,
  isLoading: false,
  error: null,
};

/**
 * eventReducer - Event state reducer with comprehensive action handling
 * Features: Handles all event state transitions with logging support
 * @param {Object} state - Current event state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} - New event state
 */
const eventReducer = (state, action) => {
  switch (action.type) {
    case EVENT_ACTIONS.FETCH_EVENTS_START:
      logStateChange("EventContext", "isLoading", state.isLoading, true);
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case EVENT_ACTIONS.FETCH_EVENTS_SUCCESS:
      logStateChange(
        "EventContext",
        "events",
        state.events.length,
        action.payload.length
      );
      logUserInteraction("EventContext", "events_fetch_success", {
        eventCount: action.payload.length,
      });
      return {
        ...state,
        events: action.payload,
        isLoading: false,
        error: null,
      };
    case EVENT_ACTIONS.FETCH_EVENTS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case EVENT_ACTIONS.CREATE_EVENT:
      return {
        ...state,
        events: [...state.events, action.payload],
      };
    case EVENT_ACTIONS.UPDATE_EVENT:
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        ),
      };
    case EVENT_ACTIONS.DELETE_EVENT:
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      };
    case EVENT_ACTIONS.SET_ACTIVE_EVENT:
      return {
        ...state,
        activeEvent: action.payload,
      };
    case EVENT_ACTIONS.FETCH_CATEGORIES:
      return {
        ...state,
        categories: action.payload,
      };
    default:
      return state;
  }
};

// Event Context
const EventContext = createContext(null);

// Event Provider Component
export const EventProvider = ({ children }) => {
  const [state, dispatch] = useReducer(eventReducer, initialState);

  // Note: Data is not automatically fetched on mount to prevent unnecessary API calls
  // Components should call fetchEvents() and fetchCategories() when needed

  // Fetch events function
  const fetchEvents = async () => {
    dispatch({ type: EVENT_ACTIONS.FETCH_EVENTS_START });

    try {
      // Mock API call - replace with actual API call later
      const mockEvents = await mockApiGetEvents();
      dispatch({
        type: EVENT_ACTIONS.FETCH_EVENTS_SUCCESS,
        payload: mockEvents,
      });
    } catch (error) {
      dispatch({
        type: EVENT_ACTIONS.FETCH_EVENTS_FAILURE,
        payload: error.message,
      });
    }
  };

  // Create event function
  const createEvent = async (eventData) => {
    try {
      const newEvent = await mockApiCreateEvent(eventData);
      dispatch({
        type: EVENT_ACTIONS.CREATE_EVENT,
        payload: newEvent,
      });
      return { success: true, event: newEvent };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update event function
  const updateEvent = async (eventId, eventData) => {
    try {
      const updatedEvent = await mockApiUpdateEvent(eventId, eventData);
      dispatch({
        type: EVENT_ACTIONS.UPDATE_EVENT,
        payload: updatedEvent,
      });
      return { success: true, event: updatedEvent };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Delete event function
  const deleteEvent = async (eventId) => {
    try {
      await mockApiDeleteEvent(eventId);
      dispatch({
        type: EVENT_ACTIONS.DELETE_EVENT,
        payload: eventId,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Set active event
  const setActiveEvent = (event) => {
    dispatch({
      type: EVENT_ACTIONS.SET_ACTIVE_EVENT,
      payload: event,
    });
  };

  // Fetch categories
  const fetchCategories = async () => {
    devLog("[EventContext] Fetching event categories");
    try {
      const categories = await mockApiGetCategories();
      devLog(
        "[EventContext] Categories fetched successfully:",
        categories.length
      );
      dispatch({
        type: EVENT_ACTIONS.FETCH_CATEGORIES,
        payload: categories,
      });
    } catch (error) {
      devError("[EventContext] Failed to fetch categories:", error);
      // Failed to fetch categories - use empty array
      dispatch({
        type: EVENT_ACTIONS.FETCH_CATEGORIES,
        payload: [],
      });
    }
  };

  // Context value
  const value = {
    ...state,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    setActiveEvent,
    fetchCategories,
  };

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
};

// Custom hook to use event context
export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
};

// Mock API functions (replace with real API later)
const mockApiGetEvents = async () => {
  devLog("[EventContext] Fetching events from mock data");
  await new Promise((resolve) => setTimeout(resolve, API_DELAYS.FETCH_EVENTS));

  try {
    // Import mock events from JSON file
    const mockEventsData = await import("../../data/mockEvents.json");
    const events = mockEventsData.default.events || mockEventsData.events;
    devLog("[EventContext] Events loaded successfully:", events.length);
    return events;
  } catch (error) {
    devError("[EventContext] Error loading mock events:", error);
    return [];
  }
};

const mockApiGetCategories = async () => {
  devLog("[EventContext] Fetching categories from constants");
  await new Promise((resolve) =>
    setTimeout(resolve, API_DELAYS.FETCH_CATEGORIES)
  );

  // Use centralized event categories with proper color mapping
  const categories = EVENT_CATEGORIES.filter(
    (category) => category.value !== ""
  ).map((category) => ({
    id: category.value,
    name: category.value,
    color:
      CATEGORY_COLORS[category.value] || "text-gray-600 dark:text-gray-400",
  }));

  devLog("[EventContext] Categories mapped successfully:", categories.length);
  return categories;
};

const mockApiCreateEvent = async (eventData) => {
  devLog("[EventContext] Creating new event:", eventData.title);
  await new Promise((resolve) => setTimeout(resolve, API_DELAYS.CREATE_EVENT));

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

  devLog("[EventContext] Event created successfully:", newEvent.id);
  return newEvent;
};

const mockApiUpdateEvent = async (eventId, eventData) => {
  await new Promise((resolve) => setTimeout(resolve, API_DELAYS.UPDATE_EVENT));

  return {
    id: eventId,
    ...eventData,
    updatedAt: new Date().toISOString(),
  };
};

const mockApiDeleteEvent = async (_eventId) => {
  await new Promise((resolve) => setTimeout(resolve, API_DELAYS.DELETE_EVENT));
  return { success: true };
};

export default EventContext;
