/**
 * Attendance Service - Mock API for attendance operations with campus-aware support
 * This service loads attendance data from JSON files and provides
 * CRUD operations for attendance management with multi-campus filtering
 */

import {
  API_DELAYS,
  DEFAULT_EVENT_VALUES,
  AUTH_ERROR_MESSAGES,
  API_ENDPOINTS,
  HTTP_METHODS,
  STATUS_CODES,
  CAMPUS_UTILS,
} from "../components/common/constants/index";
import {
  devError,
  logServiceCall,
  logAction,
  logDataOperation,
  logApiCall,
} from "../components/common/devLogger";
import campusQRService from "./campusQRService";

// Enhanced attendanceService with campus-aware functionality
export const attendanceService = {
  /**
   * Get all attendance records with optional campus filtering
   * @param {Object} filters - Filter options including campus filtering
   * @param {Object} campusContext - Campus context from auth
   */
  async getAttendance(filters = {}, campusContext = null) {
    const startTime = Date.now();
    
    // Log service call start
    logServiceCall("attendanceService", "getAttendance", { filters, campusContext }, "pending");
    
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.FETCH_EVENTS)
      );
      
      const mockAttendanceData = await import("../data/mockAttendance.json");
      let attendance = mockAttendanceData.default.attendance || mockAttendanceData.attendance;
      
      // Apply campus filtering if context provided
      if (campusContext && filters.campusId !== undefined) {
        if (filters.campusId === 'all' && campusContext.isSuperAdmin) {
          // Super admin requesting all campuses - no filtering
        } else if (filters.campusId === 'current' || !filters.campusId) {
          // Filter to user's current campus
          attendance = attendance.filter(record => record.campusId === campusContext.userCampusId);
        } else {
          // Filter to specific campus (with permission check)
          const requestedCampusId = parseInt(filters.campusId);
          if (CAMPUS_UTILS.validateCampusAccess(campusContext, requestedCampusId)) {
            attendance = attendance.filter(record => record.campusId === requestedCampusId);
          } else {
            throw new Error('Insufficient permissions to access requested campus attendance');
          }
        }
      }
      
      const duration = Date.now() - startTime;
      
      const result = {
        success: true,
        data: attendance,
        campus_context: campusContext ? {
          user_campus_id: campusContext.userCampusId,
          accessible_campuses: campusContext.accessibleCampusIds,
          cross_campus_access: campusContext.canAccessMultipleCampuses
        } : null
      };
      
      // Log successful operation
      logServiceCall("attendanceService", "getAttendance", { filters, campusContext }, "success", duration);
      
      return result;
    } catch (error) {
      devError("Error loading attendance data:", error);
      logServiceCall("attendanceService", "getAttendance", { filters, campusContext }, "error");
      
      return {
        success: false,
        message: error.message || "Failed to load attendance data",
        data: [],
      };
    }
  },

  /**
   * Get attendance by event ID with campus validation
   * @param {string} eventId - Event ID
   * @param {Object} campusContext - Campus context from auth
   */
  async getAttendanceByEvent(eventId, campusContext = null) {
    const startTime = Date.now();
    
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

  // Record attendance (QR code scan or manual check-in) with campus validation
  // Story 1.5: Campus-Aware Attendance Tracking
  async recordAttendance(attendanceData, campusContext = null) {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, API_DELAYS.CREATE_EVENT)
      );

      // Campus validation for attendance recording
      if (campusContext && attendanceData.eventId && attendanceData.userId) {
        // Validate that user can attend events in this campus
        if (attendanceData.eventCampusId && attendanceData.eventCampusId !== campusContext.userCampusId) {
          // Check if user has cross-campus access
          if (!campusContext.canAccessMultipleCampuses || 
              !campusContext.accessibleCampusIds.includes(attendanceData.eventCampusId)) {
            return {
              success: false,
              message: "Cross-campus attendance not permitted. You can only attend events in your assigned campus.",
            };
          }
        }

        // Enhanced QR code validation using campus QR service
        if (attendanceData.qrCode) {
          const qrValidation = campusQRService.validateCampusQRCode(
            attendanceData.qrCode,
            campusContext,
            { id: attendanceData.eventId, campusId: attendanceData.eventCampusId }
          );

          if (!qrValidation.isValid) {
            devError("[AttendanceService] QR code validation failed:", qrValidation);
            return {
              success: false,
              message: qrValidation.error || "QR code validation failed",
              errorCode: qrValidation.errorCode,
              qrValidation: qrValidation
            };
          }

          // Log successful QR validation
          devLog("[AttendanceService] QR code validation successful:", {
            qrCode: attendanceData.qrCode,
            validation: qrValidation,
            isLegacy: qrValidation.isLegacy || false,
            crossCampusAccess: qrValidation.crossCampusAccess || false
          });
        }

        // Legacy QR data validation (for backward compatibility)
        if (attendanceData.qrData && attendanceData.qrData.campusId) {
          if (attendanceData.qrData.campusId !== campusContext.userCampusId && 
              !campusContext.canAccessMultipleCampuses) {
            return {
              success: false,
              message: "QR code is for a different campus. Please use QR codes from your assigned campus.",
            };
          }
        }
      }

      const newAttendance = {
        id: Date.now(),
        checkInTime: new Date().toISOString(),
        checkInMethod: attendanceData.method || "qr_code",
        isVerified: true,
        status: "present",
        createdAt: new Date().toISOString(),
        // Campus-aware data - Story 1.5 enhancements
        campusId: attendanceData.eventCampusId || campusContext?.userCampusId || 1,
        crossCampusAttendance: attendanceData.eventCampusId !== campusContext?.userCampusId,
        attendanceCampusValidated: true,
        qrValidationData: attendanceData.qrCode ? {
          qrCode: attendanceData.qrCode,
          validatedAt: new Date().toISOString(),
          validationMethod: "campus_qr_service"
        } : null,
        ...attendanceData,
      };

      devLog("[AttendanceService] Campus-aware attendance recorded:", {
        attendanceId: newAttendance.id,
        userId: attendanceData.userId,
        eventId: attendanceData.eventId,
        userCampus: campusContext?.userCampusId,
        eventCampus: attendanceData.eventCampusId,
        crossCampusAttendance: newAttendance.crossCampusAttendance,
        qrValidated: !!attendanceData.qrCode
      });

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
