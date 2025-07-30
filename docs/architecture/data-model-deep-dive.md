# Data Model Deep Dive

### Current Data Analysis
**Existing Campus Distribution in Mock Data:**
- **Main Campus (main-campus):** 16 users (80% of total users)
- **Malimono Campus (malimono):** 1 user
- **Del Carmen Campus (del-carmen):** 1 user
- **Mainit Campus (mainit):** 1 user
- **Multi-campus representation:** Already exists in attendance data

### Campus-to-ID Mapping Strategy

**Campus String to ID Resolution:**
```yaml
Campus Mapping:
  "main-campus" → Campus ID: 1 (Main Campus)
  "malimono" → Campus ID: 2 (Malimono Campus)
  "del-carmen" → Campus ID: 3 (Del Carmen Campus)
  "mainit" → Campus ID: 4 (Mainit Campus)
```

### Data Model Enhancement Strategy

#### **User Model Enhancement**
```typescript
interface User {
  // Existing fields remain unchanged
  id: number;
  email: string;
  name: string;
  role: string;
  departmentId: string;
  college: string; // Existing field - keep for compatibility
  
  // New fields for multi-campus support
  campusId: number; // Foreign key to Campus (1-4)
  campusName?: string; // Computed field for display
}
```

#### **Event Model Enhancement**
```typescript
interface Event {
  // Existing fields remain unchanged
  id: number;
  title: string;
  organizerId: number;
  
  // New fields for campus isolation
  campusId: number; // Foreign key to Campus
  isMultiCampus: boolean; // Allow cross-campus events (super-admin only)
  allowedCampuses?: number[]; // For multi-campus events
}
```

#### **Attendance Model Enhancement**
```typescript
interface Attendance {
  // Existing fields remain unchanged
  id: number;
  userId: number;
  eventId: number;
  
  // Campus context (derived from user/event)
  campusId: number; // Auto-populated for filtering
  crossCampusAttendance: boolean; // Flag for analytics
}
```

### Migration Strategy Details

#### **Phase 1: Data Mapping Migration**
1. **User Campus Assignment:**
   - Parse existing `college` field values
   - Map to appropriate `campusId` using campus mapping
   - Preserve original `college` field for backward compatibility
   - Add `campusId` field with proper foreign key constraints

2. **Event Campus Assignment:**
   - Assign events to organizer's campus by default
   - Add `campusId` based on event organizer's campus
   - Set `isMultiCampus` to false for all existing events

3. **Attendance Campus Context:**
   - Derive `campusId` from user's assigned campus
   - Flag any cross-campus attendance scenarios
   - Maintain referential integrity

#### **Phase 2: Service Layer Enhancement**
1. **Campus Context Injection:**
   ```typescript
   interface ServiceContext {
     userId: number;
     userRole: string;
     userCampusId: number; // New campus context
     requestedCampusId?: number; // For cross-campus operations
   }
   ```

2. **Data Filtering Strategy:**
   - **Default Behavior:** Filter by user's assigned campus
   - **Admin Override:** Allow cross-campus access for admin roles
   - **Explicit Campus Requests:** Honor campusId parameter when authorized

#### **Phase 3: Authorization Enhancement**
```typescript
interface CampusPermissions {
  canViewOtherCampuses: boolean; // Super-admin only
  canManageOwnCampus: boolean; // Campus-admin
  canViewOwnCampusOnly: boolean; // Students/organizers
  assignedCampusId: number;
  accessibleCampusIds: number[]; // For multi-campus admins
}
```

### Data Isolation Implementation

#### **ORM-Level Filtering**
1. **Automatic Campus Filtering:**
   - All queries auto-inject campus filter based on user context
   - Override mechanism for super-admin cross-campus operations
   - Query interceptor pattern for consistent filtering

2. **Index Strategy:**
   ```sql
   -- Composite indexes for performance
   CREATE INDEX idx_users_campus_department ON users(campus_id, department_id);
   CREATE INDEX idx_events_campus_date ON events(campus_id, date);
   CREATE INDEX idx_attendance_campus_event ON attendance(campus_id, event_id);
   ```

### Performance Optimization Strategy

#### **Query Optimization:**
- **Campus-First Indexing:** All major queries start with campus filter
- **Departmental Sub-filtering:** Leverage existing department hierarchy
- **Caching Strategy:** Campus-segmented cache keys
- **Query Complexity:** Minimal impact (<10% overhead) due to indexed filtering

#### **Scalability Considerations:**
- **Horizontal Scaling:** Campus-based data partitioning ready
- **Load Distribution:** Campus-specific load balancing possible
- **Data Archiving:** Campus-based archival strategies

### Risk Mitigation in Data Model

#### **Data Integrity Safeguards:**
1. **Referential Integrity:** Foreign key constraints on campus relationships
2. **Migration Validation:** Pre-migration data quality checks
3. **Rollback Capability:** Reversible migration scripts with data preservation
4. **Testing Strategy:** Campus isolation verification tests

#### **Security Considerations:**
1. **Data Leakage Prevention:** Mandatory campus filtering at ORM level
2. **Access Control:** Campus-based authorization matrix
3. **Audit Logging:** Campus context in all audit trails
4. **Cross-Campus Operations:** Explicit authorization required

**This data model strategy leverages the existing multi-campus foundation while ensuring complete data isolation and seamless migration. The approach minimizes risk by building on proven patterns while implementing robust campus-based security.**
