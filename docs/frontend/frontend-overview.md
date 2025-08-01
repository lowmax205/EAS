# 🎯 Frontend Overview

### Design Philosophy
**Mobile-Only Attendance, Desktop Dashboard, Performance-Optimized**

The EAS frontend prioritizes mobile user experience for attendance submission (no desktop fallback) while providing comprehensive desktop dashboards for organizers and admins. The attendance form is exclusively mobile-optimized since physical presence verification requires mobile device capabilities (camera, GPS, touch signature).

### Key Design Principles
1. **Mobile-Only Attendance**: Attendance forms work exclusively on mobile devices
2. **Simple Polling**: 5-second interval polling for real-time updates (no WebSocket complexity)
3. **No Image Compression**: Raw camera captures for maximum quality and simplicity
4. **Green Theme**: Professional SNSU branding with accessibility-compliant contrast
5. **Performance First**: <3 second load times with optimized assets
6. **Theme Consistency**: Unified light/dark theme system across all interfaces

---
