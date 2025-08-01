# 📋 EAS Project Brief: Mobile Web-Based Event Attendance System

**Project**: A Comprehensive Mobile Web-Based Attendance Monitoring System with Integrated Analytics for School Events of the University  
**Institution**: Surigao del Norte State University (SNSU)  
**Students**: Nilo Jr. Olang, Cricedine P. Peñaranda  
**Document Version**: 1.0  
**Date**: August 1, 2025  
**Status**: Continuing Development - Architecture Revision Required

---

## 🎯 Executive Summary

The Event Attendance System (EAS) is a comprehensive mobile web-based solution designed to address SNSU's critical need for secure, efficient, and fraud-resistant event attendance monitoring. This project continues existing development with a focused approach to meet thesis defense requirements by August 15, 2025.

**Core Problem**: Traditional manual attendance systems are time-consuming, error-prone, and vulnerable to proxy attendance fraud, creating administrative burdens and unreliable data for event management.

**Solution**: Multi-factor authentication system combining QR code scanning, GPS location verification, and selfie capture with real-time analytics and automated reporting.

---

## ⏰ Critical Timeline & Constraints

### Thesis Milestones
- **Thesis Defense**: August 15, 2025 (14 days remaining)
- **Final Submission**: August 18, 2025 (17 days remaining)
- **Current Status**: Backend development phase with required architecture revision

### Retrospective Development Timeline
**May 1, 2025 - August 1, 2025 (3-month development cycle)**
- **Weeks 1-2**: Requirements gathering and initial setup
- **Weeks 3-4**: Database design and authentication system
- **Weeks 5-6**: QR code generation and scanning functionality
- **Weeks 7-8**: GPS integration and location verification
- **Weeks 9-10**: Selfie verification and file upload system
- **Weeks 11-12**: Dashboard and analytics implementation
- **Current Week 13**: Architecture revision and code restructuring

---

## 🔧 Panel-Mandated Technical Requirements

Based on the Minutes of Proposal Defense, the following specifications are **mandatory**:

### Mr. Renz M. Buctuan Requirements:
1. **Instant Upload Feedback**: Real-time confirmation of photo and data submission
2. **Permission-based Location Access**: Request location permission after QR scan
3. **Automatic Form Population**: Auto-fill student information after QR scan
4. **Official Format Export**: Downloadable attendance sheets in school's official format with photos

### Mr. Robert R. Bacarro Requirements:
1. **Title Update**: "Integrated Analytics" included in title [ ]
2. **Analytics Dashboard**: Attendance trends, peak check-in times, anomaly detection
3. **Real-time Data Visualization**: Live charts and statistics
4. **Academic Formatting**: Proper margins, fonts, and reference styling

### Mrs. Unife O. Cagas Requirements:
1. **Objective Update**: "Automated reporting and data exporting" [ ]
2. **Histogram Charts**: Bar charts showing check-in patterns over time
3. **Real-time Dashboard Refresh**: Live updates when forms are submitted

---

## 🎯 Core Features - Thesis Critical Priority

### Tier 1: Essential for Defense (Must Have)

#### **Role-Based Access System**
- **Admin Role**: Full CRUD access (users, events, attendance, campuses)
- **Organizer Role**: Same as Admin except cannot create/delete users and campuses
- **Student Role**: Profile management and attendance participation

#### **QR Code Attendance Flow**
1. Student scans QR code (Google Lens or camera app)
2. Redirect to attendance verification URL
3. Login modal if not authenticated
4. Auto-fill user information from database
5. Capture GPS location (with permission prompt)
6. Take front and back camera photos
7. Display student ID from database
8. Capture digital signature via canvas
9. Submit attendance with instant confirmation

#### **Dashboard & Analytics**
- **Admin/Organizer**: Event overview, attendance statistics, department analytics
- **Student**: Attendance history, upcoming events, profile management
- **Real-time Updates**: Auto-refresh organizer panel with throttling

#### **Reporting System**
- Export attendance data with filtering options
- Official school format with student photos
- CSV/PDF generation capabilities

### Tier 2: Important for Completeness (Should Have)
- Multi-campus support with isolation logic
- Advanced analytics with trend analysis
- Document upload functionality
- Email notification system

### Tier 3: Future Enhancements (Won't Have for Defense)
- AI-powered analytics
- Advanced biometric features
- Certificate generation
- Mobile app versions

---

## 🏗️ Architecture Revision Requirements

### Current Issues Identified:
1. **Unorganized folder structure** requiring immediate reorganization
2. **Code maintainability concerns** needing architectural improvements
3. **Scalability preparation** for thesis demonstration

### Proposed Structure Revision:
```
EAS/
├── docs/                    # Project documentation
├── backend/                 # Django + DRF API
│   ├── app/                # Main Django project
│   │   ├── settings/       # Environment-specific settings
│   │   ├── urls.py         # URL routing
│   │   └── wsgi.py         # WSGI configuration
│   ├── apps/               # Modular Django apps
│   │   ├── authentication/ # JWT auth, user management
│   │   ├── attendance/     # Core attendance logic
│   │   ├── qr_system/     # QR code generation/validation
│   │   ├── analytics/     # Reporting and dashboards
│   │   └── notifications/ # System notifications
│   ├── utils/              # Shared utilities
│   ├── static/             # Static files
│   └── media/              # File storage
├── frontend/               # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/     # shadcn/ui components
│   │   ├── features/       # Feature-based organization
│   │   ├── services/       # API clients
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   ├── lib/            # Library utilities
│   │   ├── test/           # Testing setup
│   │   └── styles/         # Global styles
└── deployment/             # Deployment configurations
```

