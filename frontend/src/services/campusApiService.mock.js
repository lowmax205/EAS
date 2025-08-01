/**
 * Campus API Service - Mock Implementation for Testing
 * Provides campus-aware API endpoints with automatic filtering and validation
 * Story 1.3: Campus-Aware API Endpoints implementation
 */

class CampusApiService {
  constructor() {
    this.mockCampuses = [
      { id: 1, name: 'Main Campus', location: 'Downtown' },
      { id: 2, name: 'North Campus', location: 'North District' },
      { id: 3, name: 'East Campus', location: 'East District' },
      { id: 4, name: 'West Campus', location: 'West District' }
    ];
  }

  /**
   * Get current user's campus context (mock implementation)
   */
  getCampusContext() {
    // Default context - can be overridden in tests
    return {
      userCampusId: 1,
      canAccessMultipleCampuses: false,
      accessibleCampusIds: [1],
      isSuperAdmin: false,
      isCampusAdmin: false
    };
  }

  /**
   * List all campuses (with permission filtering)
   */
  async listCampuses() {
    const campusContext = this.getCampusContext();
    
    try {
      // Super admin can see all campuses, others see only accessible ones
      if (campusContext.isSuperAdmin) {
        return this.mockCampuses;
      } else {
        // Filter to only show accessible campuses
        return this.mockCampuses.filter(campus => 
          campusContext.accessibleCampusIds.includes(campus.id)
        );
      }
    } catch (error) {
      console.error('[CampusApiService] Error listing campuses:', error);
      throw error;
    }
  }

  /**
   * Get campus details by ID
   */
  async getCampusDetails(campusId) {
    const campusContext = this.getCampusContext();
    
    // Check if user has access to this campus
    if (!campusContext.isSuperAdmin && !campusContext.accessibleCampusIds.includes(campusId)) {
      throw new Error('Insufficient permissions to access this campus');
    }

    try {
      const campus = this.mockCampuses.find(c => c.id === campusId);
      if (!campus) {
        throw new Error('Campus not found');
      }
      
      return {
        ...campus,
        details: {
          students: 1500,
          faculty: 120,
          events: 45
        }
      };
    } catch (error) {
      console.error('[CampusApiService] Error fetching campus details:', error);
      throw error;
    }
  }

  /**
   * Get campus analytics
   */
  async getCampusAnalytics(campusId) {
    const campusContext = this.getCampusContext();
    
    // Check permissions
    if (!campusContext.isSuperAdmin && !campusContext.accessibleCampusIds.includes(campusId)) {
      throw new Error('Insufficient permissions to access campus analytics');
    }

    try {
      return {
        campusId,
        analytics: {
          totalStudents: 1500,
          activeEvents: 12,
          attendanceRate: 85.5,
          monthlyGrowth: 8.2
        }
      };
    } catch (error) {
      console.error('[CampusApiService] Error fetching campus analytics:', error);
      throw error;
    }
  }

  /**
   * Get cross-campus analytics (super admin only)
   */
  async getCrossCampusAnalytics() {
    const campusContext = this.getCampusContext();
    
    if (!campusContext.isSuperAdmin) {
      throw new Error('Only super administrators can access cross-campus analytics');
    }

    try {
      return {
        totalCampuses: 4,
        totalStudents: 6200,
        totalEvents: 89,
        averageAttendanceRate: 82.3,
        campusBreakdown: this.mockCampuses.map(campus => ({
          id: campus.id,
          name: campus.name,
          students: Math.floor(Math.random() * 2000) + 1000,
          events: Math.floor(Math.random() * 30) + 10
        }))
      };
    } catch (error) {
      console.error('[CampusApiService] Error fetching cross-campus analytics:', error);
      throw error;
    }
  }

  /**
   * Create new campus (super admin only)
   */
  async createCampus(campusData) {
    const campusContext = this.getCampusContext();
    
    if (!campusContext.isSuperAdmin) {
      throw new Error('Only super administrators can create campuses');
    }

    try {
      const newCampus = {
        id: this.mockCampuses.length + 1,
        ...campusData,
        createdAt: new Date().toISOString()
      };
      
      this.mockCampuses.push(newCampus);
      return newCampus;
    } catch (error) {
      console.error('[CampusApiService] Error creating campus:', error);
      throw error;
    }
  }

  /**
   * Update campus information
   */
  async updateCampus(campusId, updates) {
    const campusContext = this.getCampusContext();
    
    // Check permissions - must be super admin or admin of the specific campus
    if (!campusContext.isSuperAdmin && 
        (!campusContext.isCampusAdmin || campusContext.userCampusId !== campusId)) {
      throw new Error('Insufficient permissions to update this campus');
    }

    try {
      const campusIndex = this.mockCampuses.findIndex(c => c.id === campusId);
      if (campusIndex === -1) {
        throw new Error('Campus not found');
      }
      
      this.mockCampuses[campusIndex] = {
        ...this.mockCampuses[campusIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      return this.mockCampuses[campusIndex];
    } catch (error) {
      console.error('[CampusApiService] Error updating campus:', error);
      throw error;
    }
  }

  /**
   * Delete campus (super admin only)
   */
  async deleteCampus(campusId) {
    const campusContext = this.getCampusContext();
    
    if (!campusContext.isSuperAdmin) {
      throw new Error('Only super administrators can delete campuses');
    }

    try {
      const campusIndex = this.mockCampuses.findIndex(c => c.id === campusId);
      if (campusIndex === -1) {
        throw new Error('Campus not found');
      }
      
      const deletedCampus = this.mockCampuses.splice(campusIndex, 1)[0];
      return { success: true, deletedCampus };
    } catch (error) {
      console.error('[CampusApiService] Error deleting campus:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const campusApiService = new CampusApiService();
export default campusApiService;
