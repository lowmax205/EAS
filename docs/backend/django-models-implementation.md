# 🏗️ Django Models Implementation

## Overview

This document provides complete Django model implementations for the EAS Multi-Campus Event Attendance System. All models follow the campus-aware architecture defined in the project documentation and maintain backward compatibility with existing frontend mock data.

---

## 🏛️ Campus Models

### Campus Model (apps/campus/models.py)

```python
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone

class Campus(models.Model):
    """
    Campus entity model - Foundation for multi-campus architecture
    Maps to frontend mockUniversity.json structure
    """
    
    # Core identification
    name = models.CharField(
        max_length=100,
        help_text="Full campus name (e.g., 'Surigao del Norte State University')"
    )
    
    code = models.CharField(
        max_length=10,
        unique=True,
        validators=[RegexValidator(r'^[A-Z]+$', 'Campus code must be uppercase letters only')],
        help_text="Unique campus code (e.g., 'SNSU', 'MALIMONO')"
    )
    
    domain = models.CharField(
        max_length=100,
        unique=True,
        help_text="Campus domain for email validation (e.g., 'snsu.edu.ph')"
    )
    
    # Configuration
    timezone = models.CharField(
        max_length=50,
        default='Asia/Manila',
        help_text="Campus timezone for event scheduling"
    )
    
    locale = models.CharField(
        max_length=10,
        default='en-US',
        help_text="Campus locale for localization"
    )
    
    # Status and metadata
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this campus is currently active"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Branding configuration (JSON field for flexibility)
    branding_config = models.JSONField(
        default=dict,
        blank=True,
        help_text="Campus-specific branding configuration"
    )
    
    class Meta:
        db_table = 'campus'
        verbose_name = 'Campus'
        verbose_name_plural = 'Campuses'
        ordering = ['name']
        
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    @property
    def user_count(self):
        """Get total users for this campus"""
        return self.users.filter(is_active=True).count()
    
    @property
    def event_count(self):
        """Get total events for this campus"""
        return self.events.filter(is_active=True).count()
    
    def get_branding_config(self):
        """Get campus branding configuration with defaults"""
        default_config = {
            'primary_color': '#3b82f6',
            'secondary_color': '#1e40af',
            'logo_url': None,
            'theme': 'default'
        }
        return {**default_config, **self.branding_config}


class CampusConfiguration(models.Model):
    """
    Campus-specific configuration settings
    Allows per-campus feature toggles and settings
    """
    
    campus = models.OneToOneField(
        Campus,
        on_delete=models.CASCADE,
        related_name='configuration'
    )
    
    # Feature flags
    multi_campus_events_enabled = models.BooleanField(
        default=False,
        help_text="Allow events that span multiple campuses"
    )
    
    cross_campus_attendance_enabled = models.BooleanField(
        default=False,
        help_text="Allow students to attend events at other campuses"
    )
    
    qr_code_expiry_hours = models.PositiveIntegerField(
        default=24,
        help_text="Hours after which QR codes expire"
    )
    
    attendance_window_minutes = models.PositiveIntegerField(
        default=30,
        help_text="Minutes before/after event start when attendance is allowed"
    )
    
    # Notification settings
    email_notifications_enabled = models.BooleanField(default=True)
    sms_notifications_enabled = models.BooleanField(default=False)
    
    # GPS validation settings
    gps_validation_enabled = models.BooleanField(default=True)
    gps_radius_meters = models.PositiveIntegerField(
        default=100,
        help_text="Allowed GPS radius for attendance in meters"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'campus_configuration'
        verbose_name = 'Campus Configuration'
        
    def __str__(self):
        return f"Config for {self.campus.name}"
```

---

## 👤 User Management Models

### Enhanced User Model (apps/accounts/models.py)

