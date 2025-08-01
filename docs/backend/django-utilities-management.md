# 🛠️ Django Utilities and Management Commands

## Overview

This document provides comprehensive Django utilities, management commands, data migration scripts, and system administration tools for the EAS Multi-Campus Event Attendance System.

---

## 📁 Directory Structure

```
backend/
├── utils/
│   ├── __init__.py
│   ├── campus_utils.py          # Campus-related utilities
│   ├── validation_utils.py      # Data validation utilities
│   ├── file_utils.py           # File processing utilities
│   ├── notification_utils.py   # Notification utilities
│   ├── analytics_utils.py      # Analytics utilities
│   └── security_utils.py       # Security utilities
├── management/
│   └── commands/
│       ├── setup_initial_data.py    # Initial system setup
│       ├── migrate_campus_data.py   # Campus data migration
│       ├── verify_data_isolation.py # Data isolation verification
│       ├── generate_test_data.py    # Test data generation
│       ├── cleanup_old_data.py      # Data cleanup
│       ├── backup_campus_data.py    # Campus-specific backups
│       ├── sync_user_permissions.py # Permission synchronization
│       └── analytics_processor.py   # Analytics processing
└── middleware/
    ├── __init__.py
    ├── campus_middleware.py     # Campus context middleware
    ├── security_middleware.py  # Security enhancements
    └── analytics_middleware.py # Request analytics
```

---

## 🛠️ Core Utilities

### Campus Utilities (utils/campus_utils.py)

```python
from django.db.models import Q, Count
from django.core.cache import cache
from django.conf import settings
from apps.campus.models import Campus, CampusConfiguration
from apps.accounts.models import User
import json
import logging

logger = logging.getLogger(__name__)

class CampusDataManager:
    """
    Utility class for campus data management and validation
    """
    
    @staticmethod
    def get_user_accessible_campuses(user):
        """Get all campuses accessible to user based on role"""
        if not user or not user.is_authenticated:
            return Campus.objects.none()
        
        if user.role in ['super_admin']:
            return Campus.objects.filter(is_active=True)
        elif user.role in ['admin']:
            # Admins can access their campus and any campuses they're explicitly granted access to
            accessible_campus_ids = [user.campus_id]
            if hasattr(user, 'additional_campus_access'):
                accessible_campus_ids.extend(user.additional_campus_access.values_list('id', flat=True))
            return Campus.objects.filter(id__in=accessible_campus_ids, is_active=True)
        else:
            # Regular users can only access their own campus
            return Campus.objects.filter(id=user.campus_id, is_active=True)
    
    @staticmethod
    def validate_campus_isolation(campus_id):
        """Validate data isolation for a specific campus"""
        violations = []
        
        # Check users
        cross_campus_users = User.objects.filter(campus_id=campus_id).exclude(
            Q(organized_events__campus_id=campus_id) | 
            Q(organized_events__is_multi_campus=True) |
            Q(organized_events__isnull=True)
        ).distinct()
        
        if cross_campus_users.exists():
            violations.append({
                'type': 'user_cross_campus_events',
                'count': cross_campus_users.count(),
                'user_ids': list(cross_campus_users.values_list('id', flat=True))
            })
        
        # Check attendance records
        from apps.attendance.models import Attendance
        cross_campus_attendance = Attendance.objects.filter(
            user__campus_id=campus_id
        ).exclude(
            Q(campus_id=campus_id) | Q(cross_campus_attendance=True)
        )
        
        if cross_campus_attendance.exists():
            violations.append({
                'type': 'cross_campus_attendance_without_flag',
                'count': cross_campus_attendance.count(),
                'attendance_ids': list(cross_campus_attendance.values_list('id', flat=True))
            })
        
        return {
            'campus_id': campus_id,
            'is_isolated': len(violations) == 0,
            'violations': violations,
            'checked_at': timezone.now().isoformat()
        }
    
    @staticmethod
    def get_campus_hierarchy():
        """Get campus hierarchy with parent-child relationships"""
        campuses = Campus.objects.filter(is_active=True).select_related('parent_campus')
        
        hierarchy = {}
        for campus in campuses:
            if campus.parent_campus_id:
                if campus.parent_campus_id not in hierarchy:
                    hierarchy[campus.parent_campus_id] = {'children': []}
                hierarchy[campus.parent_campus_id]['children'].append({
                    'id': campus.id,
                    'name': campus.name,
                    'code': campus.code
                })
            else:
                if campus.id not in hierarchy:
                    hierarchy[campus.id] = {'children': []}
                hierarchy[campus.id].update({
                    'id': campus.id,
                    'name': campus.name,
                    'code': campus.code,
                    'is_root': True
                })
        
        return hierarchy
    
    @staticmethod
    def sync_campus_configurations():
        """Ensure all active campuses have configurations"""
        campuses_without_config = Campus.objects.filter(
            is_active=True,
            configuration__isnull=True
        )
        
        created_configs = []
        for campus in campuses_without_config:
            config = CampusConfiguration.objects.create(
                campus=campus,
                timezone=settings.TIME_ZONE,
                gps_radius_meters=100,
                attendance_window_minutes=30,
                require_photo_verification=True,
                require_signature=False,
                allow_cross_campus_attendance=True
            )
            created_configs.append(config.id)
        
        logger.info(f"Created configurations for {len(created_configs)} campuses")
        return created_configs


class CampusDataMigrator:
    """
    Utility for migrating data between campuses or during campus restructuring
    """
    
    def __init__(self, source_campus_id, target_campus_id, user):
        self.source_campus_id = source_campus_id
        self.target_campus_id = target_campus_id
        self.user = user
        self.migration_log = []
    
    def migrate_users(self, user_ids=None, dry_run=True):
        """Migrate users from source to target campus"""
        users_qs = User.objects.filter(campus_id=self.source_campus_id)
        
        if user_ids:
            users_qs = users_qs.filter(id__in=user_ids)
        
        if dry_run:
            return {
                'users_to_migrate': users_qs.count(),
                'user_details': list(users_qs.values('id', 'email', 'first_name', 'last_name', 'role'))
            }
        
        # Actual migration
        updated_count = 0
        for user in users_qs:
            old_campus_id = user.campus_id
            user.campus_id = self.target_campus_id
            user.save()
            
            self.migration_log.append({
                'type': 'user_migrated',
                'user_id': user.id,
                'from_campus': old_campus_id,
                'to_campus': self.target_campus_id,
                'timestamp': timezone.now()
            })
            updated_count += 1
        
        return {
            'migrated_users': updated_count,
            'migration_log': self.migration_log
        }
    
    def migrate_events(self, event_ids=None, dry_run=True):
        """Migrate events from source to target campus"""
        from apps.events.models import Event
        
        events_qs = Event.objects.filter(campus_id=self.source_campus_id)
        
        if event_ids:
            events_qs = events_qs.filter(id__in=event_ids)
        
        if dry_run:
            return {
                'events_to_migrate': events_qs.count(),
                'event_details': list(events_qs.values('id', 'title', 'date', 'status', 'organizer__email'))
            }
        
        # Actual migration
        updated_count = 0
        for event in events_qs:
            old_campus_id = event.campus_id
            event.campus_id = self.target_campus_id
            event.save()
            
            # Update related attendance records
            event.attendance_records.update(campus_id=self.target_campus_id)
            
            self.migration_log.append({
                'type': 'event_migrated',
                'event_id': event.id,
                'from_campus': old_campus_id,
                'to_campus': self.target_campus_id,
                'attendance_records_updated': event.attendance_records.count(),
                'timestamp': timezone.now()
            })
            updated_count += 1
        
        return {
            'migrated_events': updated_count,
            'migration_log': self.migration_log
        }
```

