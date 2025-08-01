/**
 * Campus Reporting Service
 * Story 1.6: Campus-Specific Reporting & Analytics - Task 5
 * 
 * Campus-aware reporting and data export functionality with proper data isolation
 */

import { devError, devLog } from '../components/common/devLogger';
import { API_DELAYS } from '../components/common/constants/index';

/**
 * Campus Reporting Service for generating campus-specific reports
 */
class CampusReportingService {
  /**
   * Generate campus-specific report
   * @param {Object} campusContext - Campus context
   * @param {Object} reportOptions - Report configuration
   * @returns {Promise<Object>} Generated report data
   */
  async generateCampusReport(campusContext, reportOptions = {}) {
    try {
      await new Promise(resolve => setTimeout(resolve, API_DELAYS.FETCH_EVENTS));

      const {
        reportType = 'comprehensive',
        dateRange = { start: null, end: null },
        includeCharts = true,
        format = 'json', // json, csv, pdf
        selectedCampusId = null
      } = reportOptions;

      devLog("[CampusReportingService] Generating campus report:", {
        campusId: selectedCampusId || campusContext.currentCampus.id,
        reportType,
        dateRange,
        format
      });

      // Validate permissions
      const targetCampusId = selectedCampusId || campusContext.currentCampus.id;
      if (selectedCampusId && selectedCampusId !== campusContext.currentCampus.id) {
        if (!campusContext.userCampusPermissions.isSuperAdmin) {
          throw new Error("Cross-campus reporting requires super admin permissions");
        }
      }

      // Load data
      const [eventsData, attendanceData, usersData] = await Promise.all([
        this.loadEventsData(targetCampusId, dateRange),
        this.loadAttendanceData(targetCampusId, dateRange),
        this.loadUsersData(targetCampusId)
      ]);

      // Generate report based on type
      let reportData;
      switch (reportType) {
        case 'events':
          reportData = this.generateEventsReport(eventsData, attendanceData, includeCharts);
          break;
        case 'attendance':
          reportData = this.generateAttendanceReport(attendanceData, eventsData, includeCharts);
          break;
        case 'users':
          reportData = this.generateUsersReport(usersData, includeCharts);
          break;
        case 'comprehensive':
        default:
          reportData = this.generateComprehensiveReport(eventsData, attendanceData, usersData, includeCharts);
          break;
      }

      // Add metadata
      const report = {
        metadata: {
          campusId: targetCampusId,
          campusName: selectedCampusId
            ? campusContext.availableCampuses.find(c => c.id === selectedCampusId)?.displayName
            : campusContext.currentCampus.displayName,
          reportType,
          generatedAt: new Date().toISOString(),
          generatedBy: campusContext.currentUser?.id || 'system',
          dateRange: {
            start: dateRange.start || eventsData.reduce((earliest, event) => 
              !earliest || new Date(event.date) < new Date(earliest) ? event.date : earliest, null),
            end: dateRange.end || new Date().toISOString().split('T')[0]
          },
          dataPoints: {
            events: eventsData.length,
            attendance: attendanceData.length,
            users: usersData.length
          }
        },
        data: reportData,
        exportInfo: {
          format,
          canExport: true,
          exportUrl: format !== 'json' ? this.generateExportUrl(reportData, format) : null
        }
      };

      devLog("[CampusReportingService] Report generated successfully:", {
        campusId: targetCampusId,
        dataPoints: report.metadata.dataPoints
      });

      return report;

    } catch (error) {
      devError("[CampusReportingService] Error generating campus report:", error);
      throw error;
    }
  }