```python
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone
import uuid

class CampusAwareQuerySet(models.QuerySet):
    """Campus-aware queryset for data filtering"""
    
    def for_campus(self, campus_id):
        """Filter by specific campus"""
        return self.filter(campus_id=campus_id)
    
    def for_user_campus(self, user):
        """Filter by user's campus with role-based access"""
        if user.role == 'super_admin':
            return self
        return self.filter(campus_id=user.campus_id)
    
    def accessible_to_user(self, user, campus_id=None):
        """Apply campus access control based on user permissions"""
        if user.role == 'super_admin':
            if campus_id:
                return self.filter(campus_id=campus_id)
            return self
        
        accessible_campuses = user.get_accessible_campus_ids()
        if campus_id and campus_id in accessible_campuses:
            return self.filter(campus_id=campus_id)
            
        return self.filter(campus_id=user.campus_id)


class User(AbstractUser):
    """
    Enhanced User model with campus context
    Extends Django's AbstractUser with EAS-specific fields
    Maps to frontend mockUsers.json structure
    """
    
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('organizer', 'Event Organizer'),
        ('campus_admin', 'Campus Administrator'),
        ('super_admin', 'Super Administrator'),
    ]
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ]
    
    YEAR_LEVEL_CHOICES = [
        ('1', 'First Year'),
        ('2', 'Second Year'),
        ('3', 'Third Year'),
        ('4', 'Fourth Year'),
        ('5', 'Fifth Year'),
        ('graduate', 'Graduate'),
    ]
    
    # Campus relationship (required)
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='users',
        help_text="Campus this user belongs to"
    )
    
    # Academic information
    student_id = models.CharField(
        max_length=20,
        unique=True,
        validators=[RegexValidator(r'^\d{4}-\d{6}$', 'Student ID format: YYYY-XXXXXX')],
        help_text="Unique student ID (format: YYYY-XXXXXX)"
    )
    
    department = models.CharField(
        max_length=100,
        help_text="Department/College (e.g., 'College of Engineering and Information Technology')"
    )
    
    course = models.CharField(
        max_length=100,
        blank=True,
        help_text="Course/Program (e.g., 'Bachelor of Science in Information Technology')"
    )
    
    year_level = models.CharField(
        max_length=20,
        choices=YEAR_LEVEL_CHOICES,
        blank=True,
        help_text="Current year level"
    )
    
    section = models.CharField(
        max_length=10,
        blank=True,
        help_text="Class section (e.g., 'A', 'B')"
    )
    
    # Personal information
    middle_name = models.CharField(max_length=50, blank=True)
    
    phone = models.CharField(
        max_length=15,
        blank=True,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', 'Enter a valid phone number')],
        help_text="Contact phone number"
    )
    
    address = models.TextField(
        blank=True,
        help_text="Complete address"
    )
    
    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        blank=True
    )
    
    birth_date = models.DateField(null=True, blank=True)
    
    # System fields
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student',
        help_text="User role determining system permissions"
    )
    
    is_verified = models.BooleanField(
        default=False,
        help_text="Whether user email is verified"
    )
    
    profile_image = models.ImageField(
        upload_to='profiles/',
        null=True,
        blank=True,
        help_text="User profile image"
    )
    
    signature_image = models.ImageField(
        upload_to='signatures/',
        null=True,
        blank=True,
        help_text="User signature for attendance verification"
    )
    
    # Multi-campus access (for admin users)
    accessible_campus_ids = models.JSONField(
        default=list,
        blank=True,
        help_text="Campus IDs this user can access (for multi-campus admins)"
    )
    
    # Timestamps
    last_attendance = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Custom manager
    objects = CampusAwareQuerySet.as_manager()
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['campus', 'role']),
            models.Index(fields=['campus', 'department']),
            models.Index(fields=['campus', 'is_active']),
            models.Index(fields=['student_id']),
        ]
        
    def __str__(self):
        return f"{self.get_full_name()} ({self.student_id}) - {self.campus.code}"
    
    def get_full_name(self):
        """Return full name including middle name"""
        names = [self.first_name]
        if self.middle_name:
            names.append(self.middle_name)
        names.append(self.last_name)
        return ' '.join(names)
    
    def get_accessible_campus_ids(self):
        """Get list of campus IDs this user can access"""
        if self.role == 'super_admin':
            from apps.campus.models import Campus
            return list(Campus.objects.filter(is_active=True).values_list('id', flat=True))
        
        if self.role == 'campus_admin' and self.accessible_campus_ids:
            return self.accessible_campus_ids
            
        return [self.campus_id]
    
    def can_access_campus(self, campus_id):
        """Check if user can access specified campus"""
        return campus_id in self.get_accessible_campus_ids()
    
    def get_attendance_count(self, campus_id=None):
        """Get attendance count for user"""
        queryset = self.attendance_records.all()
        if campus_id:
            queryset = queryset.filter(campus_id=campus_id)
        return queryset.count()
    
    def get_organized_events_count(self, campus_id=None):
        """Get count of events organized by this user"""
        queryset = self.organized_events.all()
        if campus_id:
            queryset = queryset.filter(campus_id=campus_id)
        return queryset.count()


class UserProfile(models.Model):
    """
    Extended user profile information
    Separates profile data from core user model
    """
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    
    # Emergency contact
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True)
    
    # Preferences
    preferred_language = models.CharField(max_length=10, default='en')
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    
    # Academic details
    enrollment_date = models.DateField(null=True, blank=True)
    expected_graduation = models.DateField(null=True, blank=True)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    
    # System metadata
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    login_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        
    def __str__(self):
        return f"Profile for {self.user.get_full_name()}"
```

