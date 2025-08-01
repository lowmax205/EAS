# 🗄️ Database Schema Design

## Entity Relationship Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Users      │    │      Events     │    │   Attendance    │
│  (CustomUser)   │    │                 │    │   Records       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │────│ organizer_id    │    │ id (PK)         │
│ username        │    │ id (PK)         │────│ event_id (FK)   │
│ email           │    │ title           │    │ student_id (FK) │
│ student_id      │    │ location        │    │ timestamp       │
│ role            │    │ start_datetime  │    │ latitude        │
│ department      │    │ end_datetime    │    │ longitude       │
│ course          │    │ qr_token        │    │ selfie_image    │
│ year_level      │    │ latitude        │    │ is_verified     │
│ campus_id       │    │ longitude       │    │ device_info     │
│ is_verified     │    │ is_active       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │
        │              ┌─────────────────┐
        │              │      Campus     │
        └──────────────│                 │
                       ├─────────────────┤
                       │ id (PK)         │
                       │ name            │
                       │ address         │
                       │ latitude        │
                       │ longitude       │
                       │ timezone        │
                       └─────────────────┘
```

## Core Models & Relationships

### 1. User Management
```python
# apps/authentication/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class Campus(models.Model):
    """University campus information"""
    name = models.CharField(max_length=100, unique=True)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    timezone = models.CharField(max_length=50, default='Asia/Manila')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Campuses"
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.name

class CustomUser(AbstractUser):
    """Extended user model for EAS system"""
    
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('admin', 'Administrator'),
        ('organizer', 'Organizer'),
    ]
    
    # Core identification
    student_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    
    # Academic/Professional info
    department = models.CharField(max_length=100)
    course = models.CharField(max_length=100, null=True, blank=True)
    year_level = models.IntegerField(null=True, blank=True)
    
    # Campus association
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE)
    
    # Profile information
    profile_image = models.URLField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    
    # System fields
    is_verified = models.BooleanField(default=False)
    last_attendance = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['role', 'campus']),
            models.Index(fields=['department']),
            models.Index(fields=['is_verified']),
        ]

    def __str__(self):
        return f"{self.username} ({self.student_id})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
```

### 2. Event Management
```python
# apps/attendance/models.py
import uuid
from django.db import models
from django.conf import settings

class Event(models.Model):
    """Event/session for attendance tracking"""
    
    EVENT_TYPES = [
        ('class', 'Class Session'),
        ('meeting', 'Meeting'),
        ('seminar', 'Seminar'),
        ('workshop', 'Workshop'),
        ('conference', 'Conference'),
    ]
    
    # Basic event information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='class')
    
    # Organizer and location
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    campus = models.ForeignKey('authentication.Campus', on_delete=models.CASCADE)
    location = models.CharField(max_length=200)
    
    # Time scheduling
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    grace_period_minutes = models.IntegerField(default=15)  # Late attendance tolerance
    
    # Geographic validation
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_radius = models.IntegerField(default=100)  # Meters tolerance
    
    # QR system
    qr_token = models.CharField(max_length=100, unique=True)
    qr_expires_at = models.DateTimeField()
    qr_regeneration_count = models.IntegerField(default=0)
    
    # System fields
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['organizer', 'start_datetime']),
            models.Index(fields=['campus', 'is_active']),
            models.Index(fields=['qr_token']),
            models.Index(fields=['start_datetime', 'end_datetime']),
        ]

    def __str__(self):
        return f"{self.title} - {self.start_datetime.strftime('%Y-%m-%d %H:%M')}"

    @property
    def is_ongoing(self):
        from django.utils import timezone
        now = timezone.now()
        return self.start_datetime <= now <= self.end_datetime

    @property
    def allows_late_attendance(self):
        from django.utils import timezone
        from datetime import timedelta
        now = timezone.now()
        grace_deadline = self.end_datetime + timedelta(minutes=self.grace_period_minutes)
        return now <= grace_deadline
```

### 3. Attendance Records
```python
# apps/attendance/models.py (continued)