  /**
   * Generate system-wide report for super admins
   * @param {Object} campusContext - Campus context with super admin permissions
   * @param {Object} reportOptions - Report configuration
   * @returns {Promise<Object>} System-wide report data
   */
  async generateSystemReport(campusContext, reportOptions = {}) {
    try {
      if (!campusContext.userCampusPermissions.isSuperAdmin) {
        throw new Error("System reports require super admin permissions");
      }

      await new Promise(resolve => setTimeout(resolve, API_DELAYS.FETCH_EVENTS));

      const {
        selectedCampusIds = null,
        reportType = 'system_overview',
        dateRange = { start: null, end: null },
        includeComparison = true
      } = reportOptions;

      devLog("[CampusReportingService] Generating system report:", {
        selectedCampusIds,
        reportType,
        includeComparison
      });

      // Load data for all or selected campuses
      const campusesToInclude = selectedCampusIds || 
        campusContext.availableCampuses.map(campus => campus.id);

      const campusReports = await Promise.all(
        campusesToInclude.map(async (campusId) => {
          const [events, attendance, users] = await Promise.all([
            this.loadEventsData(campusId, dateRange),
            this.loadAttendanceData(campusId, dateRange),
            this.loadUsersData(campusId)
          ]);

          const campus = campusContext.availableCampuses.find(c => c.id === campusId);
          
          return {
            campusId,
            campusName: campus?.displayName || 'Unknown Campus',
            campusCode: campus?.code || 'UNK',
            metrics: this.calculateCampusMetrics(events, attendance, users),
            data: { events, attendance, users }
          };
        })
      );

      // Calculate system-wide metrics
      const systemMetrics = this.calculateSystemMetrics(campusReports);

      // Generate comparison data if requested
      const comparisonData = includeComparison 
        ? this.generateCampusComparison(campusReports)
        : null;

      const systemReport = {
        metadata: {
          reportType: 'system_report',
          generatedAt: new Date().toISOString(),
          generatedBy: campusContext.currentUser?.id || 'system',
          campusesIncluded: campusesToInclude,
          dateRange: dateRange
        },
        systemMetrics,
        campusReports: campusReports.map(report => ({
          campusId: report.campusId,
          campusName: report.campusName,
          campusCode: report.campusCode,
          metrics: report.metrics
        })),
        comparisonData,
        charts: this.generateSystemCharts(campusReports)
      };

      devLog("[CampusReportingService] System report generated successfully");
      return systemReport;

    } catch (error) {
      devError("[CampusReportingService] Error generating system report:", error);
      throw error;
    }
  }

  /**
   * Load events data for campus
   */
  async loadEventsData(campusId, dateRange) {
    const mockEvents = await import('../data/mockEvents.json');
    const events = mockEvents.default.events || mockEvents.events || [];
    
    return events.filter(event => {
      const matchesCampus = event.campusId === campusId;
      
      if (!matchesCampus) return false;
      
      if (dateRange.start || dateRange.end) {
        const eventDate = new Date(event.date);
        if (dateRange.start && eventDate < new Date(dateRange.start)) return false;
        if (dateRange.end && eventDate > new Date(dateRange.end)) return false;
      }
      
      return true;
    });
  }

  /**
   * Load attendance data for campus
   */
  async loadAttendanceData(campusId, dateRange) {
    const [mockAttendance, mockEvents] = await Promise.all([
      import('../data/mockAttendance.json'),
      import('../data/mockEvents.json')
    ]);
    
    const attendance = mockAttendance.default.attendance || mockAttendance.attendance || [];
    const events = mockEvents.default.events || mockEvents.events || [];
    
    return attendance.filter(record => {
      const event = events.find(e => e.id === record.eventId);
      if (!event || event.campusId !== campusId) return false;
      
      if (dateRange.start || dateRange.end) {
        const checkInDate = new Date(record.checkInTime);
        if (dateRange.start && checkInDate < new Date(dateRange.start)) return false;
        if (dateRange.end && checkInDate > new Date(dateRange.end)) return false;
      }
      
      return true;
    });
  }

  /**
   * Load users data for campus
   */
  async loadUsersData(campusId) {
    const mockUsers = await import('../data/mockUsers.json');
    const users = mockUsers.default.users || mockUsers.users || [];
    
    return users.filter(user => user.campusId === campusId);
  }

  /**
   * Generate comprehensive campus report
   */
  generateComprehensiveReport(events, attendance, users, includeCharts) {
    const currentDate = new Date();
    
    // Calculate metrics
    const metrics = this.calculateCampusMetrics(events, attendance, users);
    
    // Generate summary
    const summary = {
      totalEvents: events.length,
      upcomingEvents: events.filter(e => new Date(e.date) >= currentDate).length,
      totalAttendance: attendance.length,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      attendanceRate: events.length > 0 ? Math.round((attendance.length / (events.length * 50)) * 100) : 0
    };

    // Generate detailed analytics
    const analytics = {
      eventsByCategory: this.analyzeEventsByCategory(events),
      attendanceByMonth: this.analyzeAttendanceByMonth(attendance),
      usersByRole: this.analyzeUsersByRole(users),
      topEvents: this.analyzeTopEvents(events, attendance),
      attendanceTrends: this.analyzeAttendanceTrends(attendance, events)
    };

    const report = {
      summary,
      metrics,
      analytics,
      charts: includeCharts ? this.generateReportCharts(events, attendance, users) : null,
      details: {
        events: events.map(event => ({
          id: event.id,
          title: event.title,
          date: event.date,
          category: event.category,
          attendees: attendance.filter(a => a.eventId === event.id).length,
          maxAttendees: event.maxAttendees
        })),
        recentActivity: this.generateRecentActivity(events, attendance)
      }
    };

    return report;
  }

