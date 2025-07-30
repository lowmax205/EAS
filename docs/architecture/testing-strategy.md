# Testing Strategy

### Campus Isolation Testing Framework

#### **Test Categories and Scope**
```yaml
Testing Scope:
  Unit Tests:
    - "Campus context validation functions"
    - "Campus-aware service layer methods"
    - "Campus filtering logic validation"
    - "Campus authorization rule enforcement"
  
  Integration Tests:
    - "Campus-based API endpoint security"
    - "Database campus isolation verification"
    - "Campus context propagation through services"
    - "Cross-campus operation authorization"
  
  End-to-End Tests:
    - "Complete campus-based user workflows"
    - "Campus switching functionality"
    - "Multi-campus admin operations"
    - "Campus data isolation verification"
  
  Security Tests:
    - "Campus access control bypass attempts"
    - "Campus data leakage prevention"
    - "Campus privilege escalation testing"
    - "Campus session security validation"
```

#### **Campus Test Data Strategy**
```typescript
interface CampusTestDataModel {
  test_campuses: {
    campus_1: {
      id: 1;
      name: "Main Campus Test";
      users: TestUser[];
      events: TestEvent[];
      departments: TestDepartment[];
    };
    
    campus_2: {
      id: 2;
      name: "Malimono Campus Test";
      users: TestUser[];
      events: TestEvent[];
      departments: TestDepartment[];
    };
  };
  
  cross_campus_scenarios: {
    admin_cross_campus_access: TestScenario;
    unauthorized_campus_access: TestScenario;
    campus_switching_workflow: TestScenario;
    multi_campus_event_management: TestScenario;
  };
}
```

### Automated Testing Implementation

#### **Campus Isolation Unit Tests**
```typescript
// Example Jest test suite for campus isolation
describe('Campus Isolation', () => {
  describe('User Data Access', () => {
    test('should only return users from same campus for non-admin', async () => {
      const studentUser = createTestUser({ campusId: 1, role: 'student' });
      const userService = new UserService(studentUser);
      
      const users = await userService.getUsers();
      
      expect(users.every(user => user.campusId === 1)).toBe(true);
    });
    
    test('should return all users for admin', async () => {
      const adminUser = createTestUser({ campusId: 1, role: 'admin' });
      const userService = new UserService(adminUser);
      
      const users = await userService.getUsers();
      
      expect(users.some(user => user.campusId !== 1)).toBe(true);
    });
    
    test('should prevent cross-campus user access', async () => {
      const studentUser = createTestUser({ campusId: 1, role: 'student' });
      const userService = new UserService(studentUser);
      
      await expect(
        userService.getUser(campus2UserId)
      ).rejects.toThrow('CAMPUS_ACCESS_DENIED');
    });
  });
  
  describe('Event Management', () => {
    test('should create events in user campus by default', async () => {
      const organizer = createTestUser({ campusId: 2, role: 'organizer' });
      const eventService = new EventService(organizer);
      
      const event = await eventService.createEvent({
        title: 'Test Event',
        date: '2025-08-01'
      });
      
      expect(event.campusId).toBe(2);
    });
    
    test('should prevent cross-campus event modification', async () => {
      const organizer = createTestUser({ campusId: 1, role: 'organizer' });
      const eventService = new EventService(organizer);
      
      await expect(
        eventService.updateEvent(campus2EventId, { title: 'Modified' })
      ).rejects.toThrow('CAMPUS_ACCESS_DENIED');
    });
  });
});
```

#### **Campus API Integration Tests**
```typescript
// API integration tests with campus context
describe('Campus API Integration', () => {
  describe('Authentication & Authorization', () => {
    test('should include campus context in JWT token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student@campus2.test', password: 'password' });
      
      const decodedToken = jwt.decode(loginResponse.body.token);
      expect(decodedToken.campus_id).toBe(2);
      expect(decodedToken.campus_permissions).toBeDefined();
    });
    
    test('should enforce campus access in API endpoints', async () => {
      const campus1Token = await getTestToken({ campusId: 1, role: 'student' });
      
      const response = await request(app)
        .get('/api/users?campus_id=2')
        .set('Authorization', `Bearer ${campus1Token}`);
      
      expect(response.status).toBe(403);
      expect(response.body.error).toBe('CAMPUS_ACCESS_DENIED');
    });
  });
  
  describe('Data Filtering', () => {
    test('should automatically filter data by user campus', async () => {
      const campus2Token = await getTestToken({ campusId: 2, role: 'organizer' });
      
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${campus2Token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.every(event => event.campus_id === 2)).toBe(true);
    });
    
    test('should allow admin cross-campus access with explicit parameter', async () => {
      const adminToken = await getTestToken({ campusId: 1, role: 'admin' });
      
      const response = await request(app)
        .get('/api/users?campus_id=3')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.every(user => user.campus_id === 3)).toBe(true);
    });
  });
});
```

