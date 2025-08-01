# Epic 2: QR Code Attendance Flow (CRITICAL - Panel Requirement)

### Story 2.1: QR Code Generation for Events
**As an** organizer  
**I want to** generate unique QR codes for each event  
**So that** students can easily access the attendance form

**Acceptance Criteria:**
- [ ] Unique QR code generated for each event
- [ ] QR code contains encrypted event ID and validation token
- [ ] QR codes expire after event end time
- [ ] QR code leads to attendance verification URL
- [ ] Organizer can regenerate QR codes if needed

**Technical Specs:**
- Python `qrcode` library for QR generation
- Encrypted URL parameters using Django's signing framework
- Time-based expiration validation
- QR code image storage in media files

### Story 2.2: Mobile QR Code Scanning & Redirect
**As a** student  
**I want to** scan QR codes with my phone camera  
**So that** I can quickly access the attendance form

**Acceptance Criteria:**
- [ ] QR code scannable via Google Lens or camera apps
- [ ] Redirect to mobile-optimized attendance page
- [ ] URL validation and error handling for invalid/expired codes
- [ ] Clear instructions for students on QR scanning

**Technical Specs:**
- Mobile-responsive attendance form URL
- URL parameter validation and decryption
- Error pages for invalid/expired QR codes
- Progressive Web App (PWA) features for mobile optimization

### Story 2.3: Attendance Verification Flow (PANEL MANDATED)
**As a** student  
**I want to** complete attendance verification quickly  
**So that** my presence is accurately recorded

**Acceptance Criteria:**
- [ ] **Login Check**: Show login modal if not authenticated
- [ ] **Auto-fill Information**: Student data populated from database after login
- [ ] **Location Permission**: Request GPS permission after QR scan
- [ ] **GPS Capture**: Automatic location capture with permission approval
- [ ] **Photo Capture**: Front and back camera photos with event background
- [ ] **Student ID Display**: Show student ID from database
- [ ] **Digital Signature**: Canvas-based signature capture
- [ ] **Instant Feedback**: Real-time confirmation of successful submission
- [ ] **Form Validation**: All fields required before submission

**Technical Specs:**
- Browser Geolocation API for GPS capture
- HTML5 Camera API for photo capture
- Canvas element for signature capture
- Real-time form validation with error messaging
- Cloudinary integration for image uploads
- WebSocket or polling for instant submission feedback

---
