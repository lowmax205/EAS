# Campus Models - Foundation of Multi-Campus Architecture
# apps/campus/models.py

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
    address = models.TextField(
        help_text="Full campus address"
    )
    
    phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="Campus contact phone"
    )
    
    email = models.EmailField(
        blank=True,
        help_text="Campus contact email"
    )
    
    # Location for event validation
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        help_text="Campus latitude for GPS validation"
    )
    
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        help_text="Campus longitude for GPS validation"
    )
    
    # Regional settings
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
    
    def get_active_events_count(self):
        """Get count of active events for this campus"""
        return self.events.filter(is_active=True, status='published').count()
    
    def get_total_users_count(self):
        """Get total users count for this campus"""
        return self.users.filter(is_active=True).count()


class CampusConfiguration(models.Model):
    """
    Campus-specific configuration settings
    Separates configuration from core campus data
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