### Validation Utilities (utils/validation_utils.py)

```python
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.conf import settings
import re
import json
from datetime import datetime, timedelta

class DataValidator:
    """
    Comprehensive data validation utilities
    """
    
    @staticmethod
    def validate_campus_code(code):
        """Validate campus code format"""
        if not code:
            raise ValidationError("Campus code is required")
        
        # Campus code should be 3-6 uppercase letters/numbers
        if not re.match(r'^[A-Z0-9]{3,6}$', code):
            raise ValidationError("Campus code must be 3-6 uppercase letters/numbers")
        
        return code.upper()
    
    @staticmethod
    def validate_gps_coordinates(coordinates):
        """Validate GPS coordinates format and range"""
        if not isinstance(coordinates, dict):
            raise ValidationError("GPS coordinates must be a dictionary")
        
        required_fields = ['lat', 'lng']
        for field in required_fields:
            if field not in coordinates:
                raise ValidationError(f"GPS coordinates missing required field: {field}")
        
        try:
            lat = float(coordinates['lat'])
            lng = float(coordinates['lng'])
        except (ValueError, TypeError):
            raise ValidationError("GPS coordinates must be valid numbers")
        
        # Validate latitude range
        if not (-90 <= lat <= 90):
            raise ValidationError("Latitude must be between -90 and 90")
        
        # Validate longitude range
        if not (-180 <= lng <= 180):
            raise ValidationError("Longitude must be between -180 and 180")
        
        # Optional accuracy field
        if 'accuracy' in coordinates:
            try:
                accuracy = float(coordinates['accuracy'])
                if accuracy < 0:
                    raise ValidationError("GPS accuracy must be positive")
            except (ValueError, TypeError):
                raise ValidationError("GPS accuracy must be a valid number")
        
        return coordinates
    
    @staticmethod
    def validate_event_datetime_range(date, start_time, end_time):
        """Validate event date and time range"""
        if not date:
            raise ValidationError("Event date is required")
        
        if not start_time or not end_time:
            raise ValidationError("Event start and end times are required")
        
        # Check if date is not in the past (allow today)
        if date < timezone.now().date():
            raise ValidationError("Event date cannot be in the past")
        
        # Check if end time is after start time
        if end_time <= start_time:
            raise ValidationError("Event end time must be after start time")
        
        # Check maximum event duration (e.g., 24 hours)
        event_start = timezone.datetime.combine(date, start_time)
        event_end = timezone.datetime.combine(date, end_time)
        
        duration = event_end - event_start
        if duration > timedelta(hours=24):
            raise ValidationError("Event duration cannot exceed 24 hours")
        
        return True
    
    @staticmethod
    def validate_user_role_permissions(user, action, resource_type, resource_campus_id=None):
        """Validate user permissions for specific actions"""
        if not user or not user.is_authenticated:
            raise ValidationError("Authentication required")
        
        # Super admin can do everything
        if user.role == 'super_admin':
            return True
        
        # Campus admin permissions
        if user.role == 'admin':
            if action in ['create', 'update', 'delete'] and resource_type in ['event', 'user', 'campus_config']:
                # Admin can only manage resources in their campus
                if resource_campus_id and resource_campus_id != user.campus_id:
                    accessible_campuses = user.get_accessible_campus_ids()
                    if resource_campus_id not in accessible_campuses:
                        raise ValidationError("Insufficient permissions for this campus")
                return True
        
        # Organizer permissions
        if user.role == 'organizer':
            if action in ['create', 'update'] and resource_type == 'event':
                return True
            elif action == 'delete' and resource_type == 'event':
                # Can only delete their own events
                return True  # Further validation should be done at model level
        
        # Student permissions
        if user.role == 'student':
            if action == 'read' and resource_type in ['event', 'attendance']:
                return True
            elif action in ['create', 'update'] and resource_type == 'attendance':
                return True
        
        raise ValidationError(f"Insufficient permissions for action '{action}' on '{resource_type}'")
    
    @staticmethod
    def validate_attendance_data(attendance_data):
        """Validate attendance record data"""
        required_fields = ['event_id', 'user_id']
        
        for field in required_fields:
            if field not in attendance_data:
                raise ValidationError(f"Missing required field: {field}")
        
        # Validate GPS coordinates if provided
        if 'gps_coordinates' in attendance_data:
            DataValidator.validate_gps_coordinates(attendance_data['gps_coordinates'])
        
        # Validate selfie image if provided
        if 'selfie_image' in attendance_data:
            DataValidator.validate_image_file(attendance_data['selfie_image'])
        
        # Validate signature if provided
        if 'signature_image' in attendance_data:
            DataValidator.validate_image_file(attendance_data['signature_image'])
        
        return True
    
    @staticmethod
    def validate_image_file(image_file):
        """Validate uploaded image file"""
        if not image_file:
            return True
        
        # Check file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if image_file.size > max_size:
            raise ValidationError("Image file size cannot exceed 5MB")
        
        # Check file type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if hasattr(image_file, 'content_type'):
            if image_file.content_type not in allowed_types:
                raise ValidationError("Only JPEG, PNG, and WebP images are allowed")
        
        # Check filename extension
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
        if hasattr(image_file, 'name'):
            extension = image_file.name.lower().split('.')[-1]
            if f'.{extension}' not in allowed_extensions:
                raise ValidationError("Invalid image file extension")
        
        return True


class BusinessRuleValidator:
    """
    Business logic validation utilities
    """
    
    @staticmethod
    def validate_event_capacity_limits(event, current_attendance_count):
        """Validate event capacity constraints"""
        if not event.max_attendees:
            return True  # No capacity limit set
        
        if current_attendance_count >= event.max_attendees:
            raise ValidationError("Event has reached maximum capacity")
        
        # Check if there's a waiting list limit
        if hasattr(event, 'max_waiting_list') and event.max_waiting_list:
            total_registrations = current_attendance_count  # You might want to add waiting list count
            if total_registrations >= (event.max_attendees + event.max_waiting_list):
                raise ValidationError("Event and waiting list are both full")
        
        return True
    
    @staticmethod
    def validate_attendance_window(event, current_time=None):
        """Validate if current time is within attendance window"""
        current_time = current_time or timezone.now()
        
        # Get campus configuration for attendance window
        campus_config = event.campus.configuration if hasattr(event.campus, 'configuration') else None
        window_minutes = campus_config.attendance_window_minutes if campus_config else 30
        
        event_start = timezone.datetime.combine(event.date, event.start_time)
        event_end = timezone.datetime.combine(event.date, event.end_time)
        
        if timezone.is_naive(event_start):
            event_start = timezone.make_aware(event_start)
        if timezone.is_naive(event_end):
            event_end = timezone.make_aware(event_end)
        
        window_start = event_start - timedelta(minutes=window_minutes)
        window_end = event_end + timedelta(minutes=window_minutes)
        
        if not (window_start <= current_time <= window_end):
            raise ValidationError(
                f"Attendance can only be marked between {window_start.strftime('%H:%M')} "
                f"and {window_end.strftime('%H:%M')}"
            )
        
        return True
    
    @staticmethod
    def validate_cross_campus_attendance(user, event):
        """Validate cross-campus attendance permissions"""
        if user.campus_id == event.campus_id:
            return True  # Same campus, no cross-campus validation needed
        
        if not event.is_multi_campus:
            # Check if cross-campus attendance is allowed
            user_campus_config = user.campus.configuration if hasattr(user.campus, 'configuration') else None
            event_campus_config = event.campus.configuration if hasattr(event.campus, 'configuration') else None
            
            user_allows = user_campus_config.allow_cross_campus_attendance if user_campus_config else False
            event_allows = event_campus_config.allow_cross_campus_attendance if event_campus_config else False
            
            if not (user_allows and event_allows):
                raise ValidationError("Cross-campus attendance not allowed for this event")
        
        return True
```