---

## 📊 Success Metrics & Validation

### Technical Acceptance Criteria:
- [ ] **Multi-factor Authentication**: QR + GPS + Selfie verification working
- [ ] **Real-time Updates**: Dashboard refreshes within 3 seconds of submission
- [ ] **Official Reporting**: Export functionality with school format compliance
- [ ] **Role-based Access**: All three user roles functioning correctly
- [ ] **Mobile Responsiveness**: Works on smartphones and tablets
- [ ] **Performance**: <3 second response time for attendance flow

### Thesis Defense Requirements:
- [ ] **System Demonstration**: Full attendance flow working live
- [ ] **Panel Requirements**: All mandated features implemented
- [ ] **Documentation**: Technical specs and user guides complete
- [ ] **Data Analytics**: Real-time charts and reporting functional

---

## 🔒 Security & Compliance Framework

### Data Protection:
- **Student Privacy**: Secure handling of biometric data (photos, location)
- **Authentication**: JWT-based session management
- **Data Encryption**: Sensitive data encrypted at rest and in transit
- **Access Control**: Role-based permissions strictly enforced

### University Compliance:
- **Academic Data Standards**: Following SNSU data protection policies
- **Audit Trail**: Complete logging of all system activities
- **Backup Systems**: Regular data backups and recovery procedures

---

## 🚀 Implementation Strategy

### Phase 1: Architecture Revision (Days 1-3)
- Reorganize codebase structure
- Implement modular Django apps
- Set up React feature-based organization
- Configure development environment

### Phase 2: Core Development (Days 4-10)
- Complete authentication system
- Implement QR code attendance flow
- Build role-based dashboards
- Integrate GPS and photo capture

### Phase 3: Analytics & Reporting (Days 11-12)
- Real-time dashboard updates
- Export functionality
- Chart implementations

### Phase 4: Testing & Polish (Days 13-14)
- End-to-end testing
- Performance optimization
- Defense preparation

---

## 🛠️ Technology Stack Confirmation

### Backend:
- **Framework**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL (production), SQLite (development)
- **Authentication**: JWT tokens with role-based permissions
- **File Storage**: Cloudinary for images, local storage for documents

### Frontend:
- **Framework**: React 18+ with Vite build tool
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: React Context/hooks
- **HTTP Client**: Axios for API communication

### APIs & Services:
- **Location**: Mapbox API for GPS tracking
- **QR Codes**: QR code generation libraries
- **Signatures**: Canvas-based signature capture
- **Notifications**: Email via Django's SMTP

### Deployment:
- **Hosting**: Render or similar platform
- **Domain**: Custom domain for demo
- **SSL**: HTTPS encryption enabled

---

## 📈 Risk Assessment & Mitigation

### High-Risk Areas:
1. **Time Constraint**: 14 days to defense
   - **Mitigation**: Focus only on Tier 1 features, defer enhancements

2. **Architecture Revision**: Code restructuring complexity
   - **Mitigation**: Incremental refactoring, maintain working features

3. **Real-time Updates**: Technical implementation complexity
   - **Mitigation**: Simple polling mechanism vs complex WebSockets

### Medium-Risk Areas:
1. **GPS Integration**: Device permission and accuracy issues
   - **Mitigation**: Fallback mechanisms and error handling

2. **File Upload**: Photo capture and storage reliability
   - **Mitigation**: Robust error handling and user feedback

---

## 🎓 Academic Integration

### Thesis Chapter Alignment:
- **Chapter 1**: Problem statement and objectives [ ]
- **Chapter 2**: Literature review complete [ ]
- **Chapter 3**: Technical specifications and framework [ ]
- **Chapter 4**: Methodology and development process [ ]
- **Chapter 5**: Implementation and testing (in progress)
- **Chapter 6**: Results and evaluation (pending)

### Research Contribution:
- **Primary**: Multi-factor authentication for educational attendance
- **Secondary**: Real-time analytics for event management
- **Practical**: Scalable solution for Philippine universities

---

## 📞 Stakeholder Communication

### Primary Stakeholders:
- **Thesis Advisors**: Regular progress updates and technical reviews
- **Defense Panel**: Demonstration preparation and requirement compliance
- **SNSU USC**: User acceptance testing and feedback integration

### Success Communication:
- **Technical Documentation**: Complete API documentation and user guides
- **Demo Preparation**: Live system demonstration for defense
- **Results Analysis**: Performance metrics and user feedback compilation

---

## 🔄 Next Steps

1. **Immediate**: Transform to PM agent for detailed PRD creation
2. **Architecture**: Begin codebase reorganization
3. **Development**: Focus on Tier 1 features only
4. **Testing**: Continuous integration and testing setup
5. **Documentation**: Maintain technical documentation throughout

---

**This project brief serves as the foundation for successful thesis completion within the critical timeline while meeting all panel requirements and academic standards.**

---

**Document Status**: APPROVED for PRD Development  
**Next Agent**: Product Manager for detailed requirements specification  
**Priority**: CRITICAL - Thesis Defense Preparation
