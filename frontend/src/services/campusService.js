/**
 * Campus Service - Campus-aware data filtering and management
 * Story 1.1: Campus Data Model Foundation - JavaScript Service Layer
 * 
 * Provides campus-aware data filtering, user permission checks,
 * and campus context management for the EAS multi-campus system.
 */

import { CAMPUS_MIGRATION_MAP } from '../types/campus.js';

// Mock data imports
import mockUniversityData from '../data/mockUniversity.json';
import mockUsersData from '../data/mockUsers.json';
import mockEventsData from '../data/mockEvents.json';
import mockAttendanceData from '../data/mockAttendance.json';

/**
 * CampusService - Main campus service class
 */
export class CampusService {
  constructor() {
    this.campuses = [];
    this.users = [];
    this.events = [];
    this.attendance = [];
    this.initializeData();
  }

  static getInstance() {
    if (!CampusService.instance) {
      CampusService.instance = new CampusService();
    }
    return CampusService.instance;
  }

  initializeData() {
    // Load campus data from mockUniversity.json
    this.campuses = mockUniversityData.university.campuses;
    
    // Load campus-aware user data
    this.users = mockUsersData.users;
    
    // Load campus-aware event data
    this.events = mockEventsData.events;
    
    // Load campus-aware attendance data
    this.attendance = mockAttendanceData.attendance;
  }

  // Campus Management Methods
  
  /**
   * Get all campuses
   */
  getAllCampuses() {
    return this.campuses;
  }

  /**
   * Get campus by ID
   */
  getCampusById(campusId) {
    return this.campuses.find(campus => campus.id === campusId) || null;
  }

  /**
   * Get campus by legacy college value
   */
  getCampusByCollege(college) {
    const mapping = CAMPUS_MIGRATION_MAP.find(m => m.collegeValue === college);
    return mapping ? this.getCampusById(mapping.campusId) : null;
  }

  // Campus-Aware Data Filtering Methods

  /**
   * Get users filtered by campus context
   */
  getUsersByCampus(context, options = {}) {
    const { campusId, superAdminMode } = options;
    
    // Super admin can see all users across campuses
    if (superAdminMode && context.userRole === 'admin') {
      return campusId ? this.users.filter(u => u.campusId === campusId) : this.users;
    }

    // Regular users can only see users from their campus
    const userCampusId = campusId || context.userCampusId;
    return this.users.filter(user => user.campusId === userCampusId);
  }

  /**
   * Get events filtered by campus context
   */
  getEventsByCampus(context, options = {}) {
    const { campusId, includeCrossCampus, superAdminMode } = options;
    
    // Super admin can see all events
    if (superAdminMode && context.userRole === 'admin') {
      return campusId ? this.events.filter(e => e.campusId === campusId) : this.events;
    }

    const userCampusId = campusId || context.userCampusId;
    
    return this.events.filter(event => {
      // Show events from user's campus
      if (event.campusId === userCampusId) return true;
      
      // Show multi-campus events if includeCrossCampus is true
      if (includeCrossCampus && event.isMultiCampus && 
          event.allowedCampuses && event.allowedCampuses.includes(userCampusId)) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Get attendance records filtered by campus context
   */
  getAttendanceByCampus(context, options = {}) {
    const { campusId, superAdminMode } = options;
    
    // Super admin can see all attendance records
    if (superAdminMode && context.userRole === 'admin') {
      return campusId ? 
        this.attendance.filter(a => a.campusId === campusId) : 
        this.attendance;
    }

    // Regular users can only see attendance from their campus
    const userCampusId = campusId || context.userCampusId;
    return this.attendance.filter(record => record.campusId === userCampusId);
  }

  // User Permission Methods

  /**
   * Check if user can access multiple campuses
   */
  canAccessMultipleCampuses(userRole) {
    return userRole === 'admin' || userRole === 'super_admin';
  }

  /**
   * Check if user can switch between campuses
   */
  canSwitchCampuses(userRole) {
    return userRole === 'admin' || userRole === 'super_admin';
  }

  /**
   * Get accessible campus IDs for user
   */
  getAccessibleCampusIds(user) {
    if (user.role === 'admin' || user.role === 'super_admin') {
      return this.campuses.map(c => c.id);
    }
    return [user.campusId];
  }

  // Campus Analytics Methods

  /**
   * Get campus distribution statistics
   */
  getCampusDistribution() {
    const distribution = {};
    
    this.users.forEach(user => {
      const campus = this.getCampusById(user.campusId);
      const key = campus ? campus.name : 'Unknown';
      distribution[key] = (distribution[key] || 0) + 1;
    });
    
    return distribution;
  }

  /**
   * Get cross-campus attendance statistics
   */
  getCrossCampusStats() {
    const total = this.attendance.length;
    const crossCampus = this.attendance.filter(a => a.crossCampusAttendance).length;
    
    return {
      totalAttendance: total,
      crossCampusAttendance: crossCampus,
      crossCampusPercentage: total > 0 ? (crossCampus / total) * 100 : 0
    };
  }

  // Campus Validation Methods

  /**
   * Validate campus data isolation
   */
  validateCampusIsolation(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return { isValid: false, violations: ['User not found'] };
    }

    const violations = [];

    // Check if user can only see their campus data
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      const userEvents = this.events.filter(e => 
        e.organizerId === userId && e.campusId !== user.campusId
      );
      
      if (userEvents.length > 0) {
        violations.push(`User has events in other campuses: ${userEvents.length}`);
      }

      const userAttendance = this.attendance.filter(a => 
        a.userId === userId && a.campusId !== user.campusId && !a.crossCampusAttendance
      );
      
      if (userAttendance.length > 0) {
        violations.push(`User has attendance in other campuses: ${userAttendance.length}`);
      }
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }
}

// Export singleton instance
export const campusService = CampusService.getInstance();

// Export convenience functions
export const getCampusById = (id) => campusService.getCampusById(id);
export const getAllCampuses = () => campusService.getAllCampuses();
export const getUsersByCampus = (context, options) => 
  campusService.getUsersByCampus(context, options);
export const getEventsByCampus = (context, options) => 
  campusService.getEventsByCampus(context, options);
export const getAttendanceByCampus = (context, options) => 
  campusService.getAttendanceByCampus(context, options);