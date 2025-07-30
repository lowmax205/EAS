/**
 * useApi Hook - API calls wrapper
 * This hook provides a convenient interface for making API calls
 * with loading states, error handling, and response management
 */

import { useState, useCallback, useMemo } from "react";
import { authService } from "../features/auth/services/authService";
import { eventsService } from "../features/events/services/eventsService";
import { attendanceService } from "../services/attendanceService";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic API call wrapper
  const apiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setLoading(false);

      if (!result.success) {
        setError(result.message || "API call failed");
      }

      return result;
    } catch (err) {
      setLoading(false);
      const errorMessage = err.message || "An unexpected error occurred";
      setError(errorMessage);

      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }
  }, []);

  // Authentication API calls - memoized for stable references
  const auth = useMemo(
    () => ({
      login: (credentials) => apiCall(authService.login, credentials),
      logout: () => apiCall(authService.logout),
      register: (userData) => apiCall(authService.register, userData),
      getProfile: (userId) => apiCall(authService.getProfile, userId),
      updateProfile: (userId, profileData) =>
        apiCall(authService.updateProfile, userId, profileData),
      changePassword: (userId, passwordData) =>
        apiCall(authService.changePassword, userId, passwordData),
      verifyToken: (token) => apiCall(authService.verifyToken, token),
      getAllUsers: () => apiCall(authService.getAllUsers),
    }),
    [apiCall]
  );

  // Events API calls - memoized for stable references
  const events = useMemo(
    () => ({
      getEvents: () => apiCall(eventsService.getEvents),
      getEventById: (eventId) => apiCall(eventsService.getEventById, eventId),
      getEventsByCategory: (category) =>
        apiCall(eventsService.getEventsByCategory, category),
      getUpcomingEvents: () => apiCall(eventsService.getUpcomingEvents),
      createEvent: (eventData) => apiCall(eventsService.createEvent, eventData),
      updateEvent: (eventId, eventData) =>
        apiCall(eventsService.updateEvent, eventId, eventData),
      deleteEvent: (eventId) => apiCall(eventsService.deleteEvent, eventId),
      getCategories: () => apiCall(eventsService.getCategories),
      searchEvents: (query) => apiCall(eventsService.searchEvents, query),
    }),
    [apiCall]
  );

  // Attendance API calls - memoized for stable references
  const attendance = useMemo(
    () => ({
      getAttendance: () => apiCall(attendanceService.getAttendance),
      getAttendanceByEvent: (eventId) =>
        apiCall(attendanceService.getAttendanceByEvent, eventId),
      getAttendanceByUser: (userId) =>
        apiCall(attendanceService.getAttendanceByUser, userId),
      recordAttendance: (attendanceData) =>
        apiCall(attendanceService.recordAttendance, attendanceData),
      updateAttendance: (attendanceId, updateData) =>
        apiCall(attendanceService.updateAttendance, attendanceId, updateData),
      deleteAttendance: (attendanceId) =>
        apiCall(attendanceService.deleteAttendance, attendanceId),
      getAttendanceStats: (eventId, userId) =>
        apiCall(attendanceService.getAttendanceStats, eventId, userId),
    }),
    [apiCall]
  );

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(
    () => ({
      loading,
      error,
      clearError,
      auth,
      events,
      attendance,
      apiCall, // For custom API calls
    }),
    [loading, error, clearError, auth, events, attendance, apiCall]
  );
};

export default useApi;
