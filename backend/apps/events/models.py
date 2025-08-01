# Event Management Models with Campus Context
# apps/events/models.py

from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from apps.campus.managers import CampusAwareQuerySet
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
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
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