---

## 🔧 Management Commands

### Initial Data Setup (management/commands/setup_initial_data.py)

```python
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.campus.models import Campus, CampusConfiguration
from apps.events.models import EventType
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Setup initial data for EAS system'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--campus-data',
            type=str,
            help='JSON file path containing campus data'
        )
        parser.add_argument(
            '--create-superuser',
            action='store_true',
            help='Create initial superuser'
        )
        parser.add_argument(
            '--setup-event-types',
            action='store_true',
            help='Setup default event types'
        )
    
    def handle(self, *args, **options):
        self.stdout.write("Setting up initial EAS system data...")
        
        if options['setup_event_types']:
            self.setup_event_types()
        
        if options['campus_data']:
            self.setup_campuses_from_file(options['campus_data'])
        else:
            self.setup_default_campuses()
        
        if options['create_superuser']:
            self.create_initial_superuser()
        
        self.stdout.write(
            self.style.SUCCESS('Initial data setup completed successfully!')
        )
    
    def setup_event_types(self):
        """Setup default event types"""
        default_event_types = [
            {
                'name': 'Lecture',
                'description': 'Academic lectures and presentations',
                'color': '#2563eb',
                'requires_attendance': True
            },
            {
                'name': 'Workshop',
                'description': 'Hands-on workshops and training sessions',
                'color': '#dc2626',
                'requires_attendance': True
            },
            {
                'name': 'Seminar',
                'description': 'Seminars and discussion sessions',
                'color': '#059669',
                'requires_attendance': True
            },
            {
                'name': 'Conference',
                'description': 'Conferences and large gatherings',
                'color': '#7c3aed',
                'requires_attendance': False
            },
            {
                'name': 'Meeting',
                'description': 'Meetings and committee sessions',
                'color': '#ea580c',
                'requires_attendance': True
            },
            {
                'name': 'Exam',
                'description': 'Examinations and assessments',
                'color': '#be123c',
                'requires_attendance': True
            }
        ]
        
        created_count = 0
        for event_type_data in default_event_types:
            event_type, created = EventType.objects.get_or_create(
                name=event_type_data['name'],
                defaults={
                    'description': event_type_data['description'],
                    'color': event_type_data['color'],
                    'requires_attendance': event_type_data['requires_attendance'],
                    'is_active': True
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created event type: {event_type.name}")
        
        self.stdout.write(
            self.style.SUCCESS(f'Created {created_count} event types')
        )
    
    def setup_default_campuses(self):
        """Setup default campus structure"""
        default_campuses = [
            {
                'name': 'Main Campus',
                'code': 'MAIN',
                'address': 'Main Campus Address',
                'location_coordinates': {'lat': 0.0, 'lng': 0.0},
                'timezone': 'UTC',
                'is_active': True
            },
            {
                'name': 'North Campus',
                'code': 'NORTH',
                'address': 'North Campus Address',
                'location_coordinates': {'lat': 0.1, 'lng': 0.1},
                'timezone': 'UTC',
                'is_active': True
            },
            {
                'name': 'South Campus',
                'code': 'SOUTH',
                'address': 'South Campus Address',
                'location_coordinates': {'lat': -0.1, 'lng': -0.1},
                'timezone': 'UTC',
                'is_active': True
            }
        ]
        
        created_count = 0
        for campus_data in default_campuses:
            campus, created = Campus.objects.get_or_create(
                code=campus_data['code'],
                defaults=campus_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(f"Created campus: {campus.name} ({campus.code})")
                
                # Create campus configuration
                CampusConfiguration.objects.create(
                    campus=campus,
                    timezone=campus_data['timezone'],
                    gps_radius_meters=100,
                    attendance_window_minutes=30,
                    require_photo_verification=True,
                    require_signature=False,
                    allow_cross_campus_attendance=True
                )
                self.stdout.write(f"Created configuration for {campus.name}")
        
        self.stdout.write(
            self.style.SUCCESS(f'Created {created_count} campuses')
        )
    
    def setup_campuses_from_file(self, file_path):
        """Setup campuses from JSON file"""
        try:
            with open(file_path, 'r') as f:
                campuses_data = json.load(f)
            
            created_count = 0
            for campus_data in campuses_data:
                campus, created = Campus.objects.get_or_create(
                    code=campus_data['code'],
                    defaults=campus_data
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(f"Created campus: {campus.name} ({campus.code})")
                    
                    # Create campus configuration
                    config_data = campus_data.get('configuration', {})
                    CampusConfiguration.objects.create(
                        campus=campus,
                        timezone=config_data.get('timezone', 'UTC'),
                        gps_radius_meters=config_data.get('gps_radius_meters', 100),
                        attendance_window_minutes=config_data.get('attendance_window_minutes', 30),
                        require_photo_verification=config_data.get('require_photo_verification', True),
                        require_signature=config_data.get('require_signature', False),
                        allow_cross_campus_attendance=config_data.get('allow_cross_campus_attendance', True)
                    )
            
            self.stdout.write(
                self.style.SUCCESS(f'Created {created_count} campuses from file')
            )
            
        except FileNotFoundError:
            self.stdout.write(
                self.style.ERROR(f'Campus data file not found: {file_path}')
            )
        except json.JSONDecodeError as e:
            self.stdout.write(
                self.style.ERROR(f'Invalid JSON in campus data file: {e}')
            )
    
    def create_initial_superuser(self):
        """Create initial superuser"""
        if User.objects.filter(role='super_admin').exists():
            self.stdout.write('Superuser already exists, skipping creation')
            return
        
        # Get the main campus
        main_campus = Campus.objects.filter(code='MAIN').first()
        if not main_campus:
            main_campus = Campus.objects.first()
        
        if not main_campus:
            self.stdout.write(
                self.style.ERROR('No campus found. Please create campuses first.')
            )
            return
        
        superuser = User.objects.create_user(
            email='admin@eas.system',
            password='admin123',  # Change this in production
            first_name='System',
            last_name='Administrator',
            role='super_admin',
            campus=main_campus,
            is_verified=True,
            is_staff=True,
            is_superuser=True
        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Created superuser: {superuser.email} (password: admin123)\n'
                'Please change the password immediately!'
            )
        )
```

