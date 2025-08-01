# Attendance Tracking Models with Campus Context
# apps/attendance/models.py

from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.campus.managers import CampusAwareQuerySet
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
