# 🎓 EAS-React (Event Attendance System)

**A Modern Event Attendance Management System for Universities**

[![Live Demo](https://img.shields.io/badge/Live_Demo-eas--university.site-blue)](https://easuniversity.site)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.3-38B2AC.svg)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-000000.svg)](https://ui.shadcn.com/)

---

## 📋 Project Overview

Surigao del Norte State University (SNSU) required a modern, mobile-friendly system to manage university events and automate attendance tracking using digital means. The manual logging process was error-prone, slow, and lacked analytics. The Event Attendance System (EAS) was built to address these issues.

### 📚 **Complete Documentation Hub**
**[📖 Access Full Documentation →](docs/)**

Our comprehensive documentation includes:
- **🏗️ [Multi-Campus Architecture](docs/architecture/)** - Complete technical blueprint with sharded components
- **📋 [Product Requirements](docs/prd/)** - Detailed PRD with all requirements and specifications
- **🎯 [Epic Definitions](docs/epics/)** - Feature roadmap with progress tracking
- **� [User Stories](docs/stories/)** - Implementation-ready development tasks
- **�💻 [Development Standards](docs/DEVELOPMENT.md)** - Coding guidelines and patterns
- **🧪 [Testing Strategy](docs/TESTING.md)** - Campus isolation and CI/CD procedures
- **�️ [Critical Gaps Roadmap](docs/frontend-critical-gaps-roadmap.md)** - Development priorities

## Requirements

* **Must Have**

  * Role-based authentication (student, organizer, admin)
  * Event CRUD with scheduling, location, category
  * Dynamic QR generation for check-in and check-out
  * Real-time validation and attendance logging
  * Dashboard analytics per event/user
* **Should Have**

  * Location/GPS verification using the Mapbox API
  * User registration with email verification
  * Token expiration & validation logic
  * Exportable attendance reports (PDF/Excel)
  * Event notifications to students
  * Mobile app support (student-focused)
  * Audit log of key actions (admin accountability)
  * Multi-campus support with campus isolation logic
  * Organizer profiles with custom logo and name displayed per event
  * Student profile with student number, program, year level, department, and course info
  * Department-based and course-based attendance reports
  * Student notification preferences (email, in-app opt-in)
  * API rate limiting and abuse detection
  * Profile uploads and digital signature support
  * Combined User/Event Management UI
  * Attendance Management UI with full CRUD
  * Analytics data integration via Cloudflare API
  * System resource metrics via Render/Fly.io/Oracle Cloud API
  * Report & Analytics page with tabbed navigation
  * Admin Dashboard with summaries, calendar, and quick access
  * Profile page for user profile editing, file upload, signature
  * Image uploads using **ImageKit.io**
  * File/document uploads using **Mega and Cloud API**
* **Could Have**

  * In-app event announcements
  * Certificate generation (future implementation)
* **Won’t Have**

  * Biometric attendance
  * Offline sync support


## 📁 Project Structure Overview

```
EAS/
├── frontend/             # React + Vite + Tailwind app
└── backend/              # Django + DRF API
```

## 📂 Frontend (React + Vite + TailwindCSS with shadcn/ui)

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/           # Images, logos, global styles
│   ├── components/       # shadcn/ui components and custom EAS components
│   │   ├── ui/           # shadcn/ui base components (button, card, dialog, etc.)
│   │   ├── forms/        # Custom form components using shadcn/ui
│   │   ├── layout/       # Layout components (header, sidebar, footer)
│   │   ├── charts/       # Chart components for analytics
│   │   └── common/       # Reusable EAS-specific components
│   ├── features/         # Feature-level slices with shadcn/ui integration
│   │   ├── auth/         # Login, Register, Forgot password with custom forms
│   │   ├── dashboard/    # Dashboard with shadcn/ui cards and charts
│   │   ├── attendance/   # Attendance management with data tables
│   │   ├── events/       # Event CRUD with shadcn/ui dialogs and forms
│   │   ├── users/        # User management with data tables and forms
│   │   ├── reports/      # Analytics with shadcn/ui charts and export
│   │   ├── profile/      # Profile with shadcn/ui forms and upload components
│   │   ├── notifications/
│   │   ├── settings/     # Theme preferences with shadcn/ui toggles
│   ├── layouts/          # Page layouts using shadcn/ui components
│   ├── hooks/            # Custom React hooks for theme and state
│   ├── lib/              # Utility functions, shadcn/ui utils, theme helpers
│   │   ├── utils.js      # shadcn/ui utility functions
│   │   ├── theme.js      # EAS theme configuration and helpers
│   │   └── upload.js     # File upload utilities
│   ├── services/         # Axios API clients (auth, events, etc.)
│   ├── routes/           # Route definitions and guards
│   ├── App.jsx
│   ├── main.jsx
│   ├── tailwind.config.js # Custom EAS theme with shadcn/ui integration
│   └── components.json   # shadcn/ui configuration
├── .env
├── vite.config.js
└── package.json
```


## 📂 Backend (Django + DRF)

```
backend/
├── eas_api/
│   ├── settings.py       # Config with env + CORS + Mega/ImageKit keys
│   ├── urls.py           # Project-level routes
│   └── wsgi.py
│
├── apps/
│   ├── accounts/         # User models, roles, profile upload/signature
│   ├── events/           # Events + QR logic
│   ├── attendance/       # Attendance tracking + logs
│   ├── reports/          # PDF/Excel generators
│   ├── notifications/    # In-app/email notifications
│   ├── audit/            # Audit logs, system logs
│   ├── analytics/        # Cloudflare + system metrics APIs
│   ├── uploads/          # ImageKit/Mega integrations
│   └── shared/           # Shared models/utilities (choices, enums)
│
├── static/
├── media/
├── manage.py
├── requirements.txt
└── .env
```


## 🗂️ Notes

* ImageKit and Mega logic lives in `frontend/lib/upload.js` and `backend/apps/uploads/`
* PDF/Excel logic in `reports/exporter.py`
* Cloudflare + Render/Fly APIs hit from `analytics/clients/`
* Profile uploads and signature saved via `accounts/views.py`

### 📦 File Storage Integrations

#### 🔼 Image Uploads (e.g., avatars, event banners)

* Provider: **ImageKit.io**
* Frontend handles direct uploads with real-time preview
* Server validates signed upload policy (optional)
* Stored image URL saved in `avatar_url`, `logo_url`, etc.

#### 📁 File/Document Uploads (e.g., clearance, ID photos)

* Provider: **Mega Cloud**
* Use Mega SDK or HTTP API
* Upload documents via user profile page or admin panel
* Return sharable document link saved in `user_files`

### 📄 Profile Page

* Profile view/edit fields using shadcn/ui forms:
  * Name, email, avatar with form validation
  * Student ID, department, course, year level with select components
  * Password change with secure input components
* Upload section with shadcn/ui file input components:
  * ID, clearance, other school docs
  * ImageKit for avatars; Mega for school docs
  * Progress indicators and upload status
* Signature Canvas with shadcn/ui dialog integration:
  * `react-signature-canvas` in a modal dialog
  * Save/clear actions with shadcn/ui buttons

### 📊 Report & Analytics Page

* Route: `/reports`
* **3 Tabs using shadcn/ui Tabs component:**
  1. **Overview**
     * Attendance statistics with shadcn/ui charts and cards
     * Top attended events in data tables
     * Export buttons with download icons
  2. **Website Analytics**
     * Cloudflare API charts using shadcn/ui chart components
  3. **System Performance**
     * Resource usage metrics in progress bars and cards
     * CPU/RAM/disk usage with visual indicators

### 🧭 Admin Dashboard Page

* Route: `/dashboard`
* Components using shadcn/ui cards and grid layout:
  * **Quick Actions**: Navigation cards with icons
  * **Attendance Summary**: Stat cards with real-time updates
  * **Current Events**: Event cards with status badges
  * **Activity Logs**: Data table with pagination
  * **Mini Calendar Widget**: Custom calendar component
  * **Charts**: Bar charts and pie charts for analytics

### 👥 Combined User & Event Management Page

* Single route (e.g., `/admin/manage`)
* shadcn/ui Tabs component with:
  * **Tab 1**: User Management (data tables with filters and actions)
  * **Tab 2**: Event Management (cards and dialogs for CRUD operations)

### ✅ Attendance Management Page

* Dedicated page `/attendance`
* shadcn/ui data table with:
  * CRUD operations via dialogs
  * Advanced filtering with select components
  * Export functionality with button variants

### 📊 Analytics Data (via Cloudflare API)

* **Cloudflare Insights**:

  * Website traffic (visits, locations, device types)
  * Top pages
  * Bandwidth usage

* **Implementation**:

  * Use Cloudflare API (`/zones/:zone_id/analytics/dashboard`)
  * Cache data and display on admin dashboard

### 💻 System & Hardware Metrics

* Use Render Hosting, Fly.io, or Oracle Cloud API
* Show metrics like:

  * CPU/memory usage
  * Server uptime
  * Request volume

## Implementation (Additions)

24. Configure ImageKit.io for profile and event image uploads
25. Integrate Mega API for document uploads on profile page
26. Implement shadcn/ui components with EAS theme integration
27. Set up theme-aware component system with dark/light mode support
28. Create custom utility classes for seamless theme transitions

## Milestones

* [ ] Base models and role system
* [ ] shadcn/ui component library setup with EAS theme
* [ ] Theme-aware layout system implementation
* [ ] Event CRUD + QR generation logic with shadcn/ui forms
* [ ] QR scan validation endpoint
* [ ] Frontend QR scanner UI with shadcn/ui components
* [ ] Attendance dashboard with shadcn/ui charts and cards
* [ ] Report export logic with shadcn/ui tables
* [ ] User registration & management with shadcn/ui forms
* [ ] Dark/light theme toggle with smooth transitions
* [ ] Notification alert system using shadcn/ui toast
* [ ] Audit logs implementation with data tables
* [ ] Mobile app for students
* [ ] Multi-campus access control
* [ ] Organization profile and event branding
* [ ] Department/course filters with shadcn/ui select components
* [ ] Rate limiting & abuse tracking
* [ ] Notification preferences UI with shadcn/ui switches
* [ ] Cloudflare traffic dashboard with custom charts
* [ ] Hosting system usage metrics with progress indicators
* [ ] Profile upload + signature capture with shadcn/ui dialogs
* [ ] Unified User/Event tabbed UI using shadcn/ui tabs
* [ ] Attendance management CRUD UI with data tables
* [ ] Report page with 3-tab analytics using shadcn/ui components
* [ ] Admin dashboard with shadcn/ui cards and quick actions
* [ ] ImageKit integration for images
* [ ] Mega integration for file/document uploads

## Gathering Results

Post-deployment, success will be measured by:

* 95% of events using automated attendance
* Admins reporting <5% error in scanned data
* <3 second scan-to-response time
* Admins using attendance reports and dashboard filters daily
* Verified profile and document submissions for 90% of users
* Analytics charts showing steady website usage trends

## Future Enhancements

* In-app event announcements
* Certificate generation system for qualifying attendees

## 🎨 Design System & Components

### shadcn/ui Integration

The EAS system uses **shadcn/ui** as the foundation for all UI components, customized with our EAS theme:

#### 🌈 Custom EAS Theme
- **Light Theme**: Clean white backgrounds with green primary colors (`#22c55e`)
- **Dark Theme**: Dark navy backgrounds with deeper green accents (`#16a34a`)
- **Theme-aware Components**: All shadcn/ui components automatically adapt to light/dark modes
- **Custom Utilities**: Theme transition classes for smooth mode switching

#### 🧩 Component Architecture
```
components/
├── ui/                   # shadcn/ui base components
│   ├── button.jsx        # Custom styled buttons with EAS theme
│   ├── card.jsx          # Cards with theme-aware shadows
│   ├── dialog.jsx        # Modals and dialogs
│   ├── form.jsx          # Form components with validation
│   ├── table.jsx         # Data tables with sorting/filtering
│   ├── chart.jsx         # Analytics charts
│   └── ...               # Other shadcn/ui components
├── forms/                # Composite form components
│   ├── LoginForm.jsx     # Login with shadcn/ui inputs
│   ├── EventForm.jsx     # Event creation/editing
│   └── ProfileForm.jsx   # User profile editing
├── layout/               # Layout components
│   ├── Header.jsx        # Navigation with theme toggle
│   ├── Sidebar.jsx       # Navigation sidebar
│   └── DashboardLayout.jsx
└── common/               # EAS-specific components
    ├── QRScanner.jsx     # QR code scanning interface
    ├── AttendanceCard.jsx # Attendance display cards
    └── EventCard.jsx     # Event display cards
```

#### 🎯 Theme Implementation
- Uses custom CSS variables and Tailwind utilities (`theme-transition`, `bg-theme`, `text-theme`)
- All components follow EAS color scheme with semantic color usage
- Smooth transitions between light/dark modes
- Consistent spacing and typography using Inter font

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

**Project Maintainer**: [lowmax205](https://github.com/lowmax205)

**Institution**: Surigao del Norte State University (SNSU)

**Live Demo**: [easuniversity.site](https://easuniversity.site)

**Issues**: [GitHub Issues](https://github.com/lowmax205/EAS-React/issues)

---

## 🙏 Acknowledgments

- **Surigao del Norte State University** for project requirements
- **React & Vite Teams** for excellent development tools
- **TailwindCSS** for the outstanding CSS framework
- **shadcn/ui** for beautiful, accessible UI components with perfect theming support
- **Mapbox** for location services integration
- **Lucide React** for beautiful iconography
- **ImageKit.io** for image uploads
- **Mega Cloud** for file/document storage
- **Cloudflare** for analytics and performance monitoring
- **Render/Fly.io/Oracle Cloud** for system metrics
- **Django & DRF** for robust backend API development
- **Mapbox API** for location services
- **All contributors** who helped shape this project

---

**⭐ If you find this project helpful, please give it a star!**

---

_Last Updated: July 29, 2025_
