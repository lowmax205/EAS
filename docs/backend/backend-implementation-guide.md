# 🚀 EAS Backend Implementation Guide

## Overview

This guide provides comprehensive implementation instructions for the Django REST Framework backend that supports the **EAS Multi-Campus Event Attendance System**. The backend implementation aligns with the existing frontend architecture and follows the multi-campus enhancement patterns established in the project documentation.

## 🎯 Implementation Goals

- **Full Multi-Campus Support**: Complete campus data isolation with backward compatibility
- **Django Best Practices**: Clean architecture with proper separation of concerns  
- **API-First Design**: RESTful APIs that support the existing React frontend
- **Security-First**: Campus-based access control and data isolation
- **Performance-Optimized**: Efficient queries with campus-aware indexes

## 📋 Implementation Roadmap

### Phase 1: Foundation Setup (Week 1)
- [x] Django project structure established
- [ ] Campus-aware models implementation
- [ ] Database migration strategy
- [ ] Authentication framework

### Phase 2: Core Features (Week 2)
- [ ] User management with campus context
- [ ] Event management with campus isolation
- [ ] Attendance tracking with validation

### Phase 3: API Development (Week 3)
- [ ] RESTful API endpoints
- [ ] Campus-aware filtering
- [ ] API authentication and permissions

### Phase 4: Advanced Features (Week 4)
- [ ] Reporting and analytics
- [ ] File uploads and QR generation
- [ ] Real-time notifications

---

## 🏗️ Architecture Integration

### Backend Structure Alignment

```
backend/
├── App/                    # Django project settings
│   ├── __init__.py
│   ├── settings.py        # Enhanced with campus config
│   ├── urls.py           # Project-level routing
│   ├── wsgi.py
│   └── asgi.py           # For async features
├── apps/                  # Django applications
│   ├── campus/           # Campus management
│   ├── accounts/         # User authentication & profiles  
│   ├── events/           # Event management
│   ├── attendance/       # Attendance tracking
│   ├── reports/          # Analytics and reporting
│   ├── notifications/    # Real-time notifications
│   ├── uploads/          # File handling
│   └── shared/          # Common utilities
├── static/               # Static files
├── media/               # User uploads
├── templates/           # Django templates (admin)
├── requirements.txt     # Dependencies
└── manage.py           # Django management
```

### Campus Data Model Integration

The backend implements the campus data model designed in **Epic 1** and refined across multiple stories:

```python
# Campus Entity (Story 1.1)
class Campus(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    domain = models.CharField(max_length=100, unique=True)
    timezone = models.CharField(max_length=50, default='Asia/Manila')
    is_active = models.BooleanField(default=True)
    
# User Model Enhancement (Story 1.2)
class User(AbstractUser):
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
# Event Model (Story 1.5)
class Event(models.Model):
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    is_multi_campus = models.BooleanField(default=False)
    
# Attendance Model
class Attendance(models.Model):
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    cross_campus_attendance = models.BooleanField(default=False)
```

---

## 🔐 Security & Access Control Implementation

### Campus-Based Authentication (Story 1.2)

Following the authentication patterns established in the frontend:

```python
# Campus-aware authentication middleware
class CampusAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # Inject campus context into request
            request.campus_context = {
                'user_campus_id': request.user.campus_id,
                'accessible_campuses': self.get_accessible_campuses(request.user),
                'is_super_admin': request.user.role == 'super_admin'
            }
        
        response = self.get_response(request)
        return response

# Campus permission classes
class CampusAccessPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
            
        # Super admins can access all campuses
        if request.user.role == 'super_admin':
            return True
            
        # Check campus-specific access
        requested_campus = request.query_params.get('campus_id')
        if requested_campus:
            return int(requested_campus) in request.campus_context['accessible_campuses']
            
        return True
```

### Data Isolation Strategy

Implementing the security requirements from the architecture documentation:

```python
# Campus-aware QuerySet
class CampusQuerySet(models.QuerySet):
    def for_user_campus(self, user):
        """Filter by user's campus context"""
        if user.role == 'super_admin':
            return self
        return self.filter(campus_id=user.campus_id)
    
    def accessible_to_user(self, user, campus_id=None):
        """Apply campus access control"""
        if user.role == 'super_admin':
            if campus_id:
                return self.filter(campus_id=campus_id)
            return self
        
        if campus_id and campus_id in user.accessible_campus_ids:
            return self.filter(campus_id=campus_id)
            
        return self.filter(campus_id=user.campus_id)

# Apply to all campus-aware models
class CampusAwareModel(models.Model):
    objects = CampusQuerySet.as_manager()
    
    class Meta:
        abstract = True
```

