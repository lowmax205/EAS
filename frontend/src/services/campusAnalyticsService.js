/**
 * Campus Analytics Service
 * Story 1.6: Campus-Specific Reporting & Analytics
 * 
 * Provides campus-aware analytics and dashboard data with proper data isolation
 */

import { devError, devLog } from '../components/common/devLogger';
import { API_DELAYS } from '../components/common/constants/index';

/**
 * Campus Analytics Service for dashboard and reporting data
 */
class CampusAnalyticsService {
  /**
   * Get campus-specific dashboard analytics
   * @param {Object} campusContext - Campus context from provider
   * @param {Object} options - Query options (dateRange, etc.)
   * @returns {Promise<Object>} Campus dashboard analytics
   */
  async getCampusDashboardAnalytics(campusContext, options = {}) {
    try {
      await new Promise(resolve => setTimeout(resolve, API_DELAYS.FETCH_EVENTS));

      devLog("[CampusAnalyticsService] Fetching campus dashboard analytics:", {
        campusId: campusContext.currentCampus.id,
        campusCode: campusContext.currentCampus.code,
        options
      });

      // Load mock data
      const mockEvents = await import('../data/mockEvents.json');
      const mockAttendance = await import('../data/mockAttendance.json');
      const mockUsers = await import('../data/mockUsers.json');
      
      const events = mockEvents.default.events || mockEvents.events || [];
      const attendance = mockAttendance.default.attendance || mockAttendance.attendance || [];
      const users = mockUsers.default.users || mockUsers.users || [];

      // Filter data by campus context
      const campusEvents = events.filter(event => {
        // If user can access all campuses (super admin), optionally filter by selected campus
        if (campusContext.userCampusPermissions.isSuperAdmin && options.selectedCampusId) {
          return event.campusId === options.selectedCampusId;
        }
        // Regular users see only their campus events
        return event.campusId === campusContext.currentCampus.id;
      });

      const campusUsers = users.filter(user => {
        if (campusContext.userCampusPermissions.isSuperAdmin && options.selectedCampusId) {
          return user.campusId === options.selectedCampusId;
        }
        return user.campusId === campusContext.currentCampus.id;
      });

      const campusAttendance = attendance.filter(record => {
        const event = events.find(e => e.id === record.eventId);
        if (!event) return false;
        
        if (campusContext.userCampusPermissions.isSuperAdmin && options.selectedCampusId) {
          return event.campusId === options.selectedCampusId;
        }
        return event.campusId === campusContext.currentCampus.id;
      });

      // Calculate campus-specific metrics
      const currentDate = new Date();
      const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));

