# API Design and Integration

### API Integration Strategy

**Campus-Aware Endpoint Enhancement:**
All existing API endpoints will be enhanced with optional campus context while maintaining backward compatibility.

#### **Campus Parameter Injection Pattern**
```typescript
// Current API call pattern
GET /api/users?role=student&department=CEIT

// Enhanced with campus context (backward compatible)
GET /api/users?role=student&department=CEIT&campus_id=1

// Admin cross-campus access
GET /api/users?role=student&campus_id=all  // Admin only
```

#### **Authentication Integration**
```typescript
interface AuthenticatedRequest {
  // Existing fields
  userId: number;
  userRole: string;
  
  // New campus context
  userCampusId: number;
  canAccessMultipleCampuses: boolean;
  accessibleCampusIds: number[];
}
```

### New API Endpoints Required

#### **Campus Management Endpoints**
```typescript
// Campus information
GET /api/campuses
Response: Campus[]

GET /api/campuses/{campus_id}
Response: Campus

// Campus-specific metadata
GET /api/campuses/{campus_id}/departments
Response: Department[]

GET /api/campuses/{campus_id}/statistics
Response: CampusStatistics
```

#### **Enhanced Existing Endpoints**

**User Management APIs:**
```typescript
// Enhanced user endpoints with campus filtering
GET /api/users?campus_id={id}           // Campus-filtered users
POST /api/users                         // Campus assigned from user context
PUT /api/users/{id}                     // Campus validation on update
DELETE /api/users/{id}                  // Campus permission check

// User campus assignment
PUT /api/users/{id}/campus              // Admin-only campus reassignment
GET /api/users/me/campus-permissions    // User's campus access rights
```

**Event Management APIs:**
```typescript
// Enhanced event endpoints
GET /api/events?campus_id={id}          // Campus-specific events
POST /api/events                        // Auto-assign organizer's campus
PUT /api/events/{id}                    // Campus validation for modifications

// Multi-campus event management (admin only)
POST /api/events/{id}/add-campus        // Add campus to multi-campus event
DELETE /api/events/{id}/remove-campus   // Remove campus from event
GET /api/events/multi-campus            // Cross-campus events list
```

**Attendance APIs:**
```typescript
// Enhanced attendance endpoints
GET /api/attendance?campus_id={id}      // Campus-filtered attendance
POST /api/attendance                    // Campus validation for check-in
GET /api/attendance/stats?campus_id={id} // Campus-specific statistics

// Cross-campus attendance analytics (admin only)
GET /api/attendance/cross-campus-analytics
GET /api/attendance/campus-comparison
```

### API Response Format Enhancement

#### **Campus Context in Responses**
```typescript
// Standard response wrapper with campus context
interface ApiResponse<T> {
  data: T;
  campus_context: {
    requested_campus_id: number;
    user_campus_id: number;
    cross_campus_access: boolean;
  };
  pagination?: PaginationInfo;
  filters_applied?: FilterInfo;
}

// Example user response with campus context
interface UserApiResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  
  // Campus information
  campus_id: number;
  campus_name: string;
  can_access_other_campuses: boolean;
  
  // Existing fields preserved
  department_id: string;
  college: string; // Kept for backward compatibility
}
```

### API Authentication and Authorization

#### **Campus-Based Authorization Middleware**
```typescript
interface CampusAuthorizationConfig {
  endpoint: string;
  campus_access_rules: {
    student: "own_campus_only";
    organizer: "own_campus_only";
    admin: "all_campuses";
    super_admin: "all_campuses";
  };
  cross_campus_override?: boolean; // Admin-only endpoints
}

// Authorization check pattern
const validateCampusAccess = (user: AuthUser, requestedCampusId: number) => {
  if (user.role === 'admin' || user.role === 'super_admin') {
    return true; // Admin can access all campuses
  }
  
  if (requestedCampusId === user.campusId) {
    return true; // User can access their own campus
  }
  
  return false; // Deny cross-campus access for students/organizers
};
```

#### **API Key Campus Restrictions**
```typescript
interface ApiKey {
  key: string;
  permissions: string[];
  campus_restrictions?: number[]; // Restrict API key to specific campuses
  rate_limits: {
    per_campus: number;
    global: number;
  };
}
```