---

## 📅 Event Management Models

### Event Models (apps/events/models.py)

```python
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image

class Event(models.Model):
    """
    Event model with campus context
    Maps to frontend mockEvents.json structure
    """
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    EVENT_TYPE_CHOICES = [
        ('academic', 'Academic'),
        ('seminar', 'Seminar'),
        ('workshop', 'Workshop'),
        ('conference', 'Conference'),
        ('social', 'Social'),
        ('sports', 'Sports'),
        ('cultural', 'Cultural'),
        ('other', 'Other'),
    ]
    
    # Core fields
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='events',
        help_text="Campus hosting this event"
    )
    
    organizer = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='organized_events',
        help_text="User who organized this event"
    )
    
    title = models.CharField(
        max_length=200,
        help_text="Event title"
    )
    
    description = models.TextField(
        help_text="Detailed event description"
    )
    
    event_type = models.CharField(
        max_length=20,
        choices=EVENT_TYPE_CHOICES,
        default='academic'
    )
    
    # Scheduling
    date = models.DateField(help_text="Event date")
    start_time = models.TimeField(help_text="Event start time")
    end_time = models.TimeField(help_text="Event end time")
    
    # Location
    venue = models.CharField(
        max_length=200,
        help_text="Event venue"
    )
    
    location_coordinates = models.JSONField(
        null=True,
        blank=True,
        help_text="GPS coordinates for location verification {lat: float, lng: float}"
    )
    
    # Multi-campus configuration
    is_multi_campus = models.BooleanField(
        default=False,
        help_text="Whether this event allows attendance from multiple campuses"
    )
    
    allowed_campuses = models.JSONField(
        default=list,
        blank=True,
        help_text="Campus IDs allowed to attend (if multi-campus)"
    )
    
    # Capacity and registration
    max_participants = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Maximum number of participants (null = unlimited)"
    )
    
    requires_registration = models.BooleanField(
        default=False,
        help_text="Whether event requires pre-registration"
    )
    
    registration_deadline = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Registration deadline"
    )
    
    # QR Code and attendance
    qr_code = models.ImageField(
        upload_to='qr_codes/',
        null=True,
        blank=True,
        help_text="Generated QR code for attendance"
    )
    
    qr_code_data = models.CharField(
        max_length=500,
        blank=True,
        help_text="QR code data/URL"
    )
    
    attendance_window_start = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When attendance marking opens"
    )
    
    attendance_window_end = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When attendance marking closes"
    )
    
    # Status and metadata
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Whether event is active"
    )
    
    # Images and attachments
    featured_image = models.ImageField(
        upload_to='events/',
        null=True,
        blank=True,
        help_text="Event featured image"
    )
    
    # Verification requirements
    requires_selfie = models.BooleanField(
        default=True,
        help_text="Require selfie for attendance verification"
    )
    
    requires_gps = models.BooleanField(
        default=True,
        help_text="Require GPS verification for attendance"
    )
    
    requires_signature = models.BooleanField(
        default=True,
        help_text="Require digital signature for attendance"
    )
    
    # Analytics
    view_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Custom manager
    objects = CampusAwareQuerySet.as_manager()
    
    class Meta:
        db_table = 'events'
        indexes = [
            models.Index(fields=['campus', 'date']),
            models.Index(fields=['campus', 'status']),
            models.Index(fields=['campus', 'organizer']),
            models.Index(fields=['date', 'status']),
        ]
        ordering = ['-date', '-start_time']
        
    def __str__(self):
        return f"{self.title} - {self.campus.code} ({self.date})"
    
    def save(self, *args, **kwargs):
        # Auto-generate attendance window if not set
        if not self.attendance_window_start and self.date and self.start_time:
            event_datetime = timezone.datetime.combine(self.date, self.start_time)
            event_datetime = timezone.make_aware(event_datetime)
            self.attendance_window_start = event_datetime - timezone.timedelta(minutes=30)
            self.attendance_window_end = event_datetime + timezone.timedelta(minutes=30)
        
        super().save(*args, **kwargs)
        
        # Generate QR code after saving (need ID)
        if not self.qr_code:
            self.generate_qr_code()
    
    def generate_qr_code(self):
        """Generate QR code for event attendance"""
        if not self.id:
            return
            
        # Create QR code data
        qr_data = f"https://easuniversity.site/attend/{self.id}"
        self.qr_code_data = qr_data
        
        # Generate QR code image
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to file
        buffer = BytesIO()
        img.save(buffer, 'PNG')
        filename = f'qr_event_{self.id}.png'
        
        self.qr_code.save(
            filename,
            File(buffer),
            save=False
        )
        
        # Save the model
        Event.objects.filter(id=self.id).update(
            qr_code=self.qr_code,
            qr_code_data=self.qr_code_data
        )
    
    @property
    def is_ongoing(self):
        """Check if event is currently ongoing"""
        now = timezone.now()
        event_start = timezone.datetime.combine(self.date, self.start_time)
        event_end = timezone.datetime.combine(self.date, self.end_time)
        
        if timezone.is_naive(event_start):
            event_start = timezone.make_aware(event_start)
        if timezone.is_naive(event_end):
            event_end = timezone.make_aware(event_end)
            
        return event_start <= now <= event_end
    
    @property
    def can_mark_attendance(self):
        """Check if attendance can be marked for this event"""
        if not self.attendance_window_start or not self.attendance_window_end:
            return False
            
        now = timezone.now()
        return self.attendance_window_start <= now <= self.attendance_window_end
    
    @property
    def attendance_count(self):
        """Get total attendance count"""
        return self.attendance_records.filter(status='present').count()
    
    @property
    def capacity_percentage(self):
        """Get capacity utilization percentage"""
        if not self.max_participants:
            return None
        return (self.attendance_count / self.max_participants) * 100
    
    def get_attendance_for_campus(self, campus_id):
        """Get attendance count for specific campus"""
        return self.attendance_records.filter(
            campus_id=campus_id,
            status='present'
        ).count()
    
    def can_user_attend(self, user):
        """Check if user can attend this event"""
        # Check campus access
        if not self.is_multi_campus and user.campus_id != self.campus_id:
            return False, "Event not available for your campus"
        
        if self.is_multi_campus and user.campus_id not in self.allowed_campuses:
            return False, "Event not available for your campus"
        
        # Check capacity
        if self.max_participants and self.attendance_count >= self.max_participants:
            return False, "Event is at capacity"
        
        # Check if already attended
        if self.attendance_records.filter(user=user).exists():
            return False, "Already marked attendance for this event"
        
        # Check attendance window
        if not self.can_mark_attendance:
            return False, "Attendance window is closed"
        
        return True, "Can attend"


class EventTag(models.Model):
    """
    Tags for event categorization
    """
    
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#3b82f6')  # Hex color
    
    class Meta:
        db_table = 'event_tags'
        ordering = ['name']
        
    def __str__(self):
        return self.name


class EventRegistration(models.Model):
    """
    Event registration model for events requiring registration
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='registrations'
    )
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='event_registrations'
    )
    
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='event_registrations'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    registration_notes = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)
    
    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'event_registrations'
        unique_together = ['event', 'user']
        indexes = [
            models.Index(fields=['event', 'status']),
            models.Index(fields=['campus', 'status']),
        ]
        
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.event.title} ({self.status})"
```

