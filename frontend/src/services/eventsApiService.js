// Real API Service - Events Management
// frontend/src/services/eventsApiService.js

import axiosInstance from './axiosConfig';
import { devLog, devError } from '../components/common/devLogger';

class EventsApiService {
  constructor() {
    this.baseURL = '/api/v1';
  }

  /**
   * Get events list with campus filtering
   */
  async getEvents(filters = {}) {
    try {
      devLog('[EventsAPI] Fetching events with filters:', filters);
      
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.eventType) params.append('event_type', filters.eventType);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      
      const response = await axiosInstance.get(`${this.baseURL}/events/?${params.toString()}`);
      
      if (response.data && Array.isArray(response.data)) {
        devLog('[EventsAPI] Events loaded:', response.data.length);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Invalid events data format');
    } catch (error) {
      devError('[EventsAPI] Error fetching events:', error);
      return {
        success: false,
        error: error.message || 'Failed to load events'
      };
    }
  }

  /**
   * Get event details by ID
   */
  async getEventDetails(eventId) {
    try {
      devLog('[EventsAPI] Fetching event details for ID:', eventId);
      const response = await axiosInstance.get(`${this.baseURL}/events/${eventId}/`);
      
      if (response.data) {
        devLog('[EventsAPI] Event details loaded:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Event not found');
    } catch (error) {
      devError('[EventsAPI] Error fetching event details:', error);
      return {
        success: false,
        error: error.message || 'Failed to load event details'
      };
    }
  }

  /**
   * Create new event
   */
  async createEvent(eventData) {
    try {
      devLog('[EventsAPI] Creating event:', eventData);
      const response = await axiosInstance.post(`${this.baseURL}/events/`, eventData);
      
      if (response.data) {
        devLog('[EventsAPI] Event created successfully:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Failed to create event');
    } catch (error) {
      devError('[EventsAPI] Error creating event:', error);
      return {
        success: false,
        error: error.message || 'Failed to create event'
      };
    }
  }

  /**
   * Update event
   */
  async updateEvent(eventId, eventData) {
    try {
      devLog('[EventsAPI] Updating event:', eventId, eventData);
      const response = await axiosInstance.put(`${this.baseURL}/events/${eventId}/`, eventData);
      
      if (response.data) {
        devLog('[EventsAPI] Event updated successfully:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Failed to update event');
    } catch (error) {
      devError('[EventsAPI] Error updating event:', error);
      return {
        success: false,
        error: error.message || 'Failed to update event'
      };
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId) {
    try {
      devLog('[EventsAPI] Deleting event:', eventId);
      await axiosInstance.delete(`${this.baseURL}/events/${eventId}/`);
      
      devLog('[EventsAPI] Event deleted successfully');
      return {
        success: true,
        message: 'Event deleted successfully'
      };
    } catch (error) {
      devError('[EventsAPI] Error deleting event:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete event'
      };
    }
  }

  /**
   * Register for event
   */
  async registerForEvent(eventId, registrationData = {}) {
    try {
      devLog('[EventsAPI] Registering for event:', eventId, registrationData);
      const response = await axiosInstance.post(`${this.baseURL}/events/${eventId}/register/`, registrationData);
      
      if (response.data) {
        devLog('[EventsAPI] Event registration successful:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Failed to register for event');
    } catch (error) {
      devError('[EventsAPI] Error registering for event:', error);
      return {
        success: false,
        error: error.message || 'Failed to register for event'
      };
    }
  }

  /**
   * Get event registrations
   */
  async getEventRegistrations(eventId) {
    try {
      devLog('[EventsAPI] Fetching event registrations for ID:', eventId);
      const response = await axiosInstance.get(`${this.baseURL}/events/${eventId}/registrations/`);
      
      if (response.data) {
        devLog('[EventsAPI] Event registrations loaded:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Registrations not found');
    } catch (error) {
      devError('[EventsAPI] Error fetching event registrations:', error);
      return {
        success: false,
        error: error.message || 'Failed to load event registrations'
      };
    }
  }

  /**
   * Get event statistics
   */
  async getEventStatistics(eventId) {
    try {
      devLog('[EventsAPI] Fetching event statistics for ID:', eventId);
      const response = await axiosInstance.get(`${this.baseURL}/events/${eventId}/statistics/`);
      
      if (response.data) {
        devLog('[EventsAPI] Event statistics loaded:', response.data);
        return {
          success: true,
          data: response.data
        };
      }
      
      throw new Error('Statistics not found');
    } catch (error) {
      devError('[EventsAPI] Error fetching event statistics:', error);
      return {
        success: false,
        error: error.message || 'Failed to load event statistics'
      };
    }
  }
}

// Create and export singleton instance
const eventsApiService = new EventsApiService();
export default eventsApiService;
