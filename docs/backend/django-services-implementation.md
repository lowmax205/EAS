# 🔧 Django Services and Utilities

## Overview

This document provides comprehensive Django services, utilities, and business logic implementation for the EAS Multi-Campus Event Attendance System. These services handle complex business operations, validation, file processing, and integration with external APIs.

---

## 🏗️ Service Architecture

### Service Layer Organization

```
apps/shared/services/
├── base_service.py          # Base service classes
├── campus_service.py        # Campus management logic
├── validation_service.py    # Data validation services
├── notification_service.py  # Notification handling
├── file_service.py         # File processing
├── analytics_service.py    # Analytics and reporting
└── integration_service.py  # External API integrations

apps/attendance/services/
├── attendance_service.py    # Attendance business logic
├── validation_service.py    # Attendance validation
└── qr_service.py           # QR code generation

apps/events/services/
├── event_service.py        # Event management logic
├── registration_service.py # Event registration
└── notification_service.py # Event notifications

apps/reports/services/
├── report_service.py       # Report generation
├── analytics_service.py    # Analytics processing
└── export_service.py      # Data export utilities
```

---

## 🏛️ Base Service Classes

### Base Service (apps/shared/services/base_service.py)

```python
from django.db import transaction
from django.core.exceptions import ValidationError, PermissionDenied
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class BaseService:
    """
    Base service class providing common functionality
    """
    
    def __init__(self, user=None):
        self.user = user
        self.logger = logger
    
    def validate_campus_access(self, campus_id):
        """Validate user can access specified campus"""
        if not self.user:
            raise PermissionDenied("Authentication required")
        
        accessible_campuses = self.user.get_accessible_campus_ids()
        if campus_id not in accessible_campuses:
            raise PermissionDenied(f"Access denied for campus {campus_id}")
    
    def log_action(self, action, details=None, level='info'):
        """Log service actions"""
        log_data = {
            'user_id': self.user.id if self.user else None,
            'action': action,
            'timestamp': timezone.now(),
            'details': details or {}
        }
        
        if self.user and hasattr(self.user, 'campus_id'):
            log_data['campus_id'] = self.user.campus_id
        
        getattr(self.logger, level)(f"Service Action: {action}", extra=log_data)
    
    @transaction.atomic
    def execute_with_transaction(self, func, *args, **kwargs):
        """Execute function within database transaction"""
        try:
            result = func(*args, **kwargs)
            self.log_action('transaction_success', {'function': func.__name__})
            return result
        except Exception as e:
            self.log_action('transaction_failed', {
                'function': func.__name__,
                'error': str(e)
            }, level='error')
            raise


class CampusAwareService(BaseService):
    """
    Base service for campus-aware operations
    """
    
    def __init__(self, user=None, campus_id=None):
        super().__init__(user)
        self.campus_id = campus_id or (user.campus_id if user else None)
        
        if self.campus_id and user:
            self.validate_campus_access(self.campus_id)
    
    def get_campus_queryset(self, model_class):
        """Get queryset filtered by campus"""
        queryset = model_class.objects.all()
        
        if hasattr(queryset, 'accessible_to_user') and self.user:
            return queryset.accessible_to_user(self.user, self.campus_id)
        
        if self.campus_id:
            return queryset.filter(campus_id=self.campus_id)
        
        return queryset
```

---

## 🏛️ Campus Management Service

### Campus Service (apps/campus/services/campus_service.py)

