# User Management Models - Enhanced User with Campus Context
# apps/accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone
from apps.campus.managers import CampusAwareQuerySet
import uuid


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