class AttendanceRecord(models.Model):
    """Individual attendance submission"""
    
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('late', 'Late'),
        ('excused', 'Excused'),
        ('absent', 'Absent'),
    ]
    
    VERIFICATION_STATUS = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
        ('flagged', 'Flagged for Review'),
    ]
    
    # Primary relationships
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Attendance details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='pending')
    
    # Timestamp information
    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Multi-factor verification data
    # Location verification
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_accuracy = models.FloatField()  # GPS accuracy in meters
    location_verified = models.BooleanField(default=False)
    
    # Photo verification (Front AND Back cameras)
    front_photo = models.URLField()  # Front camera selfie
    back_photo = models.URLField()   # Back camera environment photo
    photos_verified = models.BooleanField(default=False)
    face_match_score = models.FloatField(null=True, blank=True)  # ML confidence score
    
    # Digital signature
    signature_image = models.URLField()  # Canvas signature as image
    signature_verified = models.BooleanField(default=False)
    
    # Auto-filled student information
    auto_filled_data = models.JSONField(default=dict)  # Student info from DB
    student_id_displayed = models.CharField(max_length=20)  # ID shown during process
    
    # Device and security information
    device_info = models.JSONField(default=dict)  # Browser, OS, etc.
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    # QR verification
    qr_scan_timestamp = models.DateTimeField()
    qr_token_used = models.CharField(max_length=100)
    
    # Manual override fields
    manually_verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='manual_verifications'
    )
    verification_notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['event', 'student']  # One attendance per student per event
        indexes = [
            models.Index(fields=['event', 'submitted_at']),
            models.Index(fields=['student', 'submitted_at']),
            models.Index(fields=['verification_status']),
            models.Index(fields=['status']),
            models.Index(fields=['qr_token_used']),
        ]

    def __str__(self):
        return f"{self.student.username} - {self.event.title} ({self.status})"

    @property
    def is_fully_verified(self):
        return (
            self.location_verified and 
            self.selfie_verified and 
            self.verification_status == 'verified'
        )

    @property
    def verification_score(self):
        """Calculate overall verification confidence score"""
        score = 0
        if self.location_verified:
            score += 40
        if self.selfie_verified:
            score += 40
        if self.face_match_score:
            score += min(20, self.face_match_score * 20)
        return min(100, score)
```

### 4. QR Code Management
```python
# apps/qr_system/models.py

class QRToken(models.Model):
    """QR code token management and validation"""
    
    token = models.CharField(max_length=100, primary_key=True)
    event = models.ForeignKey('attendance.Event', on_delete=models.CASCADE)
    
    # Token lifecycle
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    # Usage tracking
    usage_count = models.IntegerField(default=0)
    max_usage = models.IntegerField(default=1000)  # Prevent abuse
    
    # Security
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()

    class Meta:
        indexes = [
            models.Index(fields=['token', 'is_active']),
            models.Index(fields=['event', 'expires_at']),
        ]

class QRScanLog(models.Model):
    """Log all QR scan attempts for security monitoring"""
    
    token = models.ForeignKey(QRToken, on_delete=models.CASCADE)
    scanned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        null=True, 
        blank=True
    )
    
    # Scan details
    scanned_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    # Result
    scan_successful = models.BooleanField()
    failure_reason = models.CharField(max_length=100, blank=True)
    
    # Location of scan
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['token', 'scanned_at']),
            models.Index(fields=['scanned_by', 'scanned_at']),
            models.Index(fields=['scan_successful']),
        ]
```

### Analytics & Reporting with Panel-Required Histogram Support

```python
# apps/analytics/models.py

class AttendanceAnalytics(models.Model):
    """Pre-computed analytics for performance with histogram data support"""
    
    # Aggregation scope
    date = models.DateField()
    campus = models.ForeignKey('authentication.Campus', on_delete=models.CASCADE)
    department = models.CharField(max_length=100, null=True, blank=True)
    
    # Metrics
    total_events = models.IntegerField(default=0)
    total_attendees = models.IntegerField(default=0)
    attendance_rate = models.DecimalField(max_digits=5, decimal_places=2)
    
    # Verification metrics
    verified_count = models.IntegerField(default=0)
    pending_count = models.IntegerField(default=0)
    flagged_count = models.IntegerField(default=0)
    
    # Performance metrics
    avg_verification_time = models.DurationField(null=True)
    
    # Panel-required histogram data
    hourly_distribution = models.JSONField(default=dict)  # {hour: count} for histogram
    daily_pattern = models.JSONField(default=dict)       # Weekly pattern data
    verification_time_buckets = models.JSONField(default=dict)  # Time bucket distribution
    
    # System fields
    calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['date', 'campus', 'department']
        indexes = [
            models.Index(fields=['date', 'campus']),
            models.Index(fields=['department', 'date']),
        ]