      const activeEvents = campusEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= currentDate && event.status === 'active';
      });

      const recentEvents = campusEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= thirtyDaysAgo;
      });

      const totalAttendance = campusAttendance.length;
      const averageAttendancePerEvent = recentEvents.length > 0 
        ? Math.round(totalAttendance / recentEvents.length) 
        : 0;

      const attendanceRate = recentEvents.length > 0 
        ? Math.round((totalAttendance / (recentEvents.length * 50)) * 100) // Assuming max 50 per event
        : 0;

      const analytics = {
        campusInfo: {
          campusId: options.selectedCampusId || campusContext.currentCampus.id,
          campusName: options.selectedCampusId 
            ? campusContext.availableCampuses.find(c => c.id === options.selectedCampusId)?.displayName
            : campusContext.currentCampus.displayName,
          campusCode: options.selectedCampusId
            ? campusContext.availableCampuses.find(c => c.id === options.selectedCampusId)?.code
            : campusContext.currentCampus.code
        },
        metrics: {
          totalEvents: campusEvents.length,
          activeEvents: activeEvents.length,
          totalUsers: campusUsers.length,
          totalAttendance: totalAttendance,
          averageAttendancePerEvent: averageAttendancePerEvent,
          attendanceRate: attendanceRate,
          recentEvents: recentEvents.length
        },
        charts: {
          attendanceOverTime: this.generateAttendanceOverTimeData(campusEvents, campusAttendance),
          eventsByCategory: this.generateEventsByCategoryData(campusEvents),
          userActivityMetrics: this.generateUserActivityData(campusUsers),
          monthlyTrends: this.generateMonthlyTrendsData(campusEvents, campusAttendance)
        },
        recentActivity: this.generateRecentActivityData(campusEvents, campusAttendance).slice(0, 5)
      };

      devLog("[CampusAnalyticsService] Campus analytics generated:", {
        campusId: analytics.campusInfo.campusId,
        metrics: analytics.metrics,
        chartsGenerated: Object.keys(analytics.charts).length
      });

      return analytics;

    } catch (error) {
      devError("[CampusAnalyticsService] Error fetching campus analytics:", error);
      throw error;
    }
  }

  /**
   * Get super admin cross-campus analytics
   * @param {Object} campusContext - Campus context with super admin permissions
   * @param {Array} selectedCampusIds - Optional campus filter
   * @returns {Promise<Object>} Cross-campus analytics
   */
  async getCrossCampusAnalytics(campusContext, selectedCampusIds = null) {
    try {
      if (!campusContext.userCampusPermissions.isSuperAdmin) {
        throw new Error("Cross-campus analytics requires super admin permissions");
      }

      await new Promise(resolve => setTimeout(resolve, API_DELAYS.FETCH_EVENTS));

      devLog("[CampusAnalyticsService] Fetching cross-campus analytics:", {
        selectedCampusIds,
        availableCampuses: campusContext.availableCampuses.length
      });

      // Load mock data
      const mockEvents = await import('../data/mockEvents.json');
      const mockAttendance = await import('../data/mockAttendance.json');
      const mockUsers = await import('../data/mockUsers.json');
      
      const events = mockEvents.default.events || mockEvents.events || [];
      const attendance = mockAttendance.default.attendance || mockAttendance.attendance || [];
      const users = mockUsers.default.users || mockUsers.users || [];

      // Filter by selected campuses if provided
      const filteredEvents = selectedCampusIds 
        ? events.filter(event => selectedCampusIds.includes(event.campusId))
        : events;

      const filteredUsers = selectedCampusIds
        ? users.filter(user => selectedCampusIds.includes(user.campusId))
        : users;

      // Generate campus comparison data
      const campusComparison = campusContext.availableCampuses
        .filter(campus => !selectedCampusIds || selectedCampusIds.includes(campus.id))
        .map(campus => {
          const campusEvents = filteredEvents.filter(event => event.campusId === campus.id);
          const campusUsers = filteredUsers.filter(user => user.campusId === campus.id);
          const campusAttendance = attendance.filter(record => {
            const event = events.find(e => e.id === record.eventId);
            return event && event.campusId === campus.id;
          });

          return {
            campusId: campus.id,
            campusName: campus.displayName,
            campusCode: campus.code,
            metrics: {
              totalEvents: campusEvents.length,
              totalUsers: campusUsers.length,
              totalAttendance: campusAttendance.length,
              attendanceRate: campusEvents.length > 0 
                ? Math.round((campusAttendance.length / (campusEvents.length * 50)) * 100)
                : 0
            }
          };
        });

      const systemWideMetrics = {
        totalCampuses: campusContext.availableCampuses.length,
        totalEvents: filteredEvents.length,
        totalUsers: filteredUsers.length,
        totalAttendance: attendance.length,
        averageEventsPerCampus: Math.round(filteredEvents.length / campusContext.availableCampuses.length),
        averageUsersPerCampus: Math.round(filteredUsers.length / campusContext.availableCampuses.length)
      };

      return {
        systemMetrics: systemWideMetrics,
        campusComparison: campusComparison,
        crossCampusCharts: {
          campusEventsComparison: campusComparison.map(campus => ({
            campus: campus.campusCode,
            events: campus.metrics.totalEvents,
            users: campus.metrics.totalUsers,
            attendance: campus.metrics.totalAttendance
          })),
          attendanceRateComparison: campusComparison.map(campus => ({
            campus: campus.campusCode,
            rate: campus.metrics.attendanceRate
          }))
        }
      };

    } catch (error) {
      devError("[CampusAnalyticsService] Error fetching cross-campus analytics:", error);
      throw error;
    }
  }

  /**
   * Generate attendance over time chart data
   */
  generateAttendanceOverTimeData(events, attendance) {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayEvents = events.filter(event => 
        event.date && event.date.startsWith(date)
      );
      
      const dayAttendance = attendance.filter(record => {
        const recordDate = new Date(record.checkInTime).toISOString().split('T')[0];
        return recordDate === date;
      });

      return {
        date: date,
        events: dayEvents.length,
        attendance: dayAttendance.length,
        displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
  }

  /**
   * Generate events by category chart data
   */
  generateEventsByCategoryData(events) {
    const categoryCount = {};
    
    events.forEach(event => {
      const category = event.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([category, count]) => ({
      category: category,
      count: count,
      percentage: Math.round((count / events.length) * 100)
    }));
  }

  /**
   * Generate user activity metrics
   */
  generateUserActivityData(users) {
    const roleCount = {};
    
    users.forEach(user => {
      const role = user.role || 'student';
      roleCount[role] = (roleCount[role] || 0) + 1;
    });

    return Object.entries(roleCount).map(([role, count]) => ({
      role: role.charAt(0).toUpperCase() + role.slice(1),
      count: count,
      percentage: Math.round((count / users.length) * 100)
    }));
  }

  /**
   * Generate monthly trends data
   */
  generateMonthlyTrendsData(events, attendance) {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        display: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      };
    });

    return last6Months.map(({ year, month, display }) => {
      const monthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month;
      });

      const monthAttendance = attendance.filter(record => {
        const recordDate = new Date(record.checkInTime);
        return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month;
      });

      return {
        month: display,
        events: monthEvents.length,
        attendance: monthAttendance.length,
        attendanceRate: monthEvents.length > 0 
          ? Math.round((monthAttendance.length / (monthEvents.length * 50)) * 100)
          : 0
      };
    });
  }

  /**
   * Generate recent activity data
   */
  generateRecentActivityData(events, attendance) {
    const activities = [];

    // Add recent events
    events
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 10)
      .forEach(event => {
        activities.push({
          id: `event-${event.id}`,
          type: 'event_created',
          title: `New event: ${event.title}`,
          description: `Event scheduled for ${new Date(event.date).toLocaleDateString()}`,
          timestamp: event.createdAt || event.date,
          data: { eventId: event.id, category: event.category }
        });
      });

    // Add recent attendance
    attendance
      .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))
      .slice(0, 10)
      .forEach(record => {
        const event = events.find(e => e.id === record.eventId);
        if (event) {
          activities.push({
            id: `attendance-${record.id}`,
            type: 'attendance_recorded',
            title: `Attendance recorded`,
            description: `Check-in for "${event.title}"`,
            timestamp: record.checkInTime,
            data: { eventId: record.eventId, userId: record.userId }
          });
        }
      });

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);
  }
}

// Export singleton instance
export const campusAnalyticsService = new CampusAnalyticsService();
export default campusAnalyticsService;
