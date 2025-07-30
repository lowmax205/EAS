# 🧪 EAS Testing Strategy & CI/CD Guidelines

This document outlines the comprehensive testing approach and CI/CD processes for the EAS multi-campus enhancement project.

## 🎯 Testing Philosophy

### **Campus Isolation Priority**
All testing strategies prioritize **campus data isolation** as the primary concern, ensuring no cross-campus data leakage in any scenario.

### **Backward Compatibility Assurance**
Every enhancement must maintain existing SNSU functionality without regression, validated through comprehensive testing.

### **AI-Agent Friendly Testing**
Test structure and documentation optimized for AI agent understanding and execution.

---

## 🏗️ Testing Architecture

### **Test Pyramid Structure**
```
                    🔺 E2E Tests (10%)
                   Campus Integration Tests
                   Multi-Campus Workflows
                   User Journey Validation

                🔺🔺 Integration Tests (30%)
               Campus Data Isolation Tests
               API Endpoint Campus Filtering
               Database Campus Constraints

           🔺🔺🔺🔺 Unit Tests (60%)
          Campus Context Validation
          Service Layer Campus Logic
          Component Campus Awareness
```

### **Campus-Centric Test Categories**

#### **1. Campus Isolation Tests (Critical)**
```typescript
describe('Campus Data Isolation', () => {
  describe('User Data Isolation', () => {
    it('prevents users from accessing other campus user data', async () => {
      const campus1User = await createTestUser({ campusId: 1 })
      const campus2User = await createTestUser({ campusId: 2 })
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${campus1User.token}`)
      
      expect(response.body).not.toContainEqual(
        expect.objectContaining({ id: campus2User.id })
      )
    })
  })

  describe('Event Data Isolation', () => {
    it('prevents cross-campus event visibility', async () => {
      const campus1Event = await createTestEvent({ campusId: 1 })
      const campus2User = await createTestUser({ campusId: 2 })
      
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${campus2User.token}`)
      
      expect(response.body).not.toContainEqual(
        expect.objectContaining({ id: campus1Event.id })
      )
    })
  })

  describe('Attendance Data Isolation', () => {
    it('prevents cross-campus attendance access', async () => {
      // Test attendance isolation logic
    })
  })
})
```

#### **2. Campus Authorization Tests**
```typescript
describe('Campus Authorization', () => {
  describe('Campus Admin Permissions', () => {
    it('allows campus admin to manage only their campus users', async () => {
      const campusAdmin = await createCampusAdmin({ campusId: 1 })
      const otherCampusUser = await createTestUser({ campusId: 2 })
      
      const response = await request(app)
        .put(`/api/users/${otherCampusUser.id}`)
        .set('Authorization', `Bearer ${campusAdmin.token}`)
        .send({ name: 'Updated Name' })
      
      expect(response.status).toBe(403)
    })
  })

  describe('Super Admin Permissions', () => {
    it('allows super admin to access all campuses', async () => {
      const superAdmin = await createSuperAdmin()
      const campus2Data = await request(app)
        .get('/api/events?campus_id=2')
        .set('Authorization', `Bearer ${superAdmin.token}`)
      
      expect(campus2Data.status).toBe(200)
    })
  })
})
```

#### **3. Data Migration Tests**
```typescript
describe('Campus Data Migration', () => {
  describe('User Campus Assignment', () => {
    it('assigns existing users to correct campuses based on college field', async () => {
      // Setup existing data
      const existingUser = await createLegacyUser({ 
        college: 'main-campus',
        campusId: null 
      })
      
      // Run migration
      await runMigration('assign_user_campuses')
      
      // Verify assignment
      const updatedUser = await User.findById(existingUser.id)
      expect(updatedUser.campusId).toBe(1) // Main Campus
    })
  })

  describe('Event Campus Assignment', () => {
    it('assigns existing events to organizer campus', async () => {
      // Test event migration logic
    })
  })
})
```

#### **4. Performance Tests**
```typescript
describe('Campus Performance Tests', () => {
  describe('Campus Query Performance', () => {
    it('maintains query performance with campus filtering', async () => {
      // Create large dataset across multiple campuses
      await createTestData({
        campuses: 4,
        usersPerCampus: 1000,
        eventsPerCampus: 500
      })
      
      const startTime = Date.now()
      const events = await eventService.getEventsForCampus(1)
      const queryTime = Date.now() - startTime
      
      expect(queryTime).toBeLessThan(100) // 100ms threshold
      expect(events).toHaveLength(500)
    })
  })

  describe('Campus Index Efficiency', () => {
    it('uses campus indexes for optimized queries', async () => {
      const queryPlan = await db.explain(`
        SELECT * FROM events 
        WHERE campus_id = 1 AND date >= '2025-01-01'
      `)
      
      expect(queryPlan).toContain('index_scan')
      expect(queryPlan).toContain('idx_events_campus_date')
    })
  })
})
```

---

## 🔧 Test Infrastructure

### **Test Database Setup**
```typescript
// Campus test data factory
export class CampusTestDataFactory {
  static async createCampus(overrides?: Partial<Campus>): Promise<Campus> {
    return await Campus.create({
      name: 'Test Campus',
      code: 'test-campus',
      domain: 'test.campus.edu',
      config: {
        timezone: 'Asia/Manila',
        branding: { /* test branding */ }
      },
      ...overrides
    })
  }
  
  static async createTestUser(campusData: { campusId: number }): Promise<User> {
    return await User.create({
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      role: 'student',
      campusId: campusData.campusId,
      departmentId: 1
    })
  }
  
  static async createCampusAdmin(campusData: { campusId: number }): Promise<User> {
    return await User.create({
      email: `admin-${Date.now()}@example.com`,
      name: 'Campus Admin',
      role: 'campus_admin',
      campusId: campusData.campusId,
      permissions: ['manage_campus_users', 'manage_campus_events']
    })
  }
}
```

### **Test Environment Configuration**
```yaml
# test.env
DATABASE_URL=postgresql://test:test@localhost:5432/eas_test
REDIS_URL=redis://localhost:6379/1
CAMPUS_ISOLATION_ENABLED=true
TEST_CAMPUS_COUNT=4
TEST_USERS_PER_CAMPUS=10
```

### **Test Utilities**
```typescript
// Campus test utilities
export const CampusTestUtils = {
  async isolateCampusData(campusId: number) {
    // Ensure only specified campus data exists in test DB
    await User.deleteMany({ campusId: { $ne: campusId } })
    await Event.deleteMany({ campusId: { $ne: campusId } })
    await Attendance.deleteMany({ campusId: { $ne: campusId } })
  },
  
  async verifyCampusIsolation(userToken: string, expectedCampusId: number) {
    // Verify all API responses contain only expected campus data
    const endpoints = ['/api/users', '/api/events', '/api/attendance']
    
    for (const endpoint of endpoints) {
      const response = await request(app)
        .get(endpoint)
        .set('Authorization', `Bearer ${userToken}`)
      
      response.body.forEach(item => {
        expect(item.campusId).toBe(expectedCampusId)
      })
    }
  }
}
```

---

## 🚀 CI/CD Pipeline

### **GitHub Actions Workflow**
```yaml
name: EAS Multi-Campus Testing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  campus-isolation-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: eas_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install Dependencies
      run: |
        cd frontend && npm ci
        cd ../backend && pip install -r requirements.txt
    
    - name: Run Campus Data Migration Tests
      run: |
        cd backend
        python manage.py test apps.campus.tests.test_migrations
    
    - name: Run Campus Isolation Tests
      run: |
        cd backend
        python manage.py test apps.campus.tests.test_isolation
    
    - name: Run Frontend Campus Tests
      run: |
        cd frontend
        npm test -- --testPathPattern=campus
    
    - name: Run Performance Tests
      run: |
        cd backend
        python manage.py test apps.campus.tests.test_performance
    
    - name: Generate Campus Test Report
      run: |
        echo "Campus isolation test results" > campus-test-report.md
        echo "All campus isolation tests passed" >> campus-test-report.md
```

### **Pre-commit Hooks**
```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: campus-isolation-check
        name: Campus Isolation Validation
        entry: scripts/validate-campus-isolation.sh
        language: script
        files: '.*\.(ts|tsx|py)$'
        
      - id: campus-test-coverage
        name: Campus Test Coverage Check
        entry: scripts/check-campus-test-coverage.sh
        language: script
        files: '.*\.(ts|tsx|py)$'
```

### **Campus Validation Scripts**
```bash
#!/bin/bash
# scripts/validate-campus-isolation.sh

echo "🏫 Validating campus isolation patterns..."

# Check for hardcoded campus IDs
if grep -r "campus_id.*=.*[0-9]" --include="*.py" --include="*.ts" --include="*.tsx" .; then
    echo "❌ Found hardcoded campus IDs. Use campus context instead."
    exit 1
fi

# Check for direct cross-campus queries
if grep -r "\.filter.*campus_id.*!=" --include="*.py" .; then
    echo "❌ Found potential cross-campus queries. Verify isolation."
    exit 1
fi

# Check for missing campus context in new API endpoints
if grep -r "@api_view\|class.*ViewSet" --include="*.py" . | while read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    if ! grep -q "campus" "$file"; then
        echo "⚠️  API endpoint in $file may be missing campus context"
    fi
done

echo "✅ Campus isolation validation passed"
```

---

## 📊 Test Metrics & Monitoring

### **Campus Test Coverage Requirements**
- **Campus Isolation Tests:** 100% coverage for cross-campus access prevention
- **Campus Authorization Tests:** 100% coverage for permission boundaries
- **Migration Tests:** 100% coverage for data migration accuracy
- **Performance Tests:** 95% coverage for campus-filtered queries

### **Test Performance Benchmarks**
```typescript
// Performance benchmarks for campus operations
const PERFORMANCE_BENCHMARKS = {
  campusUserQuery: 50,        // ms
  campusEventQuery: 100,      // ms
  campusReportGeneration: 2000, // ms
  campusMigration: 10000,     // ms
  crossCampusAdminQuery: 200  // ms
}
```

### **Campus Test Dashboard**
```yaml
# Test metrics to track
campus_test_metrics:
  isolation_test_success_rate: target 100%
  migration_test_accuracy: target 100%
  performance_test_compliance: target 95%
  campus_coverage_percentage: target 90%
```

---

## 🔍 Manual Testing Procedures

### **Campus Isolation Manual Tests**
1. **Cross-Campus Access Test:**
   - Login as Campus A user
   - Attempt to access Campus B data via URL manipulation
   - Verify 403/404 responses

2. **Campus Admin Boundary Test:**
   - Login as Campus A admin
   - Attempt to modify Campus B users/events
   - Verify permission denial

3. **Super Admin Cross-Campus Test:**
   - Login as super admin
   - Switch between campuses
   - Verify proper data display and access

### **Migration Validation Checklist**
- [ ] All existing SNSU users assigned to correct campus
- [ ] All existing events linked to organizer's campus
- [ ] All attendance records maintain campus context
- [ ] No data loss during migration
- [ ] Migration rollback functions correctly

---

## 📝 Test Documentation Standards

### **Test Case Documentation**
```typescript
/**
 * Campus Isolation Test: Event Access Control
 * 
 * Purpose: Verify users cannot access events from other campuses
 * Campus Context: Multi-campus environment with data isolation
 * Expected Behavior: API returns only user's campus events
 * 
 * @test_category Campus Isolation
 * @priority Critical
 * @campus_context Required
 */
describe('Campus Event Access Control', () => {
  // Test implementation
})
```

### **Test Result Documentation**
```markdown
# Campus Test Results - [Date]

## Summary
- ✅ Campus Isolation Tests: 25/25 passed
- ✅ Authorization Tests: 15/15 passed  
- ⚠️  Performance Tests: 18/20 passed (2 minor issues)
- ✅ Migration Tests: 10/10 passed

## Campus Isolation Results
All cross-campus data access attempts properly blocked.
No data leakage detected across campus boundaries.

## Performance Results
Campus queries within acceptable thresholds.
Minor optimization needed for large dataset queries.
```

---

*📝 This testing strategy ensures the reliability and security of the EAS multi-campus enhancement while maintaining existing functionality.*
