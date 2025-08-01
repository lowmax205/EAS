# 📋 Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React 18      │    │   Django 5.2.4   │    │  PostgreSQL     │
│   Frontend      │◄──►│   REST API       │◄──►│   Database      │
│   (Mobile-First)│    │   (JWT Auth)     │    │   (Primary)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Device APIs   │    │   File Storage   │    │   Redis Cache   │
│   Camera/GPS/QR │    │   (Media Files)  │    │   (Sessions)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack
- **Backend**: Django 5.2.4, Django REST Framework, JWT Authentication
- **Frontend**: React 18, Vite, TailwindCSS, shadcn/ui components
- **Database**: PostgreSQL (primary), Redis (sessions/cache)
- **Mobile APIs**: Camera API, Geolocation API, QR Scanner
- **Real-time**: Simple polling (10-second intervals)
- **Theme**: EAS Green Theme (from legacy frontend)

---
