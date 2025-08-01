# 🔧 Technical Requirements

### Backend Architecture (Django + DRF)
```
backend/
├── app/                    # Main Django project
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py        # Common settings
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── authentication/    # JWT auth, user management
│   ├── attendance/        # Core attendance logic
│   ├── qr_system/        # QR code generation/validation
│   ├── analytics/        # Reporting and dashboards
│   └── notifications/    # System notifications
├── utils/
│   ├── permissions.py    # Custom permissions
│   ├── validators.py     # Custom field validators
│   └── helpers.py        # Utility functions
├── static/
├── media/
├── requirements.txt
├── .env.local
└── manage.py
```

### Frontend Architecture (React + Vite)
```
frontend/src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── layout/
│   │   ├── AppLayout.jsx      # Main app wrapper
│   │   ├── Header.jsx         # Top navigation
│   │   └── BottomNav.jsx      # Mobile bottom navigation
│   ├── attendance/
│   │   ├── CheckInFlow.jsx    # Main check-in component
│   │   ├── QRScanner.jsx      # QR code scanner
│   │   ├── LocationCapture.jsx # GPS location handler
│   │   ├── SelfieCapture.jsx  # Camera selfie capture
│   │   └── AttendanceStatus.jsx # Today's status display
│   ├── dashboard/
│   │   ├── DashboardHome.jsx  # Main dashboard
│   │   ├── WeeklyChart.jsx    # Attendance chart
│   │   └── RecentActivity.jsx # Activity list
│   └── reports/
│       ├── AttendanceReport.jsx
│       └── WeeklyReport.jsx
├── features/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── useAuth.js         # Authentication hook
│   │   └── AuthContext.jsx    # Auth state management
│   ├── attendance/
│   │   ├── useAttendance.js   # Attendance operations hook
│   │   └── AttendanceContext.jsx
│   └── notifications/
│       └── useNotifications.js
├── hooks/
│   ├── useGeolocation.js      # GPS location hook
│   ├── useCamera.js           # Camera access hook
│   ├── useQRScanner.js        # QR scanning hook
│   └── usePolling.js          # Real-time updates
├── services/
│   ├── api.js                 # Axios configuration
│   ├── auth.service.js        # Authentication API calls
│   ├── attendance.service.js  # Attendance API calls
│   └── qr.service.js          # QR code API calls
├── utils/
│   ├── constants.js           # App constants
│   ├── helpers.js             # Utility functions
│   └── validators.js          # Form validation
├── lib/
│   └── utils.js               # Utility functions
├── test/
│   └── setup.js               # Setup for testing
├── styles/
│   ├── globals.css            # TailwindCSS + EAS theme
│   └── components.css         # Component-specific styles
├── .env.local                # Environment variables
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
└── vite.config.js
```

### API Specifications

#### Authentication Endpoints
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Token refresh
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/password-reset/` - Password reset

#### Event Management Endpoints
- `GET /api/events/` - List events (filtered by role)
- `POST /api/events/` - Create event (organizer/admin)
- `GET /api/events/{id}/` - Event details
- `PUT /api/events/{id}/` - Update event
- `DELETE /api/events/{id}/` - Delete event
- `GET /api/events/{id}/qr/` - Generate QR code

#### Attendance Endpoints
- `GET /api/attendance/verify/{token}/` - Verify QR token
- `POST /api/attendance/submit/` - Submit attendance
- `GET /api/attendance/` - List attendance records
- `GET /api/events/{id}/attendance/` - Event attendance list

#### Reports Endpoints
- `GET /api/reports/attendance/` - Generate attendance report
- `POST /api/reports/export/` - Export report (PDF/CSV)
- `GET /api/analytics/dashboard/` - Dashboard analytics data

### Database Schema (Key Models)

#### User Model (Extended)
```python
class User(AbstractUser):
    role = models.CharField(choices=ROLE_CHOICES)
    student_id = models.CharField(unique=True, null=True)
    department = models.CharField(max_length=100)
    course = models.CharField(max_length=100)
    year_level = models.IntegerField(null=True)
    campus = models.ForeignKey(Campus)
    profile_image = models.URLField(null=True)
    is_verified = models.BooleanField(default=False)
```

#### Event Model
```python
class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    organizer = models.ForeignKey(User)
    campus = models.ForeignKey(Campus)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    location = models.CharField(max_length=200)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    qr_token = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
```

#### Attendance Model
```python
class Attendance(models.Model):
    event = models.ForeignKey(Event)
    student = models.ForeignKey(User)
    timestamp = models.DateTimeField(auto_now_add=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    front_photo = models.URLField()
    back_photo = models.URLField()
    signature = models.URLField()
    is_verified = models.BooleanField(default=True)
```

---