#### **Database Campus Isolation Tests**
```sql
-- SQL test scripts for database-level campus isolation
-- Test Row-Level Security policies

-- Setup test data
INSERT INTO test_users (id, name, campus_id, role) VALUES
  (1, 'Campus 1 Student', 1, 'student'),
  (2, 'Campus 2 Student', 2, 'student'),
  (3, 'Admin User', 1, 'admin');

-- Test campus isolation for students
SET app.current_user_campus_id = '1';
SET app.current_user_role = 'student';

-- Should only return campus 1 users
SELECT assert_equals(
  (SELECT COUNT(*) FROM users WHERE campus_id = 1),
  (SELECT COUNT(*) FROM users),
  'Student should only see own campus users'
);

-- Test admin cross-campus access
SET app.current_user_role = 'admin';

-- Should return all users
SELECT assert_equals(
  (SELECT COUNT(*) FROM users),
  3,
  'Admin should see all campus users'
);
```

### Performance Testing

#### **Campus-Based Load Testing**
```typescript
interface CampusLoadTestScenarios {
  campus_isolation_performance: {
    scenario: "Concurrent campus-filtered queries";
    load: "100 users per campus simultaneously";
    success_criteria: "Response time < 200ms for campus-filtered queries";
    stress_test: "500 users per campus peak load";
  };
  
  cross_campus_admin_operations: {
    scenario: "Admin performing cross-campus operations";
    load: "1 admin accessing all 4 campuses simultaneously";
    success_criteria: "No performance degradation in campus isolation";
    stress_test: "Multiple admins with overlapping campus access";
  };
  
  campus_switching_performance: {
    scenario: "Users switching between campuses";
    load: "10 campus switches per minute per admin";
    success_criteria: "Campus context update < 100ms";
    stress_test: "Rapid campus switching under load";
  };
}
```

### User Acceptance Testing

#### **Campus Workflow Validation**
```yaml
UAT Scenarios:
  Student Workflows:
    Campus_Event_Attendance:
      Steps:
        1: "Login as campus-specific student"
        2: "View events (should only show campus events)"
        3: "Attempt to register for event from different campus"
        4: "Verify prevention of cross-campus registration"
      Expected: "Students only see and can attend campus-specific events"
    
    Campus_Profile_Management:
      Steps:
        1: "Login as student"
        2: "View profile information"
        3: "Verify campus information is displayed correctly"
        4: "Attempt to change campus assignment"
      Expected: "Campus info visible, assignment not changeable by student"
  
  Organizer Workflows:
    Campus_Event_Creation:
      Steps:
        1: "Login as campus organizer"
        2: "Create new event"
        3: "Verify event assigned to organizer's campus"
        4: "Attempt to create event for different campus"
      Expected: "Events auto-assigned to organizer campus, cross-campus prevented"
  
  Admin Workflows:
    Cross_Campus_Management:
      Steps:
        1: "Login as admin"
        2: "Switch between campus views"
        3: "Manage users across different campuses"
        4: "Create multi-campus events"
      Expected: "Full cross-campus access and management capabilities"
```

### Continuous Testing Strategy

#### **Automated Campus Security Testing**
```yaml
Continuous Security Testing:
  Daily Tests:
    - "Campus isolation policy validation"
    - "Cross-campus access control verification"
    - "Campus data leakage detection tests"
    - "Campus session security validation"
  
  Weekly Tests:
    - "Comprehensive campus permission matrix testing"
    - "Campus-based performance regression testing"
    - "Multi-campus integration testing"
    - "Campus audit trail validation"
  
  Monthly Tests:
    - "Campus security penetration testing"
    - "Campus compliance requirement validation"
    - "Disaster recovery campus isolation testing"
    - "Campus scalability stress testing"
```

#### **Test Automation Pipeline**
```typescript
interface CampusTestPipeline {
  pre_deployment_tests: {
    campus_unit_tests: "Required 100% pass rate";
    campus_integration_tests: "Required 100% pass rate";
    campus_security_tests: "Required 100% pass rate";
    performance_regression_tests: "Required < 5% degradation";
  };
  
  post_deployment_validation: {
    campus_smoke_tests: "Verify basic campus functionality";
    campus_isolation_verification: "Confirm data isolation integrity";
    campus_performance_monitoring: "Baseline performance metrics";
    campus_security_validation: "Confirm security policy enforcement";
  };
  
  monitoring_and_alerting: {
    campus_test_failure_alerts: "Immediate notification";
    performance_degradation_alerts: "5% threshold breach";
    security_test_failures: "Critical priority alerts";
    campus_isolation_violations: "Emergency response";
  };
}
```

**This comprehensive testing strategy ensures robust campus isolation, security, and performance while maintaining system reliability and user experience across all campus contexts.**