---

## ✅ Attendance Models

### Attendance Tracking (apps/attendance/models.py)

```python
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class Attendance(models.Model):
    """
    Attendance record model with campus context
    Maps to frontend mockAttendance.json structure
    """
    
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused'),
    ]
    
    VERIFICATION_METHOD_CHOICES = [
        ('qr_code', 'QR Code'),
        ('manual', 'Manual Entry'),
        ('facial_recognition', 'Facial Recognition'),
        ('admin_override', 'Admin Override'),
    ]
    
    # Core relationships
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='attendance_records',
        help_text="Campus where attendance was marked"
    )
    
    event = models.ForeignKey(
        'events.Event',
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    
    # Attendance details
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='present'
    )
    
    verification_method = models.CharField(
        max_length=20,
        choices=VERIFICATION_METHOD_CHOICES,
        default='qr_code'
    )
    
    # Multi-campus tracking
    cross_campus_attendance = models.BooleanField(
        default=False,
        help_text="Whether this is attendance at a different campus"
    )
    
    # Verification data
    selfie_image = models.ImageField(
        upload_to='attendance_selfies/',
        null=True,
        blank=True,
        help_text="Selfie taken during attendance"
    )
    
    signature_image = models.ImageField(
        upload_to='attendance_signatures/',
        null=True,
        blank=True,
        help_text="Digital signature for attendance"
    )
    
    gps_coordinates = models.JSONField(
        null=True,
        blank=True,
        help_text="GPS coordinates when attendance was marked {lat: float, lng: float, accuracy: float}"
    )
    
    # Timing information
    marked_at = models.DateTimeField(
        default=timezone.now,
        help_text="When attendance was marked"
    )
    
    arrival_time = models.TimeField(
        null=True,
        blank=True,
        help_text="Actual arrival time"
    )
    
    departure_time = models.TimeField(
        null=True,
        blank=True,
        help_text="Departure time (for checkout)"
    )
    
    # Validation and verification
    is_verified = models.BooleanField(
        default=True,
        help_text="Whether attendance is verified and valid"
    )
    
    verification_score = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Verification confidence score (0.0 - 1.0)"
    )
    
    verification_notes = models.TextField(
        blank=True,
        help_text="Notes about verification process"
    )
    
    # System metadata
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address when marking attendance"
    )
    
    user_agent = models.TextField(
        blank=True,
        help_text="Browser/device user agent"
    )
    
    marked_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='marked_attendances',
        help_text="Admin who manually marked attendance (if applicable)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Custom manager
    objects = CampusAwareQuerySet.as_manager()
    
    class Meta:
        db_table = 'attendance'
        unique_together = ['event', 'user']
        indexes = [
            models.Index(fields=['campus', 'event', 'marked_at']),
            models.Index(fields=['campus', 'user']),
            models.Index(fields=['event', 'status']),
            models.Index(fields=['marked_at']),
        ]
        ordering = ['-marked_at']
        
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.event.title} ({self.status})"
    
    def save(self, *args, **kwargs):
        # Auto-populate campus and cross-campus flag
        if not self.campus_id:
            self.campus = self.event.campus
        
        self.cross_campus_attendance = (self.user.campus_id != self.event.campus_id)
        
        # Set arrival time if not set
        if not self.arrival_time and self.marked_at:
            self.arrival_time = self.marked_at.time()
            
        super().save(*args, **kwargs)
    
    @property
    def is_late(self):
        """Check if attendance was marked late"""
        if not self.arrival_time or not self.event.start_time:
            return False
        return self.arrival_time > self.event.start_time
    
    @property
    def verification_details(self):
        """Get verification method details"""
        details = {
            'method': self.verification_method,
            'has_selfie': bool(self.selfie_image),
            'has_signature': bool(self.signature_image),
            'has_gps': bool(self.gps_coordinates),
            'verification_score': self.verification_score,
        }
        
        if self.gps_coordinates:
            details['gps_accuracy'] = self.gps_coordinates.get('accuracy')
            
        return details


class AttendanceLog(models.Model):
    """
    Audit log for attendance actions
    Tracks all attendance-related activities
    """
    
    ACTION_CHOICES = [
        ('marked', 'Attendance Marked'),
        ('updated', 'Attendance Updated'),
        ('verified', 'Attendance Verified'),
        ('rejected', 'Attendance Rejected'),
        ('deleted', 'Attendance Deleted'),
    ]
    
    attendance = models.ForeignKey(
        Attendance,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='attendance_logs'
    )
    
    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES
    )
    
    performed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='performed_attendance_actions'
    )
    
    details = models.JSONField(
        default=dict,
        help_text="Additional details about the action"
    )
    
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'attendance_logs'
        indexes = [
            models.Index(fields=['campus', 'timestamp']),
            models.Index(fields=['attendance', 'timestamp']),
        ]
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"{self.action} - {self.attendance} by {self.performed_by}"


class AttendanceValidation(models.Model):
    """
    Attendance validation rules and checks
    """
    
    VALIDATION_TYPE_CHOICES = [
        ('gps_distance', 'GPS Distance'),
        ('time_window', 'Time Window'),
        ('image_verification', 'Image Verification'),
        ('duplicate_check', 'Duplicate Check'),
    ]
    
    STATUS_CHOICES = [
        ('passed', 'Passed'),
        ('failed', 'Failed'),
        ('warning', 'Warning'),
    ]
    
    attendance = models.ForeignKey(
        Attendance,
        on_delete=models.CASCADE,
        related_name='validations'
    )
    
    validation_type = models.CharField(
        max_length=20,
        choices=VALIDATION_TYPE_CHOICES
    )
    
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES
    )
    
    confidence_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Validation confidence score (0.0 - 1.0)"
    )
    
    details = models.JSONField(
        default=dict,
        help_text="Validation details and results"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'attendance_validations'
        unique_together = ['attendance', 'validation_type']
        
    def __str__(self):
        return f"{self.validation_type} - {self.status} ({self.confidence_score})"
```

