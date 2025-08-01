// Real API Service - Attendance Management
// frontend/src/services/attendanceApiService.js

import axiosInstance from './axiosConfig';
import { devLog, devError } from '../components/common/devLogger';

class AttendanceApiService {
  constructor() {
    this.baseURL = '/api/v1';
  }

  /**
   * Record attendance via QR code scan
   */
  async recordAttendance(attendanceData) {
    try {
      devLog('[AttendanceAPI] Recording attendance:', attendanceData);
      const response = await axiosInstance.post(`${this.baseURL}/attendance/`, attendanceData);
      
      if (response.data) {
        devLog('[AttendanceAPI] Attendance recorded successfully:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Failed to record attendance');
    } catch (error) {
      devError('[AttendanceAPI] Error recording attendance:', error);
      return {
        success: false,
        error: error.message || 'Failed to record attendance'
      };
    }
  }

  /**
   * Verify QR code for attendance
   */
  async verifyQRCode(qrData) {
    try {
      devLog('[AttendanceAPI] Verifying QR code:', qrData);
      const response = await axiosInstance.post(`${this.baseURL}/attendance/verify-qr/`, qrData);
      
      if (response.data) {
        devLog('[AttendanceAPI] QR code verified:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Invalid QR code');
    } catch (error) {
      devError('[AttendanceAPI] Error verifying QR code:', error);
      return {
        success: false,
        error: error.message || 'Invalid QR code'
      };
    }
  }

  /**
   * Get attendance records for an event
   */
  async getEventAttendance(eventId, filters = {}) {
    try {
      devLog('[AttendanceAPI] Fetching attendance for event:', eventId, filters);
      
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      
      const response = await axiosInstance.get(`${this.baseURL}/events/${eventId}/attendance/?${params.toString()}`);
      
      if (response.data) {
        devLog('[AttendanceAPI] Event attendance loaded:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Attendance data not found');
    } catch (error) {
      devError('[AttendanceAPI] Error fetching event attendance:', error);
      return {
        success: false,
        error: error.message || 'Failed to load attendance data'
      };
    }
  }

  /**
   * Get user's attendance history
   */
  async getUserAttendance(userId, filters = {}) {
    try {
      devLog('[AttendanceAPI] Fetching user attendance:', userId, filters);
      
      const params = new URLSearchParams();
      if (filters.eventType) params.append('event_type', filters.eventType);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      
      const response = await axiosInstance.get(`${this.baseURL}/users/${userId}/attendance/?${params.toString()}`);
      
      if (response.data) {
        devLog('[AttendanceAPI] User attendance loaded:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('User attendance data not found');
    } catch (error) {
      devError('[AttendanceAPI] Error fetching user attendance:', error);
      return {
        success: false,
        error: error.message || 'Failed to load user attendance'
      };
    }
  }

  /**
   * Get attendance statistics
   */
  async getAttendanceStatistics(filters = {}) {
    try {
      devLog('[AttendanceAPI] Fetching attendance statistics:', filters);
      
      const params = new URLSearchParams();
      if (filters.eventId) params.append('event_id', filters.eventId);
      if (filters.campusId) params.append('campus_id', filters.campusId);
      if (filters.period) params.append('period', filters.period);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      
      const response = await axiosInstance.get(`${this.baseURL}/attendance/statistics/?${params.toString()}`);
      
      if (response.data) {
        devLog('[AttendanceAPI] Attendance statistics loaded:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Statistics data not found');
    } catch (error) {
      devError('[AttendanceAPI] Error fetching attendance statistics:', error);
      return {
        success: false,
        error: error.message || 'Failed to load attendance statistics'
      };
    }
  }

  /**
   * Update attendance record
   */
  async updateAttendance(attendanceId, updateData) {
    try {
      devLog('[AttendanceAPI] Updating attendance:', attendanceId, updateData);
      const response = await axiosInstance.put(`${this.baseURL}/attendance/${attendanceId}/`, updateData);
      
      if (response.data) {
        devLog('[AttendanceAPI] Attendance updated successfully:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Failed to update attendance');
    } catch (error) {
      devError('[AttendanceAPI] Error updating attendance:', error);
      return {
        success: false,
        error: error.message || 'Failed to update attendance'
      };
    }
  }

  /**
   * Delete attendance record
   */
  async deleteAttendance(attendanceId) {
    try {
      devLog('[AttendanceAPI] Deleting attendance:', attendanceId);
      await axiosInstance.delete(`${this.baseURL}/attendance/${attendanceId}/`);
      
      devLog('[AttendanceAPI] Attendance deleted successfully');
      return {
        success: true,
        message: 'Attendance record deleted successfully'
      };
    } catch (error) {
      devError('[AttendanceAPI] Error deleting attendance:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete attendance record'
      };
    }
  }

  /**
   * Export attendance data
   */
  async exportAttendance(filters = {}, format = 'csv') {
    try {
      devLog('[AttendanceAPI] Exporting attendance data:', filters, format);
      
      const params = new URLSearchParams();
      if (filters.eventId) params.append('event_id', filters.eventId);
      if (filters.campusId) params.append('campus_id', filters.campusId);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      params.append('format', format);
      
      const response = await axiosInstance.get(`${this.baseURL}/attendance/export/?${params.toString()}`, {
        responseType: 'blob'
      });
      
      if (response.data) {
        devLog('[AttendanceAPI] Attendance data exported successfully');
        return {
          success: true,
          data: response.data,
          filename: response.headers['content-disposition']?.split('filename=')[1] || `attendance_export.${format}`
        };
      }
      
      throw new Error('Failed to export attendance data');
    } catch (error) {
      devError('[AttendanceAPI] Error exporting attendance:', error);
      return {
        success: false,
        error: error.message || 'Failed to export attendance data'
      };
    }
  }
}

// Create and export singleton instance
const attendanceApiService = new AttendanceApiService();
export default attendanceApiService;