class HistogramData(models.Model):
    """Dedicated model for histogram chart data as required by panel"""
    
    CHART_TYPES = [
        ('attendance_hourly', 'Hourly Attendance Distribution'),
        ('verification_time', 'Verification Time Distribution'),
        ('department_comparison', 'Department Attendance Comparison'),
        ('weekly_pattern', 'Weekly Attendance Pattern'),
        ('event_popularity', 'Event Popularity Distribution'),
    ]
    
    chart_type = models.CharField(max_length=30, choices=CHART_TYPES)
    date_range_start = models.DateField()
    date_range_end = models.DateField()
    campus = models.ForeignKey('authentication.Campus', on_delete=models.CASCADE)
    
    # Histogram data structure
    bins = models.JSONField()  # Array of bin edges
    values = models.JSONField()  # Array of values for each bin
    labels = models.JSONField(default=list)  # Optional labels for bins
    
    # Metadata
    total_samples = models.IntegerField()
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['chart_type', 'date_range_start', 'date_range_end', 'campus']

class SystemAuditLog(models.Model):
    """System audit trail for security and compliance"""
    
    ACTION_TYPES = [
        ('login', 'User Login'),
        ('logout', 'User Logout'),
        ('attendance_submit', 'Attendance Submitted'),
        ('attendance_verify', 'Attendance Verified'),
        ('qr_generate', 'QR Code Generated'),
        ('user_create', 'User Created'),
        ('event_create', 'Event Created'),
        ('report_generate', 'Report Generated'),
    ]
    
    # Core audit fields
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    action = models.CharField(max_length=50, choices=ACTION_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Context information
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    session_id = models.CharField(max_length=100, null=True)
    
    # Action details
    object_type = models.CharField(max_length=50, null=True)  # Model name
    object_id = models.CharField(max_length=100, null=True)  # Object ID
    details = models.JSONField(default=dict)  # Additional context
    
    # Result
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['success']),
        ]
```

## Database Optimization Strategy

### 1. Index Optimization
```sql
-- High-performance indexes for common queries
CREATE INDEX CONCURRENTLY idx_attendance_event_submitted 
ON attendance_attendancerecord(event_id, submitted_at DESC);

CREATE INDEX CONCURRENTLY idx_user_role_campus 
ON authentication_customuser(role, campus_id) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_event_active_time 
ON attendance_event(is_active, start_datetime, end_datetime) 
WHERE is_active = true;

-- Partial indexes for performance
CREATE INDEX CONCURRENTLY idx_attendance_pending 
ON attendance_attendancerecord(verification_status, submitted_at) 
WHERE verification_status = 'pending';
```

### 2. Query Optimization Patterns
```python
# Efficient attendance queries
def get_event_attendance_summary(event_id):
    return AttendanceRecord.objects.filter(
        event_id=event_id
    ).select_related(
        'student', 'event'
    ).prefetch_related(
        'student__campus'
    ).values(
        'status'
    ).annotate(
        count=Count('id')
    )

# Dashboard analytics with caching
@cache_page(300)  # 5-minute cache
def get_dashboard_metrics(campus_id, date_range):
    return AttendanceAnalytics.objects.filter(
        campus_id=campus_id,
        date__range=date_range
    ).aggregate(
        total_events=Sum('total_events'),
        avg_attendance_rate=Avg('attendance_rate'),
        total_attendees=Sum('total_attendees')
    )
```

### 3. Data Retention & Archival
```python
# Data retention policy
RETENTION_POLICIES = {
    'attendance_records': 7 * 365,  # 7 years
    'qr_scan_logs': 2 * 365,       # 2 years
    'audit_logs': 5 * 365,         # 5 years
    'analytics': 3 * 365,          # 3 years
}

# Archival strategy
def archive_old_records():
    from datetime import datetime, timedelta
    
    for model, days in RETENTION_POLICIES.items():
        cutoff_date = datetime.now() - timedelta(days=days)
        # Move to archive tables or cold storage
```

### 4. Migration Strategy
```python
# Custom migration for large datasets
class Migration(migrations.Migration):
    
    def migrate_attendance_data(apps, schema_editor):
        # Batch processing for large migrations
        AttendanceRecord = apps.get_model('attendance', 'AttendanceRecord')
        
        batch_size = 1000
        for i in range(0, AttendanceRecord.objects.count(), batch_size):
            batch = AttendanceRecord.objects.all()[i:i+batch_size]
            # Process batch
            
    operations = [
        migrations.RunPython(migrate_attendance_data),
    ]
```

## Performance Considerations

### 1. Read Replicas for Analytics
- Separate read replicas for reporting queries
- Master-slave replication for real-time analytics
- Connection pooling for high concurrency

### 2. Caching Strategy
- Redis for session data and QR tokens
- Memcached for query result caching
- Application-level caching for dashboard metrics

### 3. Horizontal Scaling
- Partitioning attendance records by date
- Campus-based database sharding
- Separate databases for audit logs

---

**Document Status:** ✅ COMPLETE - Ready for Implementation  
**Next Phase:** API Integration Patterns  
**Priority:** CRITICAL - Database Foundation Ready