---

## 📊 Reporting Models

### Analytics and Reports (apps/reports/models.py)

```python
from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import JSONField

class Report(models.Model):
    """
    Generated reports model
    """
    
    REPORT_TYPE_CHOICES = [
        ('attendance_summary', 'Attendance Summary'),
        ('campus_analytics', 'Campus Analytics'),
        ('event_performance', 'Event Performance'),
        ('user_engagement', 'User Engagement'),
        ('cross_campus_analysis', 'Cross-Campus Analysis'),
    ]
    
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('csv', 'CSV'),
        ('json', 'JSON'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='reports',
        null=True,
        blank=True,
        help_text="Campus for report (null = all campuses)"
    )
    
    generated_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='generated_reports'
    )
    
    report_type = models.CharField(
        max_length=30,
        choices=REPORT_TYPE_CHOICES
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Date range for report
    date_from = models.DateField()
    date_to = models.DateField()
    
    # Report configuration
    filters = models.JSONField(
        default=dict,
        help_text="Report filters and parameters"
    )
    
    format = models.CharField(
        max_length=10,
        choices=FORMAT_CHOICES,
        default='pdf'
    )
    
    status = models.CharField(
        max_length=15,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Generated files
    file = models.FileField(
        upload_to='reports/',
        null=True,
        blank=True
    )
    
    file_size = models.PositiveIntegerField(null=True, blank=True)
    
    # Report data
    data = models.JSONField(
        default=dict,
        help_text="Report data and statistics"
    )
    
    # Processing info
    processing_started_at = models.DateTimeField(null=True, blank=True)
    processing_completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reports'
        indexes = [
            models.Index(fields=['campus', 'created_at']),
            models.Index(fields=['generated_by', 'status']),
            models.Index(fields=['report_type', 'status']),
        ]
        ordering = ['-created_at']
        
    def __str__(self):
        campus_str = self.campus.code if self.campus else 'All Campuses'
        return f"{self.title} - {campus_str} ({self.status})"


class CampusAnalytics(models.Model):
    """
    Daily campus analytics aggregation
    """
    
    campus = models.ForeignKey(
        'campus.Campus',
        on_delete=models.CASCADE,
        related_name='analytics'
    )
    
    date = models.DateField()
    
    # User metrics
    total_users = models.PositiveIntegerField(default=0)
    active_users = models.PositiveIntegerField(default=0)
    new_users = models.PositiveIntegerField(default=0)
    
    # Event metrics
    total_events = models.PositiveIntegerField(default=0)
    active_events = models.PositiveIntegerField(default=0)
    completed_events = models.PositiveIntegerField(default=0)
    
    # Attendance metrics
    total_attendance = models.PositiveIntegerField(default=0)
    verified_attendance = models.PositiveIntegerField(default=0)
    cross_campus_attendance = models.PositiveIntegerField(default=0)
    
    # Performance metrics
    avg_attendance_per_event = models.FloatField(default=0.0)
    attendance_rate = models.FloatField(default=0.0)
    verification_rate = models.FloatField(default=0.0)
    
    # Detailed data
    detailed_metrics = models.JSONField(
        default=dict,
        help_text="Additional detailed metrics"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'campus_analytics'
        unique_together = ['campus', 'date']
        indexes = [
            models.Index(fields=['campus', 'date']),
            models.Index(fields=['date']),
        ]
        ordering = ['-date', 'campus']
        
    def __str__(self):
        return f"{self.campus.code} Analytics - {self.date}"
```