---

## 🌐 API Design Implementation

### Campus-Aware API Endpoints (Story 1.3)

Implementing the API design from the architecture documentation:

```python
# Base API viewset with campus filtering
class CampusAwareViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, CampusAccessPermission]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        campus_id = self.request.query_params.get('campus_id')
        
        return queryset.accessible_to_user(
            self.request.user, 
            campus_id=campus_id
        )
    
    def perform_create(self, serializer):
        # Auto-assign campus context
        campus_id = self.request.user.campus_id
        if self.request.data.get('campus_id'):
            # Validate campus access
            requested_campus = int(self.request.data['campus_id'])
            if requested_campus in self.request.campus_context['accessible_campuses']:
                campus_id = requested_campus
                
        serializer.save(campus_id=campus_id)

# User management API
class UserViewSet(CampusAwareViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['get'])
    def campus_users(self, request):
        """Get users for specific campus"""
        campus_id = request.query_params.get('campus_id', request.user.campus_id)
        users = self.get_queryset().filter(campus_id=campus_id)
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

# Event management API
class EventViewSet(CampusAwareViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Apply multi-campus event logic
        if self.request.user.role != 'super_admin':
            queryset = queryset.filter(
                Q(campus_id=self.request.user.campus_id) |
                Q(is_multi_campus=True, allowed_campuses__contains=[self.request.user.campus_id])
            )
            
        return queryset

# Attendance tracking API
class AttendanceViewSet(CampusAwareViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    
    @action(detail=False, methods=['post'])
    def mark_attendance(self, request):
        """Campus-aware attendance marking"""
        event_id = request.data.get('event_id')
        event = Event.objects.get(id=event_id)
        
        # Validate campus access
        if event.campus_id != request.user.campus_id and not event.is_multi_campus:
            return Response(
                {'error': 'Cannot attend event from different campus'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create attendance record
        attendance = Attendance.objects.create(
            event=event,
            user=request.user,
            campus_id=event.campus_id,
            cross_campus_attendance=(event.campus_id != request.user.campus_id)
        )
        
        serializer = self.get_serializer(attendance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

### API URL Configuration

```python
# apps/campus/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampusViewSet

router = DefaultRouter()
router.register(r'campuses', CampusViewSet)

urlpatterns = [
    path('api/v1/', include(router.urls)),
]

# apps/accounts/urls.py
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', ProfileViewSet)

# apps/events/urls.py
router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'attendance', AttendanceViewSet)

# Main URLs configuration
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/campus/', include('apps.campus.urls')),
    path('api/v1/events/', include('apps.events.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
]
```

---

## 📊 Database Optimization

### Campus-Based Indexing Strategy

```python
# Database indexes for performance
class User(AbstractUser):
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE)
    
    class Meta:
        indexes = [
            models.Index(fields=['campus', 'role']),
            models.Index(fields=['campus', 'department']),
            models.Index(fields=['campus', 'is_active']),
        ]

class Event(models.Model):
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE)
    
    class Meta:
        indexes = [
            models.Index(fields=['campus', 'date']),
            models.Index(fields=['campus', 'status']),
            models.Index(fields=['campus', 'organizer']),
        ]

class Attendance(models.Model):
    campus = models.ForeignKey(Campus, on_delete=models.CASCADE)
    
    class Meta:
        indexes = [
            models.Index(fields=['campus', 'event', 'timestamp']),
            models.Index(fields=['campus', 'user']),
            models.Index(fields=['event', 'user'], name='unique_attendance'),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['event', 'user'], 
                name='unique_event_user_attendance'
            )
        ]
