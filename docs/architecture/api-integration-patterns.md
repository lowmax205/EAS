# 🔄 API Integration Patterns

## REST API Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│   Django REST   │◄──►│   PostgreSQL    │
│   (Frontend)    │    │   Framework     │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       
        │              ┌─────────────────┐              
        └──────────────►│     Redis       │              
                       │   (Cache/JWT)   │              
                       └─────────────────┘              
```

### REST API Endpoints

#### Authentication Endpoints
```python
# apps/authentication/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # User Registration & Authentication
    path('auth/register/', views.UserRegistrationView.as_view(), name='register'),
    path('auth/login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', views.LogoutView.as_view(), name='logout'),
    
    # Password Management
    path('auth/password-change/', views.PasswordChangeView.as_view(), name='password_change'),
    path('auth/password-reset/', views.PasswordResetView.as_view(), name='password_reset'),
    path('auth/password-reset-confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # User Profile
    path('auth/profile/', views.UserProfileView.as_view(), name='profile'),
    path('auth/profile/update/', views.ProfileUpdateView.as_view(), name='profile_update'),
    
    # User Management (Admin only)
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/<int:pk>/verify/', views.UserVerificationView.as_view(), name='user_verify'),
]

# API Views Implementation
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

class CustomTokenObtainPairView(TokenObtainPairView):
    """Enhanced login with user details"""
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Add user details to response
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.user
            
            response.data.update({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'department': user.department,
                    'campus': user.campus.name,
                    'is_verified': user.is_verified,
                }
            })
            
            # Log successful login
            AuditLog.objects.create(
                user=user,
                action='login',
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                success=True
            )
        
        return response