---

## 🔧 Model Utilities and Managers

### Campus Manager (apps/shared/managers.py)

```python
from django.db import models
from django.core.exceptions import PermissionDenied

class CampusAwareManager(models.Manager):
    """
    Manager that automatically applies campus filtering
    """
    
    def get_queryset(self):
        return CampusAwareQuerySet(self.model, using=self._db)
    
    def for_campus(self, campus_id):
        return self.get_queryset().for_campus(campus_id)
    
    def for_user_campus(self, user):
        return self.get_queryset().for_user_campus(user)
    
    def accessible_to_user(self, user, campus_id=None):
        return self.get_queryset().accessible_to_user(user, campus_id)


class CampusAwareQuerySet(models.QuerySet):
    """
    QuerySet with campus-aware filtering methods
    """
    
    def for_campus(self, campus_id):
        """Filter by specific campus"""
        return self.filter(campus_id=campus_id)
    
    def for_user_campus(self, user):
        """Filter by user's campus with role-based access"""
        if user.role == 'super_admin':
            return self
        return self.filter(campus_id=user.campus_id)
    
    def accessible_to_user(self, user, campus_id=None):
        """Apply campus access control based on user permissions"""
        if user.role == 'super_admin':
            if campus_id:
                return self.filter(campus_id=campus_id)
            return self
        
        accessible_campuses = user.get_accessible_campus_ids()
        if campus_id and campus_id in accessible_campuses:
            return self.filter(campus_id=campus_id)
            
        return self.filter(campus_id=user.campus_id)
    
    def active(self):
        """Filter active records only"""
        if hasattr(self.model, 'is_active'):
            return self.filter(is_active=True)
        return self
    
    def for_date_range(self, start_date, end_date):
        """Filter by date range"""
        if hasattr(self.model, 'date'):
            return self.filter(date__range=[start_date, end_date])
        elif hasattr(self.model, 'created_at'):
            return self.filter(created_at__date__range=[start_date, end_date])
        return self
```