```python
from django.db.models import Count, Avg, Q
from django.utils import timezone
from django.core.cache import cache
from ..models import Campus, CampusConfiguration
from apps.shared.services.base_service import CampusAwareService
import json

class CampusService(CampusAwareService):
    """
    Campus management and analytics service
    """
    
    def get_campus_statistics(self, campus_id=None):
        """Get comprehensive campus statistics"""
        target_campus_id = campus_id or self.campus_id
        self.validate_campus_access(target_campus_id)
        
        cache_key = f"campus_stats_{target_campus_id}"
        cached_stats = cache.get(cache_key)
        
        if cached_stats:
            return cached_stats
        
        try:
            campus = Campus.objects.get(id=target_campus_id, is_active=True)
        except Campus.DoesNotExist:
            raise ValidationError(f"Campus {target_campus_id} not found")
        
        # User statistics
        user_stats = self._get_user_statistics(campus)
        
        # Event statistics
        event_stats = self._get_event_statistics(campus)
        
        # Attendance statistics
        attendance_stats = self._get_attendance_statistics(campus)
        
        # Performance metrics
        performance_stats = self._get_performance_metrics(campus)
        
        stats = {
            'campus': {
                'id': campus.id,
                'name': campus.name,
                'code': campus.code,
            },
            'users': user_stats,
            'events': event_stats,
            'attendance': attendance_stats,
            'performance': performance_stats,
            'last_updated': timezone.now().isoformat()
        }
        
        # Cache for 15 minutes
        cache.set(cache_key, stats, 900)
        
        self.log_action('campus_statistics_generated', {
            'campus_id': target_campus_id,
            'stats_keys': list(stats.keys())
        })
        
        return stats
    
    def _get_user_statistics(self, campus):
        """Get user-related statistics"""
        users_qs = campus.users.filter(is_active=True)
        
        return {
            'total': users_qs.count(),
            'by_role': dict(users_qs.values('role').annotate(count=Count('id')).values_list('role', 'count')),
            'new_this_month': users_qs.filter(
                created_at__month=timezone.now().month,
                created_at__year=timezone.now().year
            ).count(),
            'verified': users_qs.filter(is_verified=True).count(),
        }
    
    def _get_event_statistics(self, campus):
        """Get event-related statistics"""
        events_qs = campus.events.filter(is_active=True)
        
        return {
            'total': events_qs.count(),
            'published': events_qs.filter(status='published').count(),
            'completed': events_qs.filter(status='completed').count(),
            'upcoming': events_qs.filter(
                date__gte=timezone.now().date(),
                status='published'
            ).count(),
            'multi_campus': events_qs.filter(is_multi_campus=True).count(),
            'by_type': dict(events_qs.values('event_type').annotate(count=Count('id')).values_list('event_type', 'count')),
        }
    
    def _get_attendance_statistics(self, campus):
        """Get attendance-related statistics"""
        attendance_qs = campus.attendance_records.filter(status='present')
        
        total_attendance = attendance_qs.count()
        verified_attendance = attendance_qs.filter(is_verified=True).count()
        cross_campus = attendance_qs.filter(cross_campus_attendance=True).count()
        
        return {
            'total': total_attendance,
            'verified': verified_attendance,
            'cross_campus': cross_campus,
            'verification_rate': (verified_attendance / total_attendance * 100) if total_attendance > 0 else 0,
            'cross_campus_rate': (cross_campus / total_attendance * 100) if total_attendance > 0 else 0,
            'this_month': attendance_qs.filter(
                marked_at__month=timezone.now().month,
                marked_at__year=timezone.now().year
            ).count(),
        }
    
    def _get_performance_metrics(self, campus):
        """Get performance metrics"""
        # Average attendance per event
        events_with_attendance = campus.events.filter(
            is_active=True,
            attendance_records__status='present'
        ).annotate(
            attendance_count=Count('attendance_records')
        ).aggregate(
            avg_attendance=Avg('attendance_count')
        )
        
        return {
            'avg_attendance_per_event': round(events_with_attendance['avg_attendance'] or 0, 2),
            'active_users_percentage': self._calculate_active_users_percentage(campus),
            'event_completion_rate': self._calculate_event_completion_rate(campus),
        }
    
    def _calculate_active_users_percentage(self, campus):
        """Calculate percentage of users who attended events in last 30 days"""
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        
        total_users = campus.users.filter(is_active=True).count()
        active_users = campus.users.filter(
            is_active=True,
            attendance_records__marked_at__gte=thirty_days_ago,
            attendance_records__status='present'
        ).distinct().count()
        
        return (active_users / total_users * 100) if total_users > 0 else 0
    
    def _calculate_event_completion_rate(self, campus):
        """Calculate percentage of published events that were completed"""
        total_events = campus.events.filter(
            is_active=True,
            status__in=['published', 'completed', 'cancelled']
        ).count()
        
        completed_events = campus.events.filter(
            is_active=True,
            status='completed'
        ).count()
        
        return (completed_events / total_events * 100) if total_events > 0 else 0
    
    def update_campus_configuration(self, campus_id, config_data):
        """Update campus configuration"""
        self.validate_campus_access(campus_id)
        
        try:
            campus = Campus.objects.get(id=campus_id)
            config, created = CampusConfiguration.objects.get_or_create(campus=campus)
            
            # Update configuration fields
            for field, value in config_data.items():
                if hasattr(config, field):
                    setattr(config, field, value)
            
            config.save()
            
            # Clear cache
            cache.delete(f"campus_stats_{campus_id}")
            
            self.log_action('campus_configuration_updated', {
                'campus_id': campus_id,
                'updated_fields': list(config_data.keys()),
                'created': created
            })
            
            return config
            
        except Campus.DoesNotExist:
            raise ValidationError(f"Campus {campus_id} not found")
    
    def validate_campus_isolation(self, user_id):
        """Validate that user data respects campus isolation"""
        from apps.accounts.models import User
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return {'is_valid': False, 'violations': ['User not found']}
        
        violations = []
        
        # Check if user has events in other campuses (non-multi-campus)
        if user.role not in ['admin', 'super_admin']:
            other_campus_events = user.organized_events.exclude(campus_id=user.campus_id).filter(
                is_multi_campus=False
            )
            
            if other_campus_events.exists():
                violations.append(f"User has {other_campus_events.count()} events in other campuses")
        
        # Check attendance isolation
        other_campus_attendance = user.attendance_records.exclude(
            campus_id=user.campus_id
        ).exclude(cross_campus_attendance=True)
        
        if other_campus_attendance.exists():
            violations.append(f"User has {other_campus_attendance.count()} attendance records in other campuses without cross-campus flag")
        
        return {
            'is_valid': len(violations) == 0,
            'violations': violations,
            'user': {
                'id': user.id,
                'campus_id': user.campus_id,
                'role': user.role
            }
        }
```