### Data Isolation Verification (management/commands/verify_data_isolation.py)

```python
from django.core.management.base import BaseCommand
from django.db.models import Q, Count
from apps.campus.models import Campus
from apps.accounts.models import User
from apps.events.models import Event
from apps.attendance.models import Attendance
import json

class Command(BaseCommand):
    help = 'Verify data isolation across campuses'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--campus-id',
            type=int,
            help='Verify specific campus (default: all campuses)'
        )
        parser.add_argument(
            '--fix-violations',
            action='store_true',
            help='Attempt to fix isolation violations'
        )
        parser.add_argument(
            '--output-file',
            type=str,
            help='Output results to JSON file'
        )
    
    def handle(self, *args, **options):
        self.stdout.write("Starting data isolation verification...")
        
        if options['campus_id']:
            campuses = Campus.objects.filter(id=options['campus_id'], is_active=True)
        else:
            campuses = Campus.objects.filter(is_active=True)
        
        if not campuses.exists():
            self.stdout.write(self.style.ERROR('No campuses found'))
            return
        
        results = {
            'verification_timestamp': timezone.now().isoformat(),
            'campuses_checked': campuses.count(),
            'campus_results': [],
            'summary': {
                'total_violations': 0,
                'campuses_with_violations': 0,
                'violations_fixed': 0
            }
        }
        
        for campus in campuses:
            self.stdout.write(f"Checking campus: {campus.name} ({campus.code})")
            campus_result = self.verify_campus_isolation(campus, options['fix_violations'])
            results['campus_results'].append(campus_result)
            
            if campus_result['violations']:
                results['summary']['total_violations'] += len(campus_result['violations'])
                results['summary']['campuses_with_violations'] += 1
                results['summary']['violations_fixed'] += campus_result['violations_fixed']
        
        # Output results
        self.display_results(results)
        
        if options['output_file']:
            self.save_results_to_file(results, options['output_file'])
        
        if results['summary']['total_violations'] == 0:
            self.stdout.write(
                self.style.SUCCESS('✅ All campuses pass data isolation verification!')
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    f'⚠️  Found {results["summary"]["total_violations"]} violations '
                    f'across {results["summary"]["campuses_with_violations"]} campuses'
                )
            )
    
    def verify_campus_isolation(self, campus, fix_violations=False):
        """Verify data isolation for a specific campus"""
        violations = []
        violations_fixed = 0
        
        # Check 1: Users with events in other campuses (non-multi-campus)
        cross_campus_events = Event.objects.filter(
            organizer__campus_id=campus.id,
            is_multi_campus=False
        ).exclude(campus_id=campus.id)
        
        if cross_campus_events.exists():
            violation = {
                'type': 'users_with_cross_campus_events',
                'description': 'Users organizing events in other campuses without multi-campus flag',
                'count': cross_campus_events.count(),
                'details': list(cross_campus_events.values(
                    'id', 'title', 'organizer__email', 'campus__name'
                ))
            }
            violations.append(violation)
            
            if fix_violations:
                # Fix by marking as multi-campus or moving to correct campus
                for event in cross_campus_events:
                    event.campus_id = campus.id
                    event.save()
                    violations_fixed += 1
                violation['fixed'] = True
        
        # Check 2: Attendance records without proper campus association
        cross_campus_attendance = Attendance.objects.filter(
            user__campus_id=campus.id
        ).exclude(
            Q(campus_id=campus.id) | Q(cross_campus_attendance=True)
        )
        
        if cross_campus_attendance.exists():
            violation = {
                'type': 'cross_campus_attendance_without_flag',
                'description': 'Attendance records in other campuses without cross-campus flag',
                'count': cross_campus_attendance.count(),
                'details': list(cross_campus_attendance.values(
                    'id', 'user__email', 'event__title', 'campus__name'
                ))
            }
            violations.append(violation)
            
            if fix_violations:
                # Fix by setting cross_campus_attendance flag
                cross_campus_attendance.update(cross_campus_attendance=True)
                violations_fixed += cross_campus_attendance.count()
                violation['fixed'] = True
        
        # Check 3: Users with incorrect campus assignments
        users_with_wrong_events = User.objects.filter(
            campus_id=campus.id,
            organized_events__campus_id__isnull=False
        ).exclude(
            Q(organized_events__campus_id=campus.id) | 
            Q(organized_events__is_multi_campus=True)
        ).distinct()
        
        if users_with_wrong_events.exists():
            violation = {
                'type': 'users_with_wrong_campus_events',
                'description': 'Users assigned to wrong campus based on their events',
                'count': users_with_wrong_events.count(),
                'details': list(users_with_wrong_events.values(
                    'id', 'email', 'first_name', 'last_name'
                ))
            }
            violations.append(violation)
            
            # This requires manual review, don't auto-fix
        
        # Check 4: Events with attendees from wrong campus
        events_with_wrong_attendees = Event.objects.filter(
            campus_id=campus.id,
            is_multi_campus=False,
            attendance_records__user__campus_id__isnull=False
        ).exclude(
            attendance_records__user__campus_id=campus.id
        ).distinct()
        
        if events_with_wrong_attendees.exists():
            violation = {
                'type': 'events_with_cross_campus_attendees',
                'description': 'Non-multi-campus events with attendees from other campuses',
                'count': events_with_wrong_attendees.count(),
                'details': list(events_with_wrong_attendees.values(
                    'id', 'title', 'date', 'organizer__email'
                ))
            }
            violations.append(violation)
            
            if fix_violations:
                # Fix by marking events as multi-campus
                events_with_wrong_attendees.update(is_multi_campus=True)
                violations_fixed += events_with_wrong_attendees.count()
                violation['fixed'] = True
        
        return {
            'campus_id': campus.id,
            'campus_name': campus.name,
            'campus_code': campus.code,
            'violations': violations,
            'violations_fixed': violations_fixed,
            'is_isolated': len(violations) == 0
        }
    
    def display_results(self, results):
        """Display verification results"""
        self.stdout.write("\n" + "="*60)
        self.stdout.write("DATA ISOLATION VERIFICATION RESULTS")
        self.stdout.write("="*60)
        
        summary = results['summary']
        self.stdout.write(f"Campuses checked: {results['campuses_checked']}")
        self.stdout.write(f"Total violations: {summary['total_violations']}")
        self.stdout.write(f"Campuses with violations: {summary['campuses_with_violations']}")
        
        if summary['violations_fixed'] > 0:
            self.stdout.write(f"Violations fixed: {summary['violations_fixed']}")
        
        self.stdout.write("\nDETAILED RESULTS:")
        self.stdout.write("-" * 40)
        
        for campus_result in results['campus_results']:
            campus_name = f"{campus_result['campus_name']} ({campus_result['campus_code']})"
            
            if campus_result['is_isolated']:
                self.stdout.write(
                    self.style.SUCCESS(f"✅ {campus_name}: PASSED")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"⚠️  {campus_name}: {len(campus_result['violations'])} violations")
                )
                
                for violation in campus_result['violations']:
                    status = " [FIXED]" if violation.get('fixed') else ""
                    self.stdout.write(f"   - {violation['description']}: {violation['count']} items{status}")
    
    def save_results_to_file(self, results, file_path):
        """Save results to JSON file"""
        try:
            with open(file_path, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            self.stdout.write(
                self.style.SUCCESS(f"Results saved to: {file_path}")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Failed to save results: {e}")
            )
```

