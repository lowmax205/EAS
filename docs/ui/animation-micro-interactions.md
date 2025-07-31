# Animation & Micro-interactions

### Motion Design Principles
- **Purposeful Animation:** All animations serve a functional purpose (feedback, guidance, transitions)
- **Performance Conscious:** Animations optimized for mobile devices and slower connections
- **Accessible by Default:** Respects `prefers-reduced-motion` user settings
- **Campus Consistency:** Animation patterns consistent across all campus implementations

### Key Responsive Animations

**Mobile-Optimized Animations:**
- **QR Scan Success:** Haptic feedback + green checkmark animation (Duration: 800ms, Easing: ease-out)
- **Check-in Confirmation:** Expanding success circle (Duration: 600ms, Easing: ease-in-out)
- **Loading States:** Skeleton loading for cards (Duration: 1200ms, Easing: linear)
- **Navigation Transitions:** Slide transitions for page changes (Duration: 300ms, Easing: ease-in-out)

**Desktop-Enhanced Animations:**
- **Hover Effects:** Subtle scale and shadow transitions (Duration: 200ms, Easing: ease-out)
- **Data Visualization:** Smooth chart animations and transitions (Duration: 800ms, Easing: ease-in-out)
- **Modal Appearances:** Fade-in with backdrop blur (Duration: 250ms, Easing: ease-out)
- **Campus Switching:** Smooth content transitions (Duration: 400ms, Easing: ease-in-out)

**Reduced Motion Alternatives:**
- Replace animations with instant state changes
- Maintain visual feedback through color and text changes
- Preserve functionality while eliminating motion