---

## ✅ Attendance Validation Service

### Attendance Validation Service (apps/attendance/services/validation_service.py)

```python
from django.utils import timezone
from django.conf import settings
from ..models import AttendanceValidation
from apps.shared.services.base_service import BaseService
import math
import requests
from PIL import Image
import face_recognition
import numpy as np

class AttendanceValidationService(BaseService):
    """
    Comprehensive attendance validation service
    """
    
    def __init__(self, user=None):
        super().__init__(user)
        self.validation_threshold = 0.7  # Minimum score for validation
    
    def validate_attendance(self, attendance):
        """Run comprehensive validation checks on attendance record"""
        validations = []
        overall_score = 0.0
        total_weight = 0.0
        
        # GPS Distance Validation
        if attendance.gps_coordinates and attendance.event.location_coordinates:
            gps_result = self._validate_gps_distance(attendance)
            validations.append(gps_result)
            overall_score += gps_result['confidence_score'] * 0.3
            total_weight += 0.3
        
        # Time Window Validation
        time_result = self._validate_time_window(attendance)
        validations.append(time_result)
        overall_score += time_result['confidence_score'] * 0.2
        total_weight += 0.2
        
        # Image Verification
        if attendance.selfie_image:
            image_result = self._validate_selfie_image(attendance)
            validations.append(image_result)
            overall_score += image_result['confidence_score'] * 0.3
            total_weight += 0.3
        
        # Signature Validation
        if attendance.signature_image:
            signature_result = self._validate_signature(attendance)
            validations.append(signature_result)
            overall_score += signature_result['confidence_score'] * 0.1
            total_weight += 0.1
        
        # Duplicate Check
        duplicate_result = self._validate_no_duplicate(attendance)
        validations.append(duplicate_result)
        overall_score += duplicate_result['confidence_score'] * 0.1
        total_weight += 0.1
        
        # Calculate final score
        final_score = overall_score / total_weight if total_weight > 0 else 0.0
        is_valid = final_score >= self.validation_threshold
        
        # Store validation results
        for validation in validations:
            AttendanceValidation.objects.create(
                attendance=attendance,
                validation_type=validation['type'],
                status='passed' if validation['status'] == 'passed' else 'failed',
                confidence_score=validation['confidence_score'],
                details=validation['details']
            )
        
        # Generate notes
        notes = self._generate_validation_notes(validations, final_score)
        
        self.log_action('attendance_validated', {
            'attendance_id': attendance.id,
            'final_score': final_score,
            'is_valid': is_valid,
            'validations_run': len(validations)
        })
        
        return {
            'overall_score': round(final_score, 3),
            'is_valid': is_valid,
            'validations': validations,
            'notes': notes
        }
    
    def _validate_gps_distance(self, attendance):
        """Validate GPS coordinates are within acceptable range"""
        user_coords = attendance.gps_coordinates
        event_coords = attendance.event.location_coordinates
        
        # Calculate distance using Haversine formula
        distance_meters = self._calculate_distance(
            user_coords['lat'], user_coords['lng'],
            event_coords['lat'], event_coords['lng']
        )
        
        # Get campus configuration for GPS radius
        campus_config = attendance.campus.configuration
        max_distance = campus_config.gps_radius_meters if campus_config else 100
        
        if distance_meters <= max_distance:
            score = max(0.0, 1.0 - (distance_meters / max_distance))
            status = 'passed'
        else:
            score = 0.0
            status = 'failed'
        
        return {
            'type': 'gps_distance',
            'status': status,
            'confidence_score': score,
            'details': {
                'distance_meters': round(distance_meters, 2),
                'max_allowed_meters': max_distance,
                'user_coordinates': user_coords,
                'event_coordinates': event_coords,
                'gps_accuracy': user_coords.get('accuracy')
            }
        }
    
    def _validate_time_window(self, attendance):
        """Validate attendance was marked within acceptable time window"""
        event_start = timezone.datetime.combine(attendance.event.date, attendance.event.start_time)
        event_end = timezone.datetime.combine(attendance.event.date, attendance.event.end_time)
        
        if timezone.is_naive(event_start):
            event_start = timezone.make_aware(event_start)
        if timezone.is_naive(event_end):
            event_end = timezone.make_aware(event_end)
        
        marked_at = attendance.marked_at
        
        # Check if within event time or configured window
        campus_config = attendance.campus.configuration
        window_minutes = campus_config.attendance_window_minutes if campus_config else 30
        
        window_start = event_start - timezone.timedelta(minutes=window_minutes)
        window_end = event_end + timezone.timedelta(minutes=window_minutes)
        
        if window_start <= marked_at <= window_end:
            # Calculate score based on how close to optimal time
            if event_start <= marked_at <= event_end:
                score = 1.0  # Perfect - during event
            else:
                # Calculate distance from optimal window
                if marked_at < event_start:
                    distance_minutes = (event_start - marked_at).total_seconds() / 60
                else:
                    distance_minutes = (marked_at - event_end).total_seconds() / 60
                
                score = max(0.0, 1.0 - (distance_minutes / window_minutes))
            
            status = 'passed'
        else:
            score = 0.0
            status = 'failed'
        
        return {
            'type': 'time_window',
            'status': status,
            'confidence_score': score,
            'details': {
                'marked_at': marked_at.isoformat(),
                'event_start': event_start.isoformat(),
                'event_end': event_end.isoformat(),
                'window_start': window_start.isoformat(),
                'window_end': window_end.isoformat(),
                'window_minutes': window_minutes
            }
        }
    
    def _validate_selfie_image(self, attendance):
        """Validate selfie image quality and authenticity"""
        try:
            # Load the selfie image
            image = Image.open(attendance.selfie_image.path)
            
            # Basic image quality checks
            quality_score = self._assess_image_quality(image)
            
            # Face detection
            face_score = self._detect_face_in_image(image)
            
            # Compare with user's profile image if available
            similarity_score = 0.5  # Default if no profile image
            if attendance.user.profile_image:
                similarity_score = self._compare_faces(
                    attendance.user.profile_image.path,
                    attendance.selfie_image.path
                )
            
            # Combine scores
            final_score = (quality_score * 0.3 + face_score * 0.3 + similarity_score * 0.4)
            status = 'passed' if final_score >= 0.6 else 'failed'
            
            return {
                'type': 'image_verification',
                'status': status,
                'confidence_score': final_score,
                'details': {
                    'quality_score': quality_score,
                    'face_detection_score': face_score,
                    'face_similarity_score': similarity_score,
                    'image_size': f"{image.width}x{image.height}",
                    'file_size_kb': attendance.selfie_image.size // 1024
                }
            }
            
        except Exception as e:
            self.log_action('image_validation_failed', {
                'attendance_id': attendance.id,
                'error': str(e)
            }, level='error')
            
            return {
                'type': 'image_verification',
                'status': 'failed',
                'confidence_score': 0.0,
                'details': {
                    'error': str(e),
                    'validation_failed': True
                }
            }
    
    def _validate_signature(self, attendance):
        """Validate digital signature"""
        try:
            # Load signature image
            signature = Image.open(attendance.signature_image.path)
            
            # Basic signature validation checks
            quality_score = self._assess_signature_quality(signature)
            
            # Compare with user's stored signature if available
            similarity_score = 0.7  # Default if no stored signature
            if attendance.user.signature_image:
                similarity_score = self._compare_signatures(
                    attendance.user.signature_image.path,
                    attendance.signature_image.path
                )
            
            final_score = (quality_score * 0.4 + similarity_score * 0.6)
            status = 'passed' if final_score >= 0.5 else 'failed'
            
            return {
                'type': 'signature_verification',
                'status': status,
                'confidence_score': final_score,
                'details': {
                    'quality_score': quality_score,
                    'similarity_score': similarity_score,
                    'has_stored_signature': bool(attendance.user.signature_image)
                }
            }
            
        except Exception as e:
            return {
                'type': 'signature_verification',
                'status': 'failed',
                'confidence_score': 0.0,
                'details': {'error': str(e)}
            }
    
    def _validate_no_duplicate(self, attendance):
        """Check for duplicate attendance records"""
        duplicate_count = attendance.__class__.objects.filter(
            event=attendance.event,
            user=attendance.user
        ).exclude(id=attendance.id).count()
        
        if duplicate_count == 0:
            score = 1.0
            status = 'passed'
        else:
            score = 0.0
            status = 'failed'
        
        return {
            'type': 'duplicate_check',
            'status': status,
            'confidence_score': score,
            'details': {
                'duplicate_count': duplicate_count,
                'is_duplicate': duplicate_count > 0
            }
        }
    
    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two GPS coordinates using Haversine formula"""
        R = 6371000  # Earth's radius in meters
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat / 2) ** 2 +
             math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def _assess_image_quality(self, image):
        """Assess basic image quality"""
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Basic quality checks
        width, height = image.size
        
        # Size check (minimum resolution)
        if width < 300 or height < 300:
            return 0.3
        
        # Aspect ratio check
        aspect_ratio = width / height
        if not (0.5 <= aspect_ratio <= 2.0):
            return 0.4
        
        # Basic brightness/contrast check
        import numpy as np
        img_array = np.array(image)
        
        # Calculate variance (higher variance = better contrast)
        variance = np.var(img_array)
        
        # Normalize variance score
        quality_score = min(1.0, variance / 10000)
        
        return max(0.2, quality_score)  # Minimum quality score
    
    def _detect_face_in_image(self, image):
        """Detect face in image using face_recognition library"""
        try:
            # Convert PIL image to numpy array
            img_array = np.array(image.convert('RGB'))
            
            # Find face locations
            face_locations = face_recognition.face_locations(img_array)
            
            if len(face_locations) == 1:
                return 1.0  # Perfect - exactly one face
            elif len(face_locations) > 1:
                return 0.7  # Good - multiple faces, but acceptable
            else:
                return 0.0  # Bad - no faces detected
                
        except Exception as e:
            self.log_action('face_detection_failed', {'error': str(e)}, level='warning')
            return 0.5  # Default score if face detection fails
    
    def _compare_faces(self, profile_image_path, selfie_image_path):
        """Compare faces between profile and selfie images"""
        try:
            # Load images
            profile_image = face_recognition.load_image_file(profile_image_path)
            selfie_image = face_recognition.load_image_file(selfie_image_path)
            
            # Get face encodings
            profile_encodings = face_recognition.face_encodings(profile_image)
            selfie_encodings = face_recognition.face_encodings(selfie_image)
            
            if len(profile_encodings) == 0 or len(selfie_encodings) == 0:
                return 0.5  # Default if can't detect faces
            
            # Compare faces
            face_distances = face_recognition.face_distance(profile_encodings, selfie_encodings[0])
            
            # Convert distance to similarity score (lower distance = higher similarity)
            similarity_score = 1.0 - min(face_distances)
            
            return max(0.0, similarity_score)
            
        except Exception as e:
            self.log_action('face_comparison_failed', {'error': str(e)}, level='warning')
            return 0.5  # Default score if comparison fails
    
    def _assess_signature_quality(self, signature_image):
        """Assess signature image quality"""
        # Convert to grayscale for analysis
        gray_signature = signature_image.convert('L')
        
        # Check if image has sufficient non-white pixels (actual signature content)
        import numpy as np
        img_array = np.array(gray_signature)
        
        # Count non-white pixels (assuming signature is dark on light background)
        non_white_pixels = np.sum(img_array < 240)
        total_pixels = img_array.size
        
        content_ratio = non_white_pixels / total_pixels
        
        # Quality based on content ratio and size
        if content_ratio < 0.01:  # Less than 1% content
            return 0.1
        elif content_ratio < 0.05:  # Less than 5% content
            return 0.5
        else:
            return min(1.0, content_ratio * 10)  # Scale up to reasonable score
    
    def _compare_signatures(self, stored_signature_path, new_signature_path):
        """Compare signature images (basic implementation)"""
        try:
            # This is a simplified signature comparison
            # In production, you might use more sophisticated signature verification
            
            stored_sig = Image.open(stored_signature_path).convert('L')
            new_sig = Image.open(new_signature_path).convert('L')
            
            # Resize to same dimensions for comparison
            stored_sig = stored_sig.resize((200, 100))
            new_sig = new_sig.resize((200, 100))
            
            # Convert to numpy arrays
            import numpy as np
            stored_array = np.array(stored_sig)
            new_array = np.array(new_sig)
            
            # Calculate normalized cross-correlation
            correlation = np.corrcoef(stored_array.flatten(), new_array.flatten())[0, 1]
            
            # Handle NaN case
            if np.isnan(correlation):
                return 0.5
            
            # Convert correlation to similarity score
            similarity_score = max(0.0, (correlation + 1) / 2)
            
            return similarity_score
            
        except Exception as e:
            self.log_action('signature_comparison_failed', {'error': str(e)}, level='warning')
            return 0.5
    
    def _generate_validation_notes(self, validations, final_score):
        """Generate human-readable validation notes"""
        passed_validations = [v for v in validations if v['status'] == 'passed']
        failed_validations = [v for v in validations if v['status'] == 'failed']
        
        notes = []
        
        if final_score >= self.validation_threshold:
            notes.append(f"Overall validation passed with score {final_score:.3f}")
        else:
            notes.append(f"Overall validation failed with score {final_score:.3f}")
        
        if passed_validations:
            passed_types = [v['type'] for v in passed_validations]
            notes.append(f"Passed validations: {', '.join(passed_types)}")
        
        if failed_validations:
            failed_types = [v['type'] for v in failed_validations]
            notes.append(f"Failed validations: {', '.join(failed_types)}")
            
            # Add specific failure details
            for validation in failed_validations:
                if validation['type'] == 'gps_distance':
                    distance = validation['details'].get('distance_meters', 0)
                    max_allowed = validation['details'].get('max_allowed_meters', 100)
                    notes.append(f"GPS distance {distance}m exceeds limit {max_allowed}m")
                elif validation['type'] == 'time_window':
                    notes.append("Attendance marked outside acceptable time window")
                elif validation['type'] == 'duplicate_check':
                    notes.append("Duplicate attendance detected")
        
        return '; '.join(notes)
```

