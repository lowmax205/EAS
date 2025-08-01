# 🎨 EAS Theme Implementation

### TailwindCSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // EAS Primary Colors
        primary: {
          400: "#4ade80", // Light accent
          500: "#22c55e", // Light theme primary
          600: "#16a34a", // Dark theme primary
          700: "#166534", // Deep accent
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // EAS Secondary/Neutral Colors
        secondary: {
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // Theme-aware semantic colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      // EAS specific animations
      animation: {
        "pulse-green": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### CSS Variables (Global Styles)
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light Theme */
    --background: 0 0% 100%;
    --foreground: 0 0% 0%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 0%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 0%;
    --primary: 142 71% 45%; /* #22c55e */
    --primary-foreground: 0 0% 100%;
    --secondary: 210 40% 98%;
    --secondary-foreground: 0 0% 0%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 210 40% 96%;
    --accent-foreground: 222 84% 5%;
    --destructive: 0 62% 30%;
    --destructive-foreground: 210 40% 98%;
    --border: 214 32% 91%;
    --input: 0 0% 100%;
    --ring: 142 71% 45%; /* #22c55e */
    --radius: 0.5rem;
  }

  .dark {
    /* Dark Theme */
    --background: 222 84% 5%; /* #0f172a */
    --foreground: 210 40% 98%; /* #f8fafc */
    --card: 217 33% 17%; /* #1e293b */
    --card-foreground: 210 40% 98%;
    --popover: 217 33% 17%;
    --popover-foreground: 210 40% 98%;
    --primary: 142 70% 35%; /* #16a34a */
    --primary-foreground: 0 0% 100%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62% 30%;
    --destructive-foreground: 210 40% 98%;
    --border: 215 28% 32%;
    --input: 217 33% 17%;
    --ring: 142 70% 35%; /* #16a34a */
  }
}

/* EAS Custom Components */
@layer components {
  /* Mobile-only attendance components */
  .mobile-only {
    @apply block;
  }
  
  @screen md {
    .mobile-only {
      @apply hidden;
    }
  }
  
  /* EAS themed buttons */
  .btn-eas-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90;
    @apply border border-primary shadow-sm;
    @apply transition-all duration-200;
  }
  
  .btn-eas-secondary {
    @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
    @apply border border-border;
  }
  
  /* EAS themed cards */
  .card-eas {
    @apply bg-card text-card-foreground border border-border;
    @apply rounded-lg shadow-sm;
    @apply transition-all duration-200;
  }
  
  .card-eas:hover {
    @apply shadow-md border-primary/20;
  }
  
  /* Live status indicators */
  .status-live {
    @apply inline-flex items-center gap-1;
    @apply text-primary font-medium;
  }
  
  .status-live::before {
    content: '';
    @apply w-2 h-2 bg-primary rounded-full;
    @apply animate-pulse-green;
  }
  
  /* Mobile touch targets */
  .touch-target {
    @apply min-h-[44px] min-w-[44px];
    @apply p-3;
  }
  
  /* Theme transition */
  .theme-transition {
    @apply transition-colors duration-300 ease-in-out;
  }
}

/* EAS specific utilities */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .bg-gradient-eas {
    background: linear-gradient(135deg, 
      hsl(var(--primary)) 0%, 
      hsl(var(--primary) / 0.8) 100%
    );
  }
  
  .border-gradient-eas {
    border-image: linear-gradient(135deg, 
      hsl(var(--primary)), 
      hsl(var(--primary) / 0.5)
    ) 1;
  }
}
```

### Theme Context Provider
```typescript
// contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('eas-theme') as Theme;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('eas-theme', theme);
    
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' : 'light';
      setResolvedTheme(systemTheme);
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      setResolvedTheme(theme);
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

### Core Component Library (shadcn/ui Based)

#### 1. Form Components (EAS Theme)
```typescript
// Enhanced Input with EAS theme validation states
<Input 
  variant="default|error|success" 
  size="sm|md|lg"
  placeholder="Enter student ID"
  error="Invalid student ID format"
  success="Student ID verified"
  className={cn(
    "border-border bg-input text-foreground",
    "focus:ring-ring focus:border-ring",
    "placeholder:text-muted-foreground"
  )}
/>

// Select with EAS green theme
<Select
  options={departments}
  searchable={true}
  placeholder="Select department"
  onSelectionChange={handleDepartmentChange}
  className={cn(
    "bg-card border-border text-foreground",
    "focus:ring-primary focus:border-primary"
  )}
/>

// File upload with green progress indicators
<FileUpload
  accept="image/*"
  maxSize="5MB"
  preview={true}
  onUpload={handleImageUpload}
  loading={uploadInProgress}
  progressColor="var(--primary-500)" // EAS green
  successColor="var(--primary-600)"
/>
```
```

#### 2. Navigation Components
```typescript
// Role-based navigation
<Navigation 
  userRole="admin|organizer|student"
  currentPath="/dashboard"
  notifications={unreadCount}
/>

// Breadcrumb navigation
<Breadcrumb 
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Events", href: "/events" },
    { label: "Create Event", href: "/events/create" }
  ]}
/>
```

#### 3. Data Display Components
```typescript
// Real-time data table
<DataTable
  data={attendanceRecords}
  columns={tableColumns}
  realTimeUpdates={true}
  pagination={true}
  filters={["department", "event", "date"]}
  exportOptions={["csv", "pdf"]}
/>

// Analytics charts
<Chart
  type="bar|line|pie"
  data={chartData}
  realTime={true}
  refreshInterval={10000}
  responsive={true}
/>
```

#### 4. Mobile-Specific Components (EAS Theme)
```typescript
// Camera capture component with EAS styling
<CameraCapture
  mode="front|back"
  onCapture={handlePhotoCapture}
  preview={true}
  retakeOption={true}
  className={cn(
    "rounded-lg border-2 border-primary/20",
    "bg-card shadow-lg"
  )}
  overlayColor="var(--primary-500)"
  guideColor="rgba(34, 197, 94, 0.3)" // EAS green overlay
/>

// Signature canvas with EAS green theme
<SignatureCanvas
  width="100%"
  height="200px"
  onSave={handleSignatureSave}
  onClear={handleSignatureClear}
  penColor="var(--foreground)" // Theme-aware pen color
  backgroundColor="var(--card)" // Theme-aware background
  className={cn(
    "border-2 border-dashed border-primary/30",
    "rounded-lg bg-card"
  )}
/>

// GPS location component with theme integration
<LocationCapture
  onLocationReceived={handleLocationCapture}
  accuracy="high"
  timeout={10000}
  showMap={true}
  mapTheme="auto" // Follows system theme
  markerColor="var(--primary-500)" // EAS green marker
  className="rounded-lg overflow-hidden border border-border"
/>
```

---