  /**
   * Generate events-specific report
   */
  generateEventsReport(events, attendance, includeCharts) {
    return {
      summary: {
        totalEvents: events.length,
        eventsByCategory: this.analyzeEventsByCategory(events),
        averageAttendance: events.length > 0 ? Math.round(attendance.length / events.length) : 0
      },
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        category: event.category,
        location: event.location,
        maxAttendees: event.maxAttendees,
        actualAttendees: attendance.filter(a => a.eventId === event.id).length,
        attendanceRate: event.maxAttendees > 0 
          ? Math.round((attendance.filter(a => a.eventId === event.id).length / event.maxAttendees) * 100)
          : 0
      })),
      charts: includeCharts ? this.generateEventsCharts(events, attendance) : null
    };
  }

  /**
   * Generate attendance-specific report
   */
  generateAttendanceReport(attendance, events, includeCharts) {
    return {
      summary: {
        totalAttendance: attendance.length,
        uniqueAttendees: new Set(attendance.map(a => a.userId)).size,
        averagePerEvent: events.length > 0 ? Math.round(attendance.length / events.length) : 0
      },
      attendanceByEvent: events.map(event => ({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        attendeeCount: attendance.filter(a => a.eventId === event.id).length
      })),
      trends: this.analyzeAttendanceTrends(attendance, events),
      charts: includeCharts ? this.generateAttendanceCharts(attendance, events) : null
    };
  }

  /**
   * Generate users-specific report
   */
  generateUsersReport(users, includeCharts) {
    return {
      summary: {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.isActive).length,
        usersByRole: this.analyzeUsersByRole(users)
      },
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt
      })),
      charts: includeCharts ? this.generateUsersCharts(users) : null
    };
  }

  /**
   * Calculate campus metrics
   */
  calculateCampusMetrics(events, attendance, users) {
    const currentDate = new Date();
    
    return {
      events: {
        total: events.length,
        upcoming: events.filter(e => new Date(e.date) >= currentDate).length,
        past: events.filter(e => new Date(e.date) < currentDate).length,
        byCategory: this.analyzeEventsByCategory(events)
      },
      attendance: {
        total: attendance.length,
        averagePerEvent: events.length > 0 ? Math.round(attendance.length / events.length) : 0,
        attendanceRate: events.length > 0 ? Math.round((attendance.length / (events.length * 50)) * 100) : 0
      },
      users: {
        total: users.length,
        active: users.filter(u => u.isActive).length,
        byRole: this.analyzeUsersByRole(users)
      }
    };
  }

  /**
   * Calculate system-wide metrics
   */
  calculateSystemMetrics(campusReports) {
    const totalEvents = campusReports.reduce((sum, campus) => sum + campus.metrics.events.total, 0);
    const totalAttendance = campusReports.reduce((sum, campus) => sum + campus.metrics.attendance.total, 0);
    const totalUsers = campusReports.reduce((sum, campus) => sum + campus.metrics.users.total, 0);
    
    return {
      totalCampuses: campusReports.length,
      totalEvents,
      totalAttendance,
      totalUsers,
      averageEventsPerCampus: Math.round(totalEvents / campusReports.length),
      averageUsersPerCampus: Math.round(totalUsers / campusReports.length),
      systemAttendanceRate: totalEvents > 0 ? Math.round((totalAttendance / (totalEvents * 50)) * 100) : 0
    };
  }

  /**
   * Generate campus comparison data
   */
  generateCampusComparison(campusReports) {
    return {
      eventsComparison: campusReports.map(campus => ({
        campus: campus.campusCode,
        events: campus.metrics.events.total,
        attendance: campus.metrics.attendance.total,
        users: campus.metrics.users.total
      })),
      performanceRanking: campusReports
        .map(campus => ({
          campus: campus.campusCode,
          score: campus.metrics.attendance.attendanceRate
        }))
        .sort((a, b) => b.score - a.score)
    };
  }

  /**
   * Analyze events by category
   */
  analyzeEventsByCategory(events) {
    const categoryCount = {};
    events.forEach(event => {
      const category = event.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    return categoryCount;
  }

  /**
   * Analyze users by role
   */
  analyzeUsersByRole(users) {
    const roleCount = {};
    users.forEach(user => {
      const role = user.role || 'student';
      roleCount[role] = (roleCount[role] || 0) + 1;
    });
    return roleCount;
  }

  /**
   * Analyze attendance trends
   */
  analyzeAttendanceTrends(attendance, events) {
    const monthlyData = {};
    
    attendance.forEach(record => {
      const date = new Date(record.checkInTime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Analyze top events by attendance
   */
  analyzeTopEvents(events, attendance) {
    return events
      .map(event => ({
        ...event,
        attendeeCount: attendance.filter(a => a.eventId === event.id).length
      }))
      .sort((a, b) => b.attendeeCount - a.attendeeCount)
      .slice(0, 10);
  }

  /**
   * Generate recent activity
   */
  generateRecentActivity(events, attendance) {
    const activities = [];
    
    // Recent events
    events
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 5)
      .forEach(event => {
        activities.push({
          type: 'event',
          title: event.title,
          date: event.date,
          timestamp: event.createdAt || event.date
        });
      });

    // Recent attendance
    attendance
      .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))
      .slice(0, 5)
      .forEach(record => {
        const event = events.find(e => e.id === record.eventId);
        if (event) {
          activities.push({
            type: 'attendance',
            title: `Check-in for ${event.title}`,
            date: record.checkInTime,
            timestamp: record.checkInTime
          });
        }
      });

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }

  /**
   * Generate export URL for different formats
   */
  generateExportUrl(reportData, format) {
    // Mock URL generation - in production, upload to cloud storage
    const dataBlob = this.formatDataForExport(reportData, format);
    return `data:${this.getMimeType(format)};base64,${btoa(JSON.stringify(dataBlob))}`;
  }

  /**
   * Format data for export
   */
  formatDataForExport(reportData, format) {
    switch (format) {
      case 'csv':
        return this.convertToCSV(reportData);
      case 'pdf':
        return this.convertToPDF(reportData);
      default:
        return reportData;
    }
  }

  /**
   * Get MIME type for format
   */
  getMimeType(format) {
    const mimeTypes = {
      'json': 'application/json',
      'csv': 'text/csv',
      'pdf': 'application/pdf'
    };
    return mimeTypes[format] || 'application/json';
  }

  /**
   * Convert report to CSV format
   */
  convertToCSV(reportData) {
    // Simple CSV conversion - enhance as needed
    if (reportData.details && reportData.details.events) {
      const headers = ['Event ID', 'Title', 'Date', 'Category', 'Attendees', 'Max Attendees'];
      const rows = reportData.details.events.map(event => [
        event.id,
        event.title,
        event.date,
        event.category,
        event.attendees,
        event.maxAttendees
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(reportData);
  }

  /**
   * Convert report to PDF format (placeholder)
   */
  convertToPDF(reportData) {
    // Placeholder for PDF generation - integrate with PDF library
    return {
      format: 'pdf',
      content: reportData,
      note: 'PDF generation would be implemented with a proper PDF library'
    };
  }

  /**
   * Generate report charts data
   */
  generateReportCharts(events, attendance, users) {
    return {
      eventsByCategory: this.analyzeEventsByCategory(events),
      attendanceOverTime: this.analyzeAttendanceTrends(attendance, events),
      usersByRole: this.analyzeUsersByRole(users)
    };
  }

  /**
   * Generate events-specific charts
   */
  generateEventsCharts(events, attendance) {
    return {
      eventsByCategory: this.analyzeEventsByCategory(events),
      attendanceByEvent: events.map(event => ({
        title: event.title.slice(0, 20) + (event.title.length > 20 ? '...' : ''),
        attendees: attendance.filter(a => a.eventId === event.id).length
      }))
    };
  }

  /**
   * Generate attendance-specific charts
   */
  generateAttendanceCharts(attendance, events) {
    return {
      attendanceOverTime: this.analyzeAttendanceTrends(attendance, events),
      attendanceByEvent: events.map(event => ({
        title: event.title.slice(0, 20) + (event.title.length > 20 ? '...' : ''),
        attendees: attendance.filter(a => a.eventId === event.id).length
      }))
    };
  }

  /**
   * Generate users-specific charts
   */
  generateUsersCharts(users) {
    return {
      usersByRole: this.analyzeUsersByRole(users),
      activeVsInactive: {
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length
      }
    };
  }

  /**
   * Generate system-wide charts
   */
  generateSystemCharts(campusReports) {
    return {
      campusComparison: campusReports.map(campus => ({
        campus: campus.campusCode,
        events: campus.metrics.events.total,
        users: campus.metrics.users.total,
        attendance: campus.metrics.attendance.total
      })),
      performanceComparison: campusReports.map(campus => ({
        campus: campus.campusCode,
        attendanceRate: campus.metrics.attendance.attendanceRate
      }))
    };
  }
}

// Export singleton instance
export const campusReportingService = new CampusReportingService();
export default campusReportingService;