```

### Migration Strategy

```python
# Migration for campus enhancement
class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        # Add Campus model
        migrations.CreateModel(
            name='Campus',
            fields=[
                ('id', models.BigAutoField(primary_key=True)),
                ('name', models.CharField(max_length=100)),
                ('code', models.CharField(max_length=10, unique=True)),
                ('domain', models.CharField(max_length=100, unique=True)),
                ('timezone', models.CharField(max_length=50, default='Asia/Manila')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        
        # Add campus to User model
        migrations.AddField(
            model_name='user',
            name='campus',
            field=models.ForeignKey(
                'Campus', 
                on_delete=models.CASCADE,
                null=True,  # Temporary for migration
                blank=True
            ),
        ),
        
        # Create default campuses
        migrations.RunPython(create_default_campuses),
        
        # Assign existing users to SNSU campus
        migrations.RunPython(assign_users_to_snsu),
        
        # Make campus field required
        migrations.AlterField(
            model_name='user',
            name='campus',
            field=models.ForeignKey('Campus', on_delete=models.CASCADE),
        ),
    ]

def create_default_campuses(apps, schema_editor):
    Campus = apps.get_model('accounts', 'Campus')
    campuses = [
        {'id': 1, 'name': 'Surigao del Norte State University', 'code': 'SNSU', 'domain': 'snsu.edu.ph'},
        {'id': 2, 'name': 'SNSU Malimono Campus', 'code': 'MALIMONO', 'domain': 'malimono.snsu.edu.ph'},
        {'id': 3, 'name': 'SNSU Del Carmen Campus', 'code': 'DELCARMEN', 'domain': 'delcarmen.snsu.edu.ph'},
        {'id': 4, 'name': 'SNSU Mainit Campus', 'code': 'MAINIT', 'domain': 'mainit.snsu.edu.ph'},
    ]
    
    for campus_data in campuses:
        Campus.objects.get_or_create(**campus_data)

def assign_users_to_snsu(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    Campus = apps.get_model('accounts', 'Campus')
    
    snsu_campus = Campus.objects.get(code='SNSU')
    User.objects.filter(campus__isnull=True).update(campus=snsu_campus)
```

---

## 🔧 Settings Configuration

### Enhanced Django Settings

```python
# App/settings.py - Enhanced configuration
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Campus-aware configuration
CAMPUS_CONFIG = {
    'DEFAULT_CAMPUS_CODE': 'SNSU',
    'MULTI_CAMPUS_MODE': True,
    'CAMPUS_DATA_ISOLATION': True,
    'CROSS_CAMPUS_EVENTS_ENABLED': True,
}

# Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'eas_db'),
        'USER': os.environ.get('DB_USER', 'eas_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        }
    }
}

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
    'drf_spectacular',  # API documentation
]

LOCAL_APPS = [
    'apps.campus',
    'apps.accounts',
    'apps.events',
    'apps.attendance',
    'apps.reports',
    'apps.notifications',
    'apps.uploads',
    'apps.shared',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# Custom user model
AUTH_USER_MODEL = 'accounts.User'

# Middleware configuration
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.campus.middleware.CampusAuthenticationMiddleware',  # Custom campus middleware
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
        'apps.campus.permissions.CampusAccessPermission',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# CORS configuration for frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
    "https://easuniversity.site",  # Production frontend
]

CORS_ALLOW_CREDENTIALS = True

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{levelname}] {asctime} {module} {process:d} {thread:d} - Campus: {campus_id} - {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/eas.log',
            'formatter': 'verbose',
        },
        'campus_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/campus_operations.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'apps.campus': {
            'handlers': ['campus_file'],
            'level': 'INFO',
            'propagate': True,
        },
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

---

## 🚀 Development Setup Instructions

### 1. Environment Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb eas_db

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load initial campus data
python manage.py loaddata fixtures/campuses.json
```

### 3. Development Server

```bash
# Start Django development server
python manage.py runserver 8000

# In another terminal, start Celery for background tasks
celery -A App worker --loglevel=info
```

---

## 📋 Requirements.txt

```txt
# Core Django
Django==4.2.7
djangorestframework==3.14.0
django-cors-headers==4.3.1
django-filter==23.3

# Database
psycopg2-binary==2.9.7
redis==5.0.1

# Authentication & Security
djangorestframework-simplejwt==5.3.0
django-oauth-toolkit==1.7.1

# File handling
Pillow==10.0.1
django-storages==1.14.2
boto3==1.29.7  # For AWS S3

# API Documentation
drf-spectacular==0.26.5

# Background tasks
celery==5.3.4
django-celery-beat==2.5.0

# Utilities
python-decouple==3.8
django-extensions==3.2.3
python-dateutil==2.8.2

# Testing
pytest-django==4.6.0
factory-boy==3.3.0
coverage==7.3.2

# Development
django-debug-toolbar==4.2.0
ipython==8.17.2
```

---

## 🎯 Integration Points

### Frontend API Integration

The backend APIs are designed to seamlessly integrate with your existing React frontend:

```javascript
// Frontend service integration example
import { campusService } from './campusService.js';

// Campus-aware API calls
const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Authorization': `Token ${getAuthToken()}`,
    'X-Campus-Context': getCurrentUserCampus(),
  }
});

// User service integration
export const userService = {
  async getUsers(campusId = null) {
    const params = campusId ? { campus_id: campusId } : {};
    const response = await apiClient.get('/accounts/users/', { params });
    return response.data;
  },
  
  async createUser(userData) {
    const response = await apiClient.post('/accounts/users/', userData);
    return response.data;
  }
};

