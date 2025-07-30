/**
 * Attendance Service - Mock API for attendance operations
 * This service loads attendance data from JSON files and provides
 * CRUD operations for attendance management
 */

import {
  API_DELAYS,
  DEFAULT_EVENT_VALUES,
  AUTH_ERROR_MESSAGES,
  API_ENDPOINTS,
  HTTP_METHODS,
  STATUS_CODES,
} from "../components/common/constants/index";
import {
  devError,
  logServiceCall,
  logAction,
  logDataOperation,
  logApiCall,
} from "../components/common/devLogger";

// Mock API functions for attendance (replace with real API later)
export const attendanceService = {
  // Get all attendance records
  async getAttendance() {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.FETCH_EVENTS)
      );
      const mockAttendanceData = await import("../data/mockAttendance.json");
      return {
        success: true,
        data:
          mockAttendanceData.default.attendance ||
          mockAttendanceData.attendance,
      };
    } catch (error) {
      devError("Error loading attendance data:", error);
      return {
        success: false,
        message: "Failed to load attendance data",
        data: [],
      };
    }
  },

  // Get attendance by event ID
  async getAttendanceByEvent(eventId) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const mockAttendanceData = await import("../data/mockAttendance.json");
      const attendance =
        mockAttendanceData.default.attendance || mockAttendanceData.attendance;
      const eventAttendance = attendance.filter(
        (record) => record.eventId === parseInt(eventId)
      );

      return {
        success: true,
        data: eventAttendance,
      };
    } catch (error) {
      devError("Error loading event attendance:", error);
      return {
        success: false,
        message: "Failed to load event attendance",
        data: [],
      };
    }
  },

  // Get attendance by user ID
  async getAttendanceByUser(userId) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const mockAttendanceData = await import("../data/mockAttendance.json");
      const attendance =
        mockAttendanceData.default.attendance || mockAttendanceData.attendance;
      const userAttendance = attendance.filter(
        (record) => record.userId === parseInt(userId)
      );

      return {
        success: true,
        data: userAttendance,
      };
    } catch (error) {
      devError("Error loading user attendance:", error);
      return {
        success: false,
        message: "Failed to load user attendance",
        data: [],
      };
    }
  },

  // Record attendance (QR code scan or manual check-in)
  async recordAttendance(attendanceData) {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.CREATE_EVENT)
      );

      const newAttendance = {
        id: Date.now(),
        checkInTime: new Date().toISOString(),
        checkInMethod: attendanceData.method || "qr_code",
        isVerified: true,
        status: "present",
        createdAt: new Date().toISOString(),
        ...attendanceData,
      };

      return {
        success: true,
        message: "Attendance recorded successfully",
        data: newAttendance,
      };
    } catch (error) {
      devError("Error recording attendance:", error);
      return {
        success: false,
        message: "Failed to record attendance",
      };
    }
  },

  // Update attendance record
  async updateAttendance(attendanceId, updateData) {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.UPDATE_EVENT)
      );

      return {
        success: true,
        message: "Attendance updated successfully",
        data: {
          id: attendanceId,
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      devError("Error updating attendance:", error);
      return {
        success: false,
        message: "Failed to update attendance",
      };
    }
  },

  // Delete attendance record
  async deleteAttendance(_attendanceId) {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.DELETE_EVENT)
      );

      return {
        success: true,
        message: "Attendance record deleted successfully",
      };
    } catch (error) {
      devError("Error deleting attendance:", error);
      return {
        success: false,
        message: "Failed to delete attendance record",
      };
    }
  },

  // Get attendance statistics
  async getAttendanceStats(eventId = null, userId = null) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockAttendanceData = await import("../data/mockAttendance.json");
      let attendance =
        mockAttendanceData.default.attendance || mockAttendanceData.attendance;

      // Filter by event or user if specified
      if (eventId) {
        attendance = attendance.filter(
          (record) => record.eventId === parseInt(eventId)
        );
      }
      if (userId) {
        attendance = attendance.filter(
          (record) => record.userId === parseInt(userId)
        );
      }

      // Count QR and manual methods - handle both method and checkInMethod fields
      let qrCount = 0;
      let manualCount = 0;

      attendance.forEach(record => {
        // Check for both method and checkInMethod fields with different possible values
        if (
          record.method === "qr" ||
          record.method === "qr_code" ||
          record.checkInMethod === "qr" ||
          record.checkInMethod === "qr_code"
        ) {
          qrCount++;
        } else if (
          record.method === "manual" ||
          record.checkInMethod === "manual"
        ) {
          manualCount++;
        }
      });

      const stats = {
        totalAttendance: attendance.length,
        presentCount: attendance.filter((record) => record.status === "present")
          .length,
        verifiedCount: attendance.filter((record) => record.isVerified).length,
        byMethod: {
          qr: qrCount,
          manual: manualCount
        },
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      devError("Error loading attendance stats:", error);
      return {
        success: false,
        message: "Failed to load attendance statistics",
        data: {},
      };
    }
  },
};

export default attendanceService;
