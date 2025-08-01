# 🔌 Django Backend Architecture

### App Structure
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

### Core Django Apps

#### 1. Authentication App
```python