### Data Filtering Implementation

#### **Automatic Campus Filtering**
```typescript
// Service layer campus filtering
class CampusAwareService {
  private applyCampusFilter<T>(
    query: Query<T>, 
    userContext: AuthUser, 
    requestedCampusId?: number
  ): Query<T> {
    // Admin can access all campuses or specific campus
    if (userContext.role === 'admin') {
      if (requestedCampusId && requestedCampusId !== 'all') {
        return query.where('campus_id', requestedCampusId);
      }
      return query; // No filter for admin accessing all
    }
    
    // Non-admin users limited to their assigned campus
    return query.where('campus_id', userContext.campusId);
  }
}
```

#### **Campus-Aware Query Builder**
```typescript
// Django ORM campus filtering
class CampusQuerySet(models.QuerySet):
    def for_campus(self, campus_id):
        return self.filter(campus_id=campus_id)
    
    def for_user_campus(self, user):
        if user.is_admin():
            return self  # No filtering for admin
        return self.filter(campus_id=user.campus_id)
    
    def accessible_to_user(self, user, requested_campus_id=None):
        if user.is_admin():
            if requested_campus_id:
                return self.filter(campus_id=requested_campus_id)
            return self  # Admin can see all
        return self.filter(campus_id=user.campus_id)
```

### Error Handling and Validation

#### **Campus-Specific Error Codes**
```typescript
enum CampusApiErrors {
  CAMPUS_ACCESS_DENIED = 'CAMPUS_ACCESS_DENIED',
  INVALID_CAMPUS_ID = 'INVALID_CAMPUS_ID',
  CROSS_CAMPUS_NOT_ALLOWED = 'CROSS_CAMPUS_NOT_ALLOWED',
  CAMPUS_ASSIGNMENT_REQUIRED = 'CAMPUS_ASSIGNMENT_REQUIRED',
  CAMPUS_CAPACITY_EXCEEDED = 'CAMPUS_CAPACITY_EXCEEDED'
}

interface CampusErrorResponse {
  error: CampusApiErrors;
  message: string;
  campus_context: {
    user_campus_id: number;
    requested_campus_id?: number;
    required_permissions: string[];
  };
}
```

#### **Campus Validation Rules**
```typescript
const campusValidationRules = {
  user_campus_assignment: {
    required: true,
    valid_campus_ids: [1, 2, 3, 4],
    immutable_after_creation: false // Admin can reassign
  },
  
  event_campus_assignment: {
    required: true,
    must_match_organizer_campus: true,
    admin_can_override: true
  },
  
  attendance_campus_validation: {
    must_match_user_campus: true,
    cross_campus_requires_admin: true,
    location_verification_required: true
  }
};
```

### Performance Optimization

#### **Campus-Based Caching Strategy**
```typescript
interface CampusCacheStrategy {
  cache_keys: {
    pattern: "campus:{campus_id}:{resource}:{id}";
    examples: [
      "campus:1:users:active",
      "campus:2:events:upcoming", 
      "campus:3:attendance:stats"
    ];
  };
  
  cache_invalidation: {
    user_campus_change: ["campus:{old_id}:users:*", "campus:{new_id}:users:*"];
    event_creation: ["campus:{campus_id}:events:*"];
    attendance_record: ["campus:{campus_id}:attendance:*"];
  };
  
  ttl_strategy: {
    user_data: 300, // 5 minutes
    event_data: 600, // 10 minutes  
    attendance_stats: 60 // 1 minute
  };
}
```

#### **Database Query Optimization**
```sql
-- Campus-optimized queries with indexes
SELECT u.*, c.name as campus_name 
FROM users u 
JOIN campuses c ON u.campus_id = c.id 
WHERE u.campus_id = ? 
AND u.role = ?
ORDER BY u.created_at DESC;

-- Index strategy for optimal performance
CREATE INDEX idx_users_campus_role ON users(campus_id, role, created_at);
CREATE INDEX idx_events_campus_date ON events(campus_id, date, status);
CREATE INDEX idx_attendance_campus_event ON attendance(campus_id, event_id, created_at);
```

**This API design strategy ensures seamless campus integration while maintaining backward compatibility and optimal performance. The approach provides comprehensive campus-aware functionality with robust security and validation.**
