# 📱 Mobile-First User Flows

### Flow 1: QR Code Attendance Submission (CRITICAL)

#### Step 1: QR Code Scan & Landing (EAS Green Theme)
```
📱 User Interface Wireframe:

┌─────────────────────────────────┐
│ 🏛️ SNSU Event Attendance System │ 
│ ░░░░░░░░ Light: #ffffff ░░░░░░░░ │
│ ████████ Dark: #0f172a █████████ │
│                                 │
│ 📅 Campus Technology Summit     │
│ 📍 Main Auditorium             │
│ ⏰ Aug 1, 2025 - 9:00 AM       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⚡ Quick Check-in           │ │
│ │ ✅ Scan completed          │ │
│ │ Background: #dcfce7 (light) │ │
│ │ Background: #064e3b (dark)  │ │
│ └─────────────────────────────┘ │
│                                 │
│ 👤 Please log in to continue   │
│ Text: #000000 (light)          │
│ Text: #f8fafc (dark)           │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      🔐 LOGIN               │ │
│ │ Primary: #22c55e (light)    │ │
│ │ Primary: #16a34a (dark)     │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Technical Specifications:**
- **URL Pattern**: `/attend/{encrypted_event_token}`
- **Theme Implementation**: CSS variables with automatic light/dark switching
- **Mobile-Only**: No desktop responsive breakpoints for attendance flow
- **Loading States**: Skeleton loaders with EAS green accent colors
- **Error Handling**: Red (#ef4444) for errors, green theme for success states

#### Step 2: Authentication Modal (EAS Theme)
```
📱 Login Modal Overlay:

┌─────────────────────────────────┐
│ ✕                    🔐 Login   │
│ Modal: rgba(15,23,42,0.8) (dark)│
│ Modal: rgba(0,0,0,0.5) (light) │
│                                 │
│ 📧 Student Email                │
│ ┌─────────────────────────────┐ │
│ │ nolang@ssct.edu.ph         │ │
│ │ Input: #ffffff (light)      │ │
│ │ Input: #1e293b (dark)       │ │
│ │ Focus: #22c55e ring (light) │ │
│ │ Focus: #16a34a ring (dark)  │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🔒 Password                     │
│ ┌─────────────────────────────┐ │
│ │ ••••••••••                  │ │
│ │ Border: #e5e7eb (light)     │ │
│ │ Border: #374151 (dark)      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │        SIGN IN              │ │
│ │ Primary: #22c55e (light)    │ │
│ │ Primary: #16a34a (dark)     │ │
│ │ Text: white on both themes  │ │
│ └─────────────────────────────┘ │
│                                 │
│ Forgot Password? | Register     │
│ Links: #166534 (light)          │
│ Links: #4ade80 (dark)           │
└─────────────────────────────────┘
```

**Technical Specifications:**
- **Component**: Modal overlay with backdrop blur using theme colors
- **Validation**: Real-time form validation with green success, red error states
- **Security**: JWT token generation and storage
- **UX**: Auto-focus on email field, Enter key submission
- **Theme Switching**: Automatic CSS variable updates for light/dark modes

#### Step 3: Auto-filled Attendance Form
```
📱 Attendance Form (Auto-populated):

┌─────────────────────────────────┐
│ ← 📋 Attendance Verification    │
│                                 │
│ ✅ Student Information          │
│ 👤 Nilo Jr. Olang              │
│ 🆔 2021-0001-BSCS              │
│ 🏫 Computer Science Dept.      │
│ 📚 3rd Year                     │
│                                 │
│ 📍 Location Verification        │
│ ┌─────────────────────────────┐ │
│ │ 🌍 Allow Location Access?   │ │
│ │ [Allow] [Not Now]           │ │
│ └─────────────────────────────┘ │
│                                 │
│ 📸 Photo Verification           │
│ ┌───────────┬─────────────────┐ │
│ │ 📷 Front  │ 📷 Back Camera  │ │
│ │ Camera    │                 │ │
│ └───────────┴─────────────────┘ │
└─────────────────────────────────┘
```

**Technical Specifications:**
- **Auto-fill Source**: User profile data from JWT token
- **Location API**: Browser Geolocation API with permission handling
- **Camera Integration**: HTML5 getUserMedia API
- **Progressive Enhancement**: Graceful degradation if APIs unavailable

#### Step 4: Camera Capture Interface
```
📱 Camera Capture Screen:

┌─────────────────────────────────┐
│ ← 📷 Front Camera Capture       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │        📹 LIVE FEED         │ │
│ │                             │ │
│ │         (User Face)         │ │
│ │                             │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ 💡 Position your face clearly   │
│ in the camera frame             │
│                                 │
│      ┌─────┐    ┌─────────┐    │
│      │  ↻  │    │ CAPTURE │    │
│      │Flip │    │   📸    │    │
│      └─────┘    └─────────┘    │
└─────────────────────────────────┘
```

**Technical Specifications:**
- **Camera Stream**: Real-time video preview with overlay guides
- **Capture Quality**: High resolution (min 1280x720) for verification
- **User Guidance**: Visual indicators for proper positioning
- **Accessibility**: Voice guidance option for visually impaired users

#### Step 5: Signature Capture
```
📱 Digital Signature Screen:

┌─────────────────────────────────┐
│ ← ✍️ Digital Signature          │
│                                 │
│ Please sign below to confirm    │
│ your attendance                 │
│                                 │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │     ~Signature Area~        │ │
│ │                             │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────┐    ┌─────────────┐ │
│ │  CLEAR  │    │   SUBMIT    │ │
│ │   🗑️    │    │ ATTENDANCE  │ │
│ └─────────┘    └─────────────┘ │
│                                 │
│ ⚡ Instant confirmation upon    │
│ successful submission           │
└─────────────────────────────────┘
```

**Technical Specifications:**
- **Canvas Implementation**: HTML5 Canvas with touch/mouse events
- **Signature Export**: Base64 encoding for database storage
- **Validation**: Ensure signature is not empty before submission
- **Real-time Feedback**: Loading states and success confirmation

#### Step 6: Submission Confirmation (Panel Requirement)
```
📱 Success Confirmation:

┌─────────────────────────────────┐
│        ✅ SUCCESS!              │
│                                 │
│    Attendance Recorded!         │
│                                 │
│ 👤 Student: Nilo Jr. Olang     │
│ 📅 Event: Campus Tech Summit   │
│ ⏰ Time: Aug 1, 2025 9:15 AM   │
│ 📍 Location: Verified ✓        │
│ 📸 Photos: Captured ✓          │
│ ✍️ Signature: Recorded ✓       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │     VIEW MY ATTENDANCE      │ │
│ │        HISTORY              │ │
│ └─────────────────────────────┘ │
│                                 │
│ Thank you for attending!        │
└─────────────────────────────────┘
```

**Technical Specifications:**
- **Instant Feedback**: Immediate confirmation without page reload
- **Data Display**: Show submitted information for verification
- **Navigation**: Direct link to student dashboard
- **Notification**: Optional browser notification for confirmation

---

### Flow 2: Real-time Organizer Dashboard (EAS Theme + Simple Polling)

#### Dashboard Overview Layout (EAS Green Theme)
```
💻 Desktop Dashboard (Light Theme):

┌─────────────────────────────────────────────────────────────┐
│ 🏛️ SNSU EAS │ 📊 Dashboard │ 👤 John Organizer │ 🔔 3 │ ⚙️ │
│ Header: #ffffff │ Text: #000000 │ Primary: #22c55e          │
├─────────────────────────────────────────────────────────────┤
│ Background: #ffffff                                         │
│                                                             │
│ 📈 Live Event Analytics           📅 Active Events          │
│ ┌─────────────────────────────┐   ┌─────────────────────────┐ │
│ │ 📊 Campus Tech Summit       │   │ 🟢 Tech Summit (Live)  │ │
│ │ Card: #ffffff               │   │ Success: #22c55e        │ │
│ │ Border: #e5e7eb             │   │ 👥 127 attendees       │ │
│ │ � 127/150 Attended         │   │ ⏰ Started 9:00 AM     │ │
│ │ 📈 Peak: 9:15 AM (43 in 5m) │   │                         │ │
│ │ ┌─ Bar Chart (EAS Green) ─┐ │   │ 🟡 Workshop (Later)     │ │
│ │ │ ████████████████████    │ │   │ Warning: #f59e0b        │ │
│ │ │ Bars: #22c55e           │ │   │ 👥 0 attendees         │ │
│ │ │ 9:00 9:15 9:30 9:45     │ │   │ ⏰ Starts 2:00 PM      │ │
│ │ └─────────────────────────┘ │   └─────────────────────────┘ │
│ └─────────────────────────────┘   Polling: Every 10 seconds │
│                                                             │
│ 🎯 Quick Actions                  📊 Department Breakdown   │
│ ┌─────────────────────────────┐   ┌─────────────────────────┐ │
│ │ ➕ Create Event             │   │ 💻 CS: 45 (35%)        │ │
│ │ Button: #22c55e, #ffffff    │   │ Primary: #166534        │ │
│ │ 📄 Export Reports           │   │ ⚙️ Engineering: 38     │ │
│ │ 👥 Manage Attendees         │   │ 🧪 Science: 28         │ │
│ │ 📈 View Analytics           │   │ 📚 Others: 16          │ │
│ └─────────────────────────────┘   └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