// Event service integration
export const eventService = {
  async getEvents(campusId = null) {
    const params = campusId ? { campus_id: campusId } : {};
    const response = await apiClient.get('/events/events/', { params });
    return response.data;
  },
  
  async markAttendance(eventId, attendanceData) {
    const response = await apiClient.post('/events/attendance/mark_attendance/', {
      event_id: eventId,
      ...attendanceData
    });
    return response.data;
  }
};
```

### Mock Data Migration

Your existing mock data will be preserved and enhanced:

```python
# Management command to migrate mock data
class Command(BaseCommand):
    def handle(self, *args, **options):
        # Migrate mock users
        with open('frontend/src/data/mockUsers.json') as f:
            users_data = json.load(f)
            
        for user_data in users_data:
            campus_id = self.map_college_to_campus(user_data['college'])
            User.objects.get_or_create(
                student_id=user_data['studentId'],
                defaults={
                    'campus_id': campus_id,
                    'first_name': user_data['firstName'],
                    'last_name': user_data['lastName'],
                    'email': user_data['email'],
                    'department': user_data['department'],
                    'role': user_data['role'],
                }
            )
```

---

## 🔍 Testing Strategy

### Campus Isolation Testing

```python
# Test campus data isolation
class CampusIsolationTestCase(TestCase):
    def setUp(self):
        self.snsu_campus = Campus.objects.create(name='SNSU', code='SNSU')
        self.malimono_campus = Campus.objects.create(name='Malimono', code='MALIMONO')
        
        self.snsu_user = User.objects.create_user(
            username='snsu_user',
            campus=self.snsu_campus,
            role='student'
        )
        
        self.malimono_user = User.objects.create_user(
            username='malimono_user', 
            campus=self.malimono_campus,
            role='student'
        )

    def test_user_can_only_see_own_campus_events(self):
        snsu_event = Event.objects.create(
            title='SNSU Event',
            campus=self.snsu_campus,
            organizer=self.snsu_user
        )
        
        malimono_event = Event.objects.create(
            title='Malimono Event',
            campus=self.malimono_campus,
            organizer=self.malimono_user
        )
        
        # SNSU user should only see SNSU events
        snsu_events = Event.objects.for_user_campus(self.snsu_user)
        self.assertIn(snsu_event, snsu_events)
        self.assertNotIn(malimono_event, snsu_events)

    def test_super_admin_can_see_all_campuses(self):
        super_admin = User.objects.create_user(
            username='super_admin',
            campus=self.snsu_campus,
            role='super_admin'
        )
        
        all_events = Event.objects.accessible_to_user(super_admin)
        self.assertEqual(all_events.count(), Event.objects.count())
```

---

## 📈 Performance Monitoring

### Campus-Aware Monitoring

```python
# Performance monitoring middleware
class CampusPerformanceMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        response = self.get_response(request)
        
        # Log campus-specific performance metrics
        if hasattr(request, 'campus_context'):
            duration = time.time() - start_time
            logger.info(
                f"Campus {request.campus_context['user_campus_id']} - "
                f"Path: {request.path} - Duration: {duration:.3f}s"
            )
        
        return response
```

---

## 🎉 Party Mode Agents Coordination Summary

**🎭 BMad Orchestrator**: "Perfect! We've analyzed your entire project and created comprehensive backend implementation documentation!"

**👨‍💻 Full-Stack Developer Agent**: "The Django backend architecture perfectly aligns with your React frontend and maintains all campus isolation requirements!"

**📋 Project Manager Agent**: "Implementation roadmap provides clear 4-week delivery schedule with proper milestone tracking!"

**🔒 Security Specialist Agent**: "Campus data isolation implemented at multiple layers with robust authentication and authorization!"

**🏗️ Database Architect Agent**: "Optimized database design with proper indexing and migration strategy preserves all existing data!"

## 📋 Next Steps

1. **Immediate Actions**:
   - Review the backend implementation guide
   - Set up PostgreSQL database
   - Install requirements and run initial migrations

2. **Week 1 Focus**:
   - Implement campus models and authentication
   - Set up basic API endpoints
   - Test campus data isolation

3. **Integration Testing**:
   - Connect React frontend to Django APIs  
   - Validate campus filtering works end-to-end
   - Ensure backward compatibility with existing frontend

4. **Deployment Preparation**:
   - Configure production settings
   - Set up monitoring and logging
   - Implement backup strategies

The backend implementation guide integrates seamlessly with your existing **epics**, **stories**, **PRDs**, and **architecture documentation** while providing separate but coordinated **frontend** and **backend** development paths! 🚀

Would you like me to create additional documentation for specific areas like **API testing**, **deployment strategies**, or **performance optimization**?