### Test Data Generation (management/commands/generate_test_data.py)

```python
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.campus.models import Campus
from apps.events.models import Event, EventType
from apps.attendance.models import Attendance
from faker import Faker
import random
from datetime import datetime, timedelta

User = get_user_model()
fake = Faker()

class Command(BaseCommand):
    help = 'Generate test data for development and testing'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=50,
            help='Number of users to create per campus'
        )
        parser.add_argument(
            '--events',
            type=int,
            default=20,
            help='Number of events to create per campus'
        )
        parser.add_argument(
            '--attendance-rate',
            type=float,
            default=0.7,
            help='Attendance rate (0.0 to 1.0)'
        )
        parser.add_argument(
            '--campus-id',
            type=int,
            help='Generate data for specific campus only'
        )
        parser.add_argument(
            '--clear-existing',
            action='store_true',
            help='Clear existing test data before generating new'
        )
    
    def handle(self, *args, **options):
        self.stdout.write("Generating test data...")
        
        if options['clear_existing']:
            self.clear_test_data()
        
        if options['campus_id']:
            campuses = Campus.objects.filter(id=options['campus_id'], is_active=True)
        else:
            campuses = Campus.objects.filter(is_active=True)
        
        if not campuses.exists():
            self.stdout.write(self.style.ERROR('No campuses found'))
            return
        
        # Ensure event types exist
        self.create_event_types()
        
        total_users = 0
        total_events = 0
        total_attendance = 0
        
        for campus in campuses:
            self.stdout.write(f"Generating data for {campus.name}...")
            
            # Generate users
            users = self.generate_users(campus, options['users'])
            total_users += len(users)
            
            # Generate events
            events = self.generate_events(campus, users, options['events'])
            total_events += len(events)
            
            # Generate attendance
            attendance_count = self.generate_attendance(
                events, users, options['attendance_rate']
            )
            total_attendance += attendance_count
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Test data generation completed!\n'
                f'Created: {total_users} users, {total_events} events, {total_attendance} attendance records'
            )
        )
    
    def clear_test_data(self):
        """Clear existing test data"""
        self.stdout.write("Clearing existing test data...")
        
        # Delete attendance records
        Attendance.objects.filter(user__email__contains='test').delete()
        
        # Delete events
        Event.objects.filter(organizer__email__contains='test').delete()
        
        # Delete test users (keep admin users)
        User.objects.filter(email__contains='test', role__in=['student', 'organizer']).delete()
        
        self.stdout.write("Existing test data cleared")
    
    def create_event_types(self):
        """Ensure event types exist"""
        event_types = [
            ('Lecture', '#2563eb'),
            ('Workshop', '#dc2626'),
            ('Seminar', '#059669'),
            ('Conference', '#7c3aed'),
            ('Meeting', '#ea580c'),
        ]
        
        for name, color in event_types:
            EventType.objects.get_or_create(
                name=name,
                defaults={
                    'description': f'{name} events',
                    'color': color,
                    'requires_attendance': True,
                    'is_active': True
                }
            )
    
    def generate_users(self, campus, count):
        """Generate test users for a campus"""
        users = []
        roles = ['student'] * 80 + ['organizer'] * 15 + ['admin'] * 5  # Distribution
        
        for i in range(count):
            role = random.choice(roles)
            
            user = User.objects.create_user(
                email=f'test.{role}.{campus.code.lower()}.{i}@example.com',
                password='testpass123',
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                role=role,
                campus=campus,
                student_id=f'{campus.code}{fake.random_number(digits=6)}' if role == 'student' else None,
                department=random.choice(['Computer Science', 'Engineering', 'Business', 'Arts', 'Science']),
                year_level=random.choice([1, 2, 3, 4]) if role == 'student' else None,
                phone=fake.phone_number(),
                date_of_birth=fake.date_of_birth(minimum_age=18, maximum_age=25) if role == 'student' else None,
                is_verified=True
            )
            users.append(user)
        
        self.stdout.write(f"  Created {count} users for {campus.name}")
        return users
    
    def generate_events(self, campus, users, count):
        """Generate test events for a campus"""
        events = []
        event_types = list(EventType.objects.filter(is_active=True))
        organizers = [u for u in users if u.role in ['organizer', 'admin']]
        
        if not organizers:
            # Create at least one organizer if none exist
            organizer = User.objects.create_user(
                email=f'organizer.{campus.code.lower()}@example.com',
                password='testpass123',
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                role='organizer',
                campus=campus,
                is_verified=True
            )
            organizers = [organizer]
        
        for i in range(count):
            # Generate event date (past 30 days to future 60 days)
            event_date = fake.date_between(
                start_date=timezone.now().date() - timedelta(days=30),
                end_date=timezone.now().date() + timedelta(days=60)
            )
            
            start_time = fake.time_object()
            end_time = (datetime.combine(datetime.today(), start_time) + timedelta(hours=random.randint(1, 4))).time()
            
            event = Event.objects.create(
                title=fake.sentence(nb_words=4).rstrip('.'),
                description=fake.paragraph(nb_sentences=3),
                campus=campus,
                organizer=random.choice(organizers),
                event_type=random.choice(event_types),
                date=event_date,
                start_time=start_time,
                end_time=end_time,
                location=fake.address(),
                location_coordinates={
                    'lat': float(fake.latitude()),
                    'lng': float(fake.longitude())
                },
                max_attendees=random.randint(20, 200),
                is_multi_campus=random.choice([True, False]) if random.random() < 0.2 else False,
                status='published' if event_date >= timezone.now().date() else random.choice(['completed', 'cancelled']),
                requires_registration=random.choice([True, False]),
                is_active=True
            )
            events.append(event)
        
        self.stdout.write(f"  Created {count} events for {campus.name}")
        return events
    
    def generate_attendance(self, events, users, attendance_rate):
        """Generate test attendance records"""
        attendance_count = 0
        students = [u for u in users if u.role == 'student']
        
        for event in events:
            if event.status != 'published':
                continue
            
            # Determine number of attendees
            num_attendees = int(len(students) * attendance_rate * random.uniform(0.5, 1.5))
            num_attendees = min(num_attendees, len(students))
            
            if event.max_attendees:
                num_attendees = min(num_attendees, event.max_attendees)
            
            # Select random attendees
            attendees = random.sample(students, num_attendees)
            
            for user in attendees:
                # Generate attendance timestamp
                if event.date <= timezone.now().date():
                    # Past event - generate timestamp during event
                    event_start = timezone.datetime.combine(event.date, event.start_time)
                    event_end = timezone.datetime.combine(event.date, event.end_time)
                    
                    if timezone.is_naive(event_start):
                        event_start = timezone.make_aware(event_start)
                    if timezone.is_naive(event_end):
                        event_end = timezone.make_aware(event_end)
                    
                    marked_at = fake.date_time_between(
                        start_date=event_start,
                        end_date=event_end,
                        tzinfo=timezone.get_current_timezone()
                    )
                else:
                    # Future event - no attendance yet
                    continue
                
                # Create attendance record
                Attendance.objects.create(
                    event=event,
                    user=user,
                    campus=event.campus,
                    status='present',
                    marked_at=marked_at,
                    gps_coordinates={
                        'lat': event.location_coordinates['lat'] + random.uniform(-0.001, 0.001),
                        'lng': event.location_coordinates['lng'] + random.uniform(-0.001, 0.001),
                        'accuracy': random.uniform(5, 50)
                    },
                    is_verified=random.choice([True, False]),
                    cross_campus_attendance=(user.campus_id != event.campus_id),
                    verification_score=random.uniform(0.6, 1.0),
                    notes=fake.sentence() if random.random() < 0.3 else None
                )
                attendance_count += 1
        
        self.stdout.write(f"  Created {attendance_count} attendance records")
        return attendance_count
```

This comprehensive utilities and management commands documentation provides:

✅ **Campus Data Management** utilities with isolation validation
✅ **Data Validation** utilities with comprehensive checks
✅ **Management Commands** for setup, migration, and verification
✅ **Test Data Generation** for development and testing
✅ **Data Isolation Verification** with auto-fix capabilities
✅ **Business Rule Validation** for complex logic
✅ **Initial System Setup** commands
✅ **Error Handling and Logging** throughout

These utilities complete your Django backend implementation, providing all the tools needed for managing, validating, and maintaining your multi-campus EAS system! 🚀