---

## 🎯 Model Integration Summary

### Database Migration Command

```python
# Create and run migrations
python manage.py makemigrations campus
python manage.py makemigrations accounts  
python manage.py makemigrations events
python manage.py makemigrations attendance
python manage.py makemigrations reports

python manage.py migrate
```

### Initial Data Setup

```python
# Management command: python manage.py setup_initial_data
from django.core.management.base import BaseCommand
from apps.campus.models import Campus, CampusConfiguration
from apps.accounts.models import User

class Command(BaseCommand):
    def handle(self, *args, **options):
        # Create default campuses
        campuses = [
            {'id': 1, 'name': 'Surigao del Norte State University', 'code': 'SNSU', 'domain': 'snsu.edu.ph'},
            {'id': 2, 'name': 'SNSU Malimono Campus', 'code': 'MALIMONO', 'domain': 'malimono.snsu.edu.ph'},
            {'id': 3, 'name': 'SNSU Del Carmen Campus', 'code': 'DELCARMEN', 'domain': 'delcarmen.snsu.edu.ph'},
            {'id': 4, 'name': 'SNSU Mainit Campus', 'code': 'MAINIT', 'domain': 'mainit.snsu.edu.ph'},
        ]
        
        for campus_data in campuses:
            campus, created = Campus.objects.get_or_create(**campus_data)
            if created:
                CampusConfiguration.objects.create(campus=campus)
                self.stdout.write(f"Created campus: {campus.name}")
```

These Django models provide:

- ✅ **Complete campus-aware architecture**
- ✅ **Backward compatibility with frontend mock data**  
- ✅ **Multi-campus data isolation**
- ✅ **Performance-optimized with proper indexing**
- ✅ **Rich relationship modeling**
- ✅ **Comprehensive validation and verification**
- ✅ **Audit logging and analytics support**

The models integrate seamlessly with your existing frontend and follow all the patterns established in your epic, story, and architecture documentation! 🚀