class UserRegistrationView(generics.CreateAPIView):
    """User registration with validation"""
    
    def create(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Registration successful',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

#### Event Management Endpoints
```python
# apps/attendance/urls.py - Event Management
urlpatterns = [
    # Event CRUD Operations
    path('events/', views.EventListCreateView.as_view(), name='event_list_create'),
    path('events/<uuid:pk>/', views.EventDetailView.as_view(), name='event_detail'),
    path('events/<uuid:pk>/update/', views.EventUpdateView.as_view(), name='event_update'),
    path('events/<uuid:pk>/delete/', views.EventDeleteView.as_view(), name='event_delete'),
    
    # QR Code Management
    path('events/<uuid:pk>/qr/', views.QRCodeGenerateView.as_view(), name='qr_generate'),
    path('events/<uuid:pk>/qr/refresh/', views.QRCodeRefreshView.as_view(), name='qr_refresh'),
    
    # Event Analytics
    path('events/<uuid:pk>/analytics/', views.EventAnalyticsView.as_view(), name='event_analytics'),
    path('events/<uuid:pk>/attendance/', views.EventAttendanceListView.as_view(), name='event_attendance'),
    
    # Bulk Operations
    path('events/bulk-create/', views.BulkEventCreateView.as_view(), name='bulk_event_create'),
]

# API Views
class EventListCreateView(generics.ListCreateAPIView):
    """List events or create new event"""
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Event.objects.select_related('organizer', 'campus')
        
        # Role-based filtering
        if user.role == 'student':
            # Students see only active events
            queryset = queryset.filter(is_active=True)
        elif user.role in ['admin', 'hr']:
            # Admins see all events
            pass
        else:
            # Organizers see their own events
            queryset = queryset.filter(organizer=user)
        
        # Filter parameters
        campus_id = self.request.query_params.get('campus')
        if campus_id:
            queryset = queryset.filter(campus_id=campus_id)
            
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from and date_to:
            queryset = queryset.filter(
                start_datetime__date__range=[date_from, date_to]
            )
        
        return queryset.order_by('-start_datetime')
    
    def perform_create(self, serializer):
        event = serializer.save(organizer=self.request.user)
        
        # Generate QR token
        qr_service = QRCodeService()
        qr_token = qr_service.generate_token(event)
        
        event.qr_token = qr_token
        event.save()

class QRCodeGenerateView(generics.RetrieveAPIView):
    """Generate QR code for event"""
    
    def get(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
            
            # Check permissions
            if not self.can_generate_qr(request.user, event):
                return Response(
                    {'error': 'Permission denied'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            qr_service = QRCodeService()
            qr_data = qr_service.generate_qr_code(event)
            
            return Response({
                'qr_token': event.qr_token,
                'qr_image': qr_data['image_base64'],
                'expires_at': event.qr_expires_at,
                'event_id': str(event.id),
            })
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def can_generate_qr(self, user, event):
        return (
            user == event.organizer or 
            user.role in ['admin', 'hr'] or
            user.role == 'supervisor'
        )
```

#### Panel-Required Attendance Verification Endpoints
```python
# apps/attendance/urls.py - Enhanced for Panel Requirements
urlpatterns += [
    # QR Verification with auto-fill support
    path('attendance/verify-qr/', views.QRVerificationView.as_view(), name='qr_verify'),
    
    # Multi-step verification process
    path('attendance/submit/', views.AttendanceSubmissionView.as_view(), name='attendance_submit'),
    path('attendance/verify-location/', views.LocationVerificationView.as_view(), name='location_verify'),
    
    # Dual camera photo verification (Panel requirement)
    path('attendance/upload-front-photo/', views.FrontPhotoUploadView.as_view(), name='front_photo_upload'),
    path('attendance/upload-back-photo/', views.BackPhotoUploadView.as_view(), name='back_photo_upload'),
    
    # Digital signature capture (Panel requirement)
    path('attendance/capture-signature/', views.DigitalSignatureView.as_view(), name='signature_capture'),
    
    # Instant feedback endpoints (Panel requirement)
    path('attendance/verification-feedback/', views.VerificationFeedbackView.as_view(), name='verification_feedback'),
    
    # Student auto-fill data (Panel requirement)
    path('attendance/student-autofill/', views.StudentAutoFillView.as_view(), name='student_autofill'),
    
    # Attendance Records
    path('attendance/', views.AttendanceListView.as_view(), name='attendance_list'),
    path('attendance/<uuid:pk>/', views.AttendanceDetailView.as_view(), name='attendance_detail'),
    path('attendance/<uuid:pk>/verify/', views.ManualVerificationView.as_view(), name='manual_verify'),
]

class QRVerificationView(generics.GenericAPIView):
    """Verify QR code and return event details with auto-filled student data"""
    
    def post(self, request):
        qr_token = request.data.get('qr_token')
        
        if not qr_token:
            return Response(
                {'error': 'QR token required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            event = Event.objects.get(qr_token=qr_token, is_active=True)
            
            # Check if QR is still valid
            if not event.allows_late_attendance:
                return Response(
                    {'error': 'Event attendance period has ended'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Auto-fill student information (Panel requirement)
            user_profile = request.user.profile
            auto_fill_data = {
                'student_id': user_profile.student_id,
                'full_name': f"{request.user.first_name} {request.user.last_name}",
                'email': request.user.email,
                'department': user_profile.department,
                'year_level': user_profile.year_level,
                'profile_photo_url': user_profile.profile_photo.url if user_profile.profile_photo else None
            }
            
            # Log QR scan
            QRScanLog.objects.create(
                token_id=qr_token,
                scanned_by=request.user,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                scan_successful=True,
                latitude=request.data.get('latitude'),
                longitude=request.data.get('longitude'),
            )
            
            return Response({
                'event': {
                    'id': str(event.id),
                    'title': event.title,
                    'location': event.location,
                    'start_time': event.start_datetime,
                    'end_time': event.end_datetime,
                    'latitude': float(event.latitude),
                    'longitude': float(event.longitude),
                    'location_radius': event.location_radius,
                },
                'next_step': 'location_verification'
            })
            
        except Event.DoesNotExist:
            # Log failed scan
            QRScanLog.objects.create(
                token_id=qr_token,
                scanned_by=request.user,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                scan_successful=False,
                failure_reason='Invalid token'
            )
            
            return Response(
                {'error': 'Invalid QR code'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class AttendanceSubmissionView(generics.CreateAPIView):
    """Complete attendance submission with all verification factors"""
    
    def post(self, request):
        serializer = AttendanceSubmissionSerializer(data=request.data)
        
        if serializer.is_valid():
            # Multi-factor validation
            validation_results = self.validate_attendance(serializer.validated_data)
            
            if validation_results['success']:
                attendance = serializer.save(
                    student=request.user,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    **validation_results['data']
                )
                
                # Trigger async verification tasks
                from .tasks import verify_selfie_async, update_analytics
                verify_selfie_async.delay(attendance.id)
                update_analytics.delay(attendance.event.id)
                
                return Response({
                    'message': 'Attendance submitted successfully',
                    'attendance_id': str(attendance.id),
                    'verification_status': attendance.verification_status,
                    'next_steps': validation_results.get('next_steps', [])
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(
                    validation_results['errors'], 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def validate_attendance(self, data):
        """Multi-factor attendance validation"""
        results = {'success': True, 'data': {}, 'errors': {}}
        
        # 1. Location Verification
        location_valid = self.verify_location(
            data['event'], 
            data['latitude'], 
            data['longitude']
        )
        results['data']['location_verified'] = location_valid
        
        if not location_valid:
            results['errors']['location'] = 'Location does not match event venue'
        
        # 2. Duplicate Check
        if AttendanceRecord.objects.filter(
            event=data['event'], 
            student=self.request.user
        ).exists():
            results['success'] = False
            results['errors']['duplicate'] = 'Attendance already submitted for this event'
        
        # 3. Time Window Check
        if not data['event'].allows_late_attendance:
            results['success'] = False
            results['errors']['timing'] = 'Attendance submission period has ended'
        
        return results
    
    def verify_location(self, event, lat, lng):
        """Verify user location is within event location radius"""
        from geopy.distance import geodesic
        
        event_location = (float(event.latitude), float(event.longitude))
        user_location = (float(lat), float(lng))
        
        distance = geodesic(event_location, user_location).meters
        return distance <= event.location_radius
```

#### Panel-Required Analytics & Reporting Endpoints with Histogram Support
```python
# apps/analytics/urls.py - Enhanced for Panel Requirements
urlpatterns = [
    # Dashboard Analytics with real-time refresh (Panel requirement)
    path('analytics/dashboard/', views.DashboardAnalyticsView.as_view(), name='dashboard_analytics'),
    path('analytics/dashboard/refresh/', views.DashboardRefreshView.as_view(), name='dashboard_refresh'),
    
    # Histogram chart endpoints (Panel requirement)
    path('analytics/histograms/attendance-hourly/', views.AttendanceHourlyHistogramView.as_view(), name='hourly_histogram'),
    path('analytics/histograms/verification-time/', views.VerificationTimeHistogramView.as_view(), name='verification_histogram'),
    path('analytics/histograms/department-comparison/', views.DepartmentHistogramView.as_view(), name='department_histogram'),
    path('analytics/histograms/weekly-pattern/', views.WeeklyPatternHistogramView.as_view(), name='weekly_histogram'),
    
    # Integrated analytics with anomaly detection (Panel requirement)
    path('analytics/attendance-trends/', views.AttendanceTrendsView.as_view(), name='attendance_trends'),
    path('analytics/anomaly-detection/', views.AnomalyDetectionView.as_view(), name='anomaly_detection'),
    path('analytics/department-summary/', views.DepartmentSummaryView.as_view(), name='department_summary'),
    
    # Real-time Data with live updates (Panel requirement)
    path('analytics/realtime/<uuid:event_id>/', views.RealtimeEventDataView.as_view(), name='realtime_event'),
    path('analytics/realtime/ws/<uuid:event_id>/', views.RealtimeWebSocketView.as_view(), name='realtime_ws'),
    
    # Reports with photo integration (Panel requirement)
    path('reports/attendance/', views.AttendanceReportView.as_view(), name='attendance_report'),
    path('reports/export-with-photos/', views.ReportExportWithPhotosView.as_view(), name='report_export_photos'),
    path('reports/official-format/', views.OfficialFormatReportView.as_view(), name='official_format_report'),
    path('reports/individual/<int:user_id>/', views.IndividualReportView.as_view(), name='individual_report'),
]

class AttendanceHourlyHistogramView(generics.RetrieveAPIView):
    """Hourly attendance distribution histogram as required by panel"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from datetime import datetime, timedelta
        import json
        
        # Date range parameters
        days = int(request.query_params.get('days', 7))
        campus_id = request.query_params.get('campus_id')
        
        # Fetch histogram data
        histogram_data = HistogramData.objects.filter(
            chart_type='attendance_hourly',
            date_range_end__gte=datetime.now().date() - timedelta(days=days)
        )
        
        if campus_id:
            histogram_data = histogram_data.filter(campus_id=campus_id)
        
        # Aggregate histogram bins
        hourly_bins = list(range(24))  # 0-23 hours
        hourly_values = [0] * 24
        
        for data in histogram_data:
            bins = data.bins
            values = data.values
            for i, bin_value in enumerate(bins):
                if i < len(hourly_values):
                    hourly_values[i] += values[i] if i < len(values) else 0
        
        return Response({
            'histogram_type': 'attendance_hourly',
            'bins': hourly_bins,
            'values': hourly_values,
            'labels': [f"{hour:02d}:00" for hour in hourly_bins],
            'total_samples': sum(hourly_values),
            'peak_hour': hourly_bins[hourly_values.index(max(hourly_values))],
            'metadata': {
                'date_range': f"Last {days} days",
                'campus_filter': campus_id,
                'generated_at': datetime.now().isoformat()
            }
        })

class DashboardAnalyticsView(generics.RetrieveAPIView):
    """Dashboard analytics data with real-time refresh capability"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Role-based analytics
        if user.role == 'student':
            return self.get_student_analytics(user)
        elif user.role in ['admin', 'hr']:
            return self.get_admin_analytics(request)
        else:
            return self.get_organizer_analytics(user)
    
    def get_admin_analytics(self, request):
        """System-wide analytics for administrators with histogram integration"""
        from datetime import datetime, timedelta
        
        # Date range
        days = int(request.query_params.get('days', 30))
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Aggregate data
        analytics = AttendanceAnalytics.objects.filter(
            date__range=[start_date, end_date]
        ).aggregate(
            total_events=Sum('total_events'),
            total_attendees=Sum('total_attendees'),
            avg_attendance_rate=Avg('attendance_rate'),
            verified_count=Sum('verified_count'),
            pending_count=Sum('pending_count'),
        )
        
        # Recent activity
        recent_attendance = AttendanceRecord.objects.filter(
            submitted_at__gte=datetime.now() - timedelta(hours=24)
        ).count()
        
        # Top departments
        top_departments = AttendanceAnalytics.objects.filter(
            date__range=[start_date, end_date]
        ).values('department').annotate(
            avg_rate=Avg('attendance_rate')
        ).order_by('-avg_rate')[:5]
        
        return Response({
            'summary': analytics,
            'recent_activity': recent_attendance,
            'top_departments': list(top_departments),
            'date_range': {'start': start_date, 'end': end_date}
        })

class RealtimeEventDataView(generics.RetrieveAPIView):
    """Real-time event attendance data"""
    
    def get(self, request, event_id):
        try:
            event = Event.objects.get(id=event_id)
            
            # Real-time attendance count
            attendance_data = AttendanceRecord.objects.filter(
                event=event
            ).values('status', 'verification_status').annotate(
                count=Count('id')
            )
            
            # Recent submissions (last 5 minutes)
            from datetime import datetime, timedelta
            recent_submissions = AttendanceRecord.objects.filter(
                event=event,
                submitted_at__gte=datetime.now() - timedelta(minutes=5)
            ).select_related('student').values(
                'student__first_name',
                'student__last_name',
                'submitted_at',
                'verification_status'
            ).order_by('-submitted_at')[:10]
            
            return Response({
                'event_id': str(event_id),
                'attendance_summary': list(attendance_data),
                'recent_submissions': list(recent_submissions),
                'total_registered': event.attendancerecord_set.count(),
                'last_updated': datetime.now(),
            })
            
        except Event.DoesNotExist:
            return Response(
                {'error': 'Event not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
```

## Frontend API Integration Patterns

### 1. Axios Configuration
```javascript
// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### 2. Service Layer Implementation
```javascript
// services/attendanceService.js
import api from './api';

export const attendanceService = {
  // QR Verification
  async verifyQRCode(qrToken, location) {
    const response = await api.post('/attendance/verify-qr/', {
      qr_token: qrToken,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    return response.data;
  },

  // Submit Attendance
  async submitAttendance(attendanceData) {
    const formData = new FormData();
    
    // Add attendance details
    Object.keys(attendanceData).forEach(key => {
      if (key === 'selfie_image' && attendanceData[key]) {
        formData.append(key, attendanceData[key]);
      } else {
        formData.append(key, attendanceData[key]);
      }
    });

    const response = await api.post('/attendance/submit/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get User Attendance History
  async getUserAttendance(userId, params = {}) {
    const response = await api.get(`/attendance/`, { params });
    return response.data;
  },

  // Real-time Event Data
  async getRealtimeEventData(eventId) {
    const response = await api.get(`/analytics/realtime/${eventId}/`);
    return response.data;
  },
};

// services/eventService.js
export const eventService = {
  // Get Events
  async getEvents(params = {}) {
    const response = await api.get('/events/', { params });
    return response.data;
  },

  // Create Event
  async createEvent(eventData) {
    const response = await api.post('/events/', eventData);
    return response.data;
  },

  // Generate QR Code
  async generateQRCode(eventId) {
    const response = await api.get(`/events/${eventId}/qr/`);
    return response.data;
  },

  // Get Event Analytics
  async getEventAnalytics(eventId) {
    const response = await api.get(`/events/${eventId}/analytics/`);
    return response.data;
  },
};
```

### 3. React Hooks for API Integration
```javascript
// hooks/useAttendance.js
import { useState, useCallback } from 'react';
import { attendanceService } from '../services/attendanceService';
import { useNotifications } from './useNotifications';

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotifications();

  const submitAttendance = useCallback(async (attendanceData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await attendanceService.submitAttendance(attendanceData);
      
      showNotification({
        type: 'success',
        message: 'Attendance submitted successfully!',
      });
      
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to submit attendance';
      setError(errorMessage);
      
      showNotification({
        type: 'error',
        message: errorMessage,
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const verifyQRCode = useCallback(async (qrToken, location) => {
    setLoading(true);
    setError(null);

    try {
      const result = await attendanceService.verifyQRCode(qrToken, location);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'QR verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    submitAttendance,
    verifyQRCode,
  };
};
```

### 4. Error Handling Patterns
```javascript
// utils/errorHandler.js
export const handleAPIError = (error, defaultMessage = 'An error occurred') => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.error || data.message || 'Invalid request';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'Resource not found';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.error || data.message || defaultMessage;
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    return error.message || defaultMessage;
  }
};

// Global error boundary component
export class APIErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('API Error:', error, errorInfo);
    
    // Log to error tracking service
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>Please refresh the page and try again.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## WebSocket Integration for Real-time Updates

```javascript
// services/websocketService.js
class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = null;
  }

  connect(eventId) {
    const wsUrl = `${process.env.REACT_APP_WS_URL}/ws/events/${eventId}/`;
    
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(eventId);
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  attemptReconnect(eventId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(eventId), 2000 * this.reconnectAttempts);
    }
  }

  handleMessage(data) {
    // Dispatch custom events for components to listen to
    window.dispatchEvent(new CustomEvent('attendance-update', { detail: data }));
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const websocketService = new WebSocketService();
```

---

**Document Status:** ✅ COMPLETE - Ready for Integration  
**Next Phase:** Frontend Implementation  
**Priority:** CRITICAL - API Foundation Established