💻 Desktop Dashboard (Dark Theme):

┌─────────────────────────────────────────────────────────────┐
│ 🏛️ SNSU EAS │ 📊 Dashboard │ 👤 John Organizer │ 🔔 3 │ ⚙️ │
│ Header: #1e293b │ Text: #f8fafc │ Primary: #16a34a          │
├─────────────────────────────────────────────────────────────┤
│ Background: #0f172a                                         │
│                                                             │
│ 📈 Live Event Analytics           📅 Active Events          │
│ ┌─────────────────────────────┐   ┌─────────────────────────┐ │
│ │ 📊 Campus Tech Summit       │   │ 🟢 Tech Summit (Live)  │ │
│ │ Card: #1e293b               │   │ Success: #16a34a        │ │
│ │ Border: #374151             │   │ 👥 127 attendees       │ │
│ │ 👥 127/150 Attended         │   │ ⏰ Started 9:00 AM     │ │
│ │ 📈 Peak: 9:15 AM (43 in 5m) │   │                         │ │
│ │ ┌─ Bar Chart (EAS Green) ─┐ │   │ 🟡 Workshop (Later)     │ │
│ │ │ ████████████████████    │ │   │ Warning: #f59e0b        │ │
│ │ │ Bars: #16a34a           │ │   │ 👥 0 attendees         │ │
│ │ │ 9:00 9:15 9:30 9:45     │ │   │ ⏰ Starts 2:00 PM      │ │
│ │ └─────────────────────────┘ │   └─────────────────────────┘ │
│ └─────────────────────────────┘   Simple Polling Strategy   │
│                                                             │
│ 🟢 Live Updates (10s intervals) 📊 Real-time Status        │
│ Status: #4ade80 │ Accent: #064e3b                          │
└─────────────────────────────────────────────────────────────┘
```

**Technical Specifications:**
- **Real-time Strategy**: Simple 10-second polling (no WebSocket complexity)
- **Theme System**: CSS variables automatically switch light/dark colors
- **Chart Colors**: EAS green (#22c55e light, #16a34a dark) for data visualization
- **Auto-refresh Indicators**: Green pulse animation during updates
- **Performance**: Optimized queries with caching to handle polling load

#### Mobile Organizer Dashboard
```
📱 Mobile Dashboard (Responsive):

┌─────────────────────────────────┐
│ ☰ 🏛️ SNSU EAS       🔔3 👤   │
├─────────────────────────────────┤
│                                 │
│ 🟢 Campus Tech Summit (LIVE)    │
│ ┌─────────────────────────────┐ │
│ │ 👥 127/150 Attended (85%)   │ │
│ │ 📈 Peak: 9:15 AM (43/5min)  │ │
│ │ ⏰ Started: 9:00 AM         │ │
│ │                             │ │
│ │ Check-in Pattern:           │ │
│ │ ████████████████████        │ │
│ │ 9:00  9:15  9:30  9:45     │ │
│ └─────────────────────────────┘ │
│                                 │
│ 🎯 Quick Actions                │
│ ┌───────────┬─────────────────┐ │
│ │ 📄 Export │ 👥 Manage      │ │
│ │ Reports   │ Attendees      │ │
│ └───────────┴─────────────────┘ │
│                                 │
│ 🏫 Department Breakdown         │
│ 💻 Computer Science: 45 (35%)   │
│ ⚙️ Engineering: 38 (30%)        │
│ 🧪 Natural Science: 28 (22%)    │
│ 📚 Others: 16 (13%)             │
└─────────────────────────────────┘
```

**Technical Specifications:**
- **Mobile Navigation**: Collapsible hamburger menu
- **Touch Optimization**: Large touch targets (44px minimum)
- **Swipe Gestures**: Swipe between dashboard sections
- **Performance**: Optimized for mobile networks and battery

---