---

## 📊 Report Generation Service

### Report Service (apps/reports/services/report_service.py)

```python
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from django.template.loader import get_template
from django.conf import settings
from ..models import Report
from apps.shared.services.base_service import CampusAwareService
import os
import json
from datetime import datetime, timedelta
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import pandas as pd

class ReportGenerationService(CampusAwareService):
    """
    Report generation service for various report types
    """
    
    def __init__(self, user=None):
        super().__init__(user)
        self.styles = getSampleStyleSheet()
    
    def generate_report(self, report_id):
        """Generate report based on report configuration"""
        try:
            report = Report.objects.get(id=report_id)
            
            # Validate user can access this report
            if report.campus_id and report.campus_id not in self.user.get_accessible_campus_ids():
                raise PermissionDenied("Access denied for report campus")
            
            # Update status
            report.status = 'processing'
            report.processing_started_at = timezone.now()
            report.save()
            
            # Generate based on report type
            if report.report_type == 'attendance_summary':
                data = self._generate_attendance_summary(report)
            elif report.report_type == 'campus_analytics':
                data = self._generate_campus_analytics(report)
            elif report.report_type == 'event_performance':
                data = self._generate_event_performance(report)
            elif report.report_type == 'user_engagement':
                data = self._generate_user_engagement(report)
            elif report.report_type == 'cross_campus_analysis':
                data = self._generate_cross_campus_analysis(report)
            else:
                raise ValueError(f"Unknown report type: {report.report_type}")
            
            # Store data
            report.data = data
            
            # Generate file based on format
            if report.format == 'pdf':
                file_path = self._generate_pdf_report(report, data)
            elif report.format == 'excel':
                file_path = self._generate_excel_report(report, data)
            elif report.format == 'csv':
                file_path = self._generate_csv_report(report, data)
            elif report.format == 'json':
                file_path = self._generate_json_report(report, data)
            else:
                raise ValueError(f"Unknown format: {report.format}")
            
            # Update report with file info
            report.file = file_path
            report.file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
            report.status = 'completed'
            report.processing_completed_at = timezone.now()
            report.save()
            
            self.log_action('report_generated', {
                'report_id': report.id,
                'report_type': report.report_type,
                'format': report.format,
                'file_size': report.file_size
            })
            
            return report
            
        except Exception as e:
            # Update report with error
            report.status = 'failed'
            report.error_message = str(e)
            report.processing_completed_at = timezone.now()
            report.save()
            
            self.log_action('report_generation_failed', {
                'report_id': report.id,
                'error': str(e)
            }, level='error')
            
            raise
    
    def _generate_attendance_summary(self, report):
        """Generate attendance summary data"""
        from apps.attendance.models import Attendance
        from apps.events.models import Event
        
        # Build queryset based on filters
        attendance_qs = Attendance.objects.filter(
            marked_at__date__range=[report.date_from, report.date_to],
            status='present'
        )
        
        if report.campus_id:
            attendance_qs = attendance_qs.filter(campus_id=report.campus_id)
        
        # Apply additional filters
        filters = report.filters or {}
        if filters.get('event_type'):
            attendance_qs = attendance_qs.filter(event__event_type=filters['event_type'])
        
        if filters.get('department'):
            attendance_qs = attendance_qs.filter(user__department=filters['department'])
        
        # Generate summary statistics
        total_attendance = attendance_qs.count()
        unique_attendees = attendance_qs.values('user').distinct().count()
        unique_events = attendance_qs.values('event').distinct().count()
        
        # Verification statistics
        verified_attendance = attendance_qs.filter(is_verified=True).count()
        cross_campus_attendance = attendance_qs.filter(cross_campus_attendance=True).count()
        
        # Daily breakdown
        daily_attendance = attendance_qs.extra(
            select={'day': 'date(marked_at)'}
        ).values('day').annotate(count=Count('id')).order_by('day')
        
        # Event type breakdown
        event_type_breakdown = attendance_qs.values('event__event_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Campus breakdown (if multi-campus)
        campus_breakdown = attendance_qs.values('campus__name', 'campus__code').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Top events by attendance
        top_events = attendance_qs.values(
            'event__title', 'event__date', 'event__organizer__first_name', 'event__organizer__last_name'
        ).annotate(count=Count('id')).order_by('-count')[:10]
        
        return {
            'summary': {
                'total_attendance': total_attendance,
                'unique_attendees': unique_attendees,
                'unique_events': unique_events,
                'verification_rate': (verified_attendance / total_attendance * 100) if total_attendance > 0 else 0,
                'cross_campus_rate': (cross_campus_attendance / total_attendance * 100) if total_attendance > 0 else 0,
            },
            'daily_breakdown': list(daily_attendance),
            'event_type_breakdown': list(event_type_breakdown),
            'campus_breakdown': list(campus_breakdown),
            'top_events': list(top_events),
            'filters_applied': filters,
            'date_range': {
                'from': report.date_from.isoformat(),
                'to': report.date_to.isoformat()
            }
        }
    
    def _generate_campus_analytics(self, report):
        """Generate campus analytics data"""
        from apps.reports.models import CampusAnalytics
        from apps.campus.models import Campus
        
        if report.campus_id:
            campuses = [Campus.objects.get(id=report.campus_id)]
        else:
            campuses = Campus.objects.filter(is_active=True)
        
        campus_data = []
        
        for campus in campuses:
            # Get analytics for date range
            analytics_qs = CampusAnalytics.objects.filter(
                campus=campus,
                date__range=[report.date_from, report.date_to]
            ).order_by('date')
            
            if analytics_qs.exists():
                # Calculate aggregated metrics
                total_metrics = analytics_qs.aggregate(
                    avg_users=Avg('total_users'),
                    avg_events=Avg('total_events'),
                    total_attendance=Sum('total_attendance'),
                    avg_attendance_rate=Avg('attendance_rate'),
                    avg_verification_rate=Avg('verification_rate')
                )
                
                # Get latest metrics
                latest_metrics = analytics_qs.last()
                
                # Calculate trends
                first_metrics = analytics_qs.first()
                trends = {
                    'users_growth': ((latest_metrics.total_users - first_metrics.total_users) / first_metrics.total_users * 100) if first_metrics.total_users > 0 else 0,
                    'events_growth': ((latest_metrics.total_events - first_metrics.total_events) / first_metrics.total_events * 100) if first_metrics.total_events > 0 else 0,
                    'attendance_growth': ((latest_metrics.total_attendance - first_metrics.total_attendance) / first_metrics.total_attendance * 100) if first_metrics.total_attendance > 0 else 0,
                }
                
                campus_data.append({
                    'campus': {
                        'id': campus.id,
                        'name': campus.name,
                        'code': campus.code
                    },
                    'aggregated_metrics': total_metrics,
                    'latest_metrics': {
                        'total_users': latest_metrics.total_users,
                        'total_events': latest_metrics.total_events,
                        'total_attendance': latest_metrics.total_attendance,
                        'attendance_rate': latest_metrics.attendance_rate,
                        'verification_rate': latest_metrics.verification_rate,
                    },
                    'trends': trends,
                    'daily_data': list(analytics_qs.values(
                        'date', 'total_users', 'active_users', 'total_events', 
                        'total_attendance', 'attendance_rate', 'verification_rate'
                    ))
                })
        
        return {
            'campuses': campus_data,
            'report_summary': {
                'total_campuses': len(campus_data),
                'date_range': {
                    'from': report.date_from.isoformat(),
                    'to': report.date_to.isoformat()
                }
            }
        }
    
    def _generate_pdf_report(self, report, data):
        """Generate PDF report file"""
        filename = f"report_{report.id}_{report.report_type}.pdf"
        file_path = os.path.join(settings.MEDIA_ROOT, 'reports', filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Create PDF document
        doc = SimpleDocTemplate(file_path, pagesize=A4)
        story = []
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1  # Center alignment
        )
        
        story.append(Paragraph(report.title, title_style))
        story.append(Spacer(1, 12))
        
        # Report info
        info_data = [
            ['Report Type:', report.get_report_type_display()],
            ['Campus:', report.campus.name if report.campus else 'All Campuses'],
            ['Date Range:', f"{report.date_from} to {report.date_to}"],
            ['Generated By:', report.generated_by.get_full_name()],
            ['Generated At:', report.created_at.strftime('%Y-%m-%d %H:%M:%S')],
        ]
        
        info_table = Table(info_data, colWidths=[100, 300])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(info_table)
        story.append(Spacer(1, 20))
        
        # Add report-specific content based on type
        if report.report_type == 'attendance_summary':
            story.extend(self._add_attendance_summary_to_pdf(data))
        elif report.report_type == 'campus_analytics':
            story.extend(self._add_campus_analytics_to_pdf(data))
        
        # Build PDF
        doc.build(story)
        
        return file_path
    
    def _add_attendance_summary_to_pdf(self, data):
        """Add attendance summary content to PDF"""
        story = []
        
        # Summary statistics
        story.append(Paragraph("Summary Statistics", self.styles['Heading2']))
        
        summary_data = [
            ['Metric', 'Value'],
            ['Total Attendance', str(data['summary']['total_attendance'])],
            ['Unique Attendees', str(data['summary']['unique_attendees'])],
            ['Unique Events', str(data['summary']['unique_events'])],
            ['Verification Rate', f"{data['summary']['verification_rate']:.1f}%"],
            ['Cross Campus Rate', f"{data['summary']['cross_campus_rate']:.1f}%"],
        ]
        
        summary_table = Table(summary_data, colWidths=[200, 100])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(summary_table)
        story.append(Spacer(1, 20))
        
        # Top events
        if data['top_events']:
            story.append(Paragraph("Top Events by Attendance", self.styles['Heading2']))
            
            events_data = [['Event Title', 'Date', 'Organizer', 'Attendance']]
            for event in data['top_events'][:10]:
                events_data.append([
                    event['event__title'][:30] + '...' if len(event['event__title']) > 30 else event['event__title'],
                    str(event['event__date']),
                    f"{event['event__organizer__first_name']} {event['event__organizer__last_name']}",
                    str(event['count'])
                ])
            
            events_table = Table(events_data, colWidths=[150, 80, 120, 50])
            events_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(events_table)
        
        return story
    
    def _generate_excel_report(self, report, data):
        """Generate Excel report file"""
        filename = f"report_{report.id}_{report.report_type}.xlsx"
        file_path = os.path.join(settings.MEDIA_ROOT, 'reports', filename)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
            if report.report_type == 'attendance_summary':
                self._add_attendance_summary_to_excel(data, writer)
            elif report.report_type == 'campus_analytics':
                self._add_campus_analytics_to_excel(data, writer)
        
        return file_path
    
    def _add_attendance_summary_to_excel(self, data, writer):
        """Add attendance summary data to Excel"""
        # Summary sheet
        summary_df = pd.DataFrame([data['summary']])
        summary_df.to_excel(writer, sheet_name='Summary', index=False)
        
        # Daily breakdown
        if data['daily_breakdown']:
            daily_df = pd.DataFrame(data['daily_breakdown'])
            daily_df.to_excel(writer, sheet_name='Daily Breakdown', index=False)
        
        # Event type breakdown
        if data['event_type_breakdown']:
            event_type_df = pd.DataFrame(data['event_type_breakdown'])
            event_type_df.to_excel(writer, sheet_name='Event Types', index=False)
        
        # Top events
        if data['top_events']:
            events_df = pd.DataFrame(data['top_events'])
            events_df.to_excel(writer, sheet_name='Top Events', index=False)
```

This comprehensive Django services documentation provides:

✅ **Base Service Architecture** with campus-aware functionality
✅ **Campus Management Service** with statistics and validation
✅ **Attendance Validation Service** with comprehensive verification
✅ **Report Generation Service** with multiple format support
✅ **File Processing and Image Validation** capabilities
✅ **GPS and Location Validation** services
✅ **Error Handling and Logging** throughout
✅ **Integration with External APIs** (face recognition, etc.)

These services integrate perfectly with your existing API implementation and provide the business logic layer needed for your multi-campus EAS system! 🚀
