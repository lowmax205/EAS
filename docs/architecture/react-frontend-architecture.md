# ⚛️ React Frontend Architecture

### Component Structure
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

### Core React Components

#### 1. Main Check-In Flow
```jsx
// components/attendance/CheckInFlow.jsx
import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../features/attendance/useAttendance';
import { useGeolocation } from '../../hooks/useGeolocation';
import QRScanner from './QRScanner';
import SelfieCapture from './SelfieCapture';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MapPin, Camera, QrCode, Clock } from 'lucide-react';

const CheckInFlow = () => {
  const [step, setStep] = useState('start'); // start, qr, location, selfie, processing, complete
  const [checkInData, setCheckInData] = useState({});
  const { checkIn, checkOut, todayStatus, loading } = useAttendance();
  const { location, accuracy, getLocation, locationLoading } = useGeolocation();

  useEffect(() => {
    // Get current location on component mount
    getLocation();
  }, []);

  const handleQRScanSuccess = (qrData) => {
    setCheckInData(prev => ({ ...prev, qr_code_data: qrData }));
    setStep('location');
  };

  const handleLocationConfirm = () => {
    setCheckInData(prev => ({
      ...prev,
      location_lat: location.latitude,
      location_lng: location.longitude,
      location_accuracy: accuracy
    }));
    setStep('selfie');
  };

  const handleSelfieCapture = (imageFile) => {
    setCheckInData(prev => ({ ...prev, selfie_image: imageFile }));
    setStep('processing');
    processCheckIn();
  };

  const processCheckIn = async () => {
    try {
      const result = await checkIn({
        ...checkInData,
        device_info: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });

      if (result.success) {
        setStep('complete');
      } else {
        setStep('error');
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      setStep('error');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'start':
        return (
          <Card className="bg-theme-card border-theme">
            <CardHeader>
              <CardTitle className="text-theme flex items-center gap-2">
                <Clock className="w-5 h-5 text-eas-primary" />
                Ready to Check In?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-theme-secondary text-sm">
                Current time: {new Date().toLocaleTimeString()}
              </div>
              {todayStatus?.status === 'not_started' ? (
                <Button 
                  onClick={() => setStep('qr')}
                  className="w-full bg-eas-primary hover:bg-eas-primary/90"
                  disabled={locationLoading}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Start Check-In Process
                </Button>
              ) : (
                <div className="text-center p-4 bg-eas-accent rounded-lg">
                  <p className="text-eas-primary font-medium">
                    Already checked in today
                  </p>
                  <p className="text-sm text-theme-secondary mt-1">
                    First check-in: {todayStatus?.first_check_in}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'qr':
        return (
          <Card className="bg-theme-card border-theme">
            <CardHeader>
              <CardTitle className="text-theme flex items-center gap-2">
                <QrCode className="w-5 h-5 text-eas-primary" />
                Scan QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QRScanner onScanSuccess={handleQRScanSuccess} />
              <Button 
                variant="outline" 
                onClick={() => setStep('start')}
                className="w-full mt-4"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        );

      case 'location':
        return (
          <Card className="bg-theme-card border-theme">
            <CardHeader>
              <CardTitle className="text-theme flex items-center gap-2">
                <MapPin className="w-5 h-5 text-eas-primary" />
                Confirm Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {location ? (
                <>
                  <div className="bg-eas-accent p-3 rounded-lg">
                    <p className="text-sm text-theme">
                      <strong>Latitude:</strong> {location.latitude.toFixed(6)}
                    </p>
                    <p className="text-sm text-theme">
                      <strong>Longitude:</strong> {location.longitude.toFixed(6)}
                    </p>
                    <p className="text-sm text-theme-secondary">
                      Accuracy: ±{accuracy}m
                    </p>
                  </div>
                  <Button 
                    onClick={handleLocationConfirm}
                    className="w-full bg-eas-primary hover:bg-eas-primary/90"
                  >
                    Confirm Location
                  </Button>
                </>
              ) : (
                <div className="text-center p-4">
                  <p className="text-theme-secondary">Getting your location...</p>
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={() => setStep('qr')}
                className="w-full"
              >
                Back to QR Scan
              </Button>
            </CardContent>
          </Card>
        );

      case 'selfie':
        return (
          <Card className="bg-theme-card border-theme">
            <CardHeader>
              <CardTitle className="text-theme flex items-center gap-2">
                <Camera className="w-5 h-5 text-eas-primary" />
                Take Selfie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SelfieCapture onCapture={handleSelfieCapture} />
              <Button 
                variant="outline" 
                onClick={() => setStep('location')}
                className="w-full mt-4"
              >
                Back to Location
              </Button>
            </CardContent>
          </Card>
        );

      case 'processing':
        return (
          <Card className="bg-theme-card border-theme">
            <CardContent className="text-center p-8">
              <div className="animate-spin w-8 h-8 border-2 border-eas-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-theme">Processing your check-in...</p>
            </CardContent>
          </Card>
        );

      case 'complete':
        return (
          <Card className="bg-theme-card border-theme">
            <CardContent className="text-center p-8">
              <div className="w-16 h-16 bg-eas-primary rounded-full flex items-center justify-center mx-auto mb-4">
                ✓
              </div>
              <h3 className="text-lg font-medium text-theme mb-2">
                Check-in Successful!
              </h3>
              <p className="text-theme-secondary text-sm mb-4">
                Welcome to work today. Have a productive day!
              </p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-eas-primary hover:bg-eas-primary/90"
              >
                Continue to Dashboard
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-theme p-4">
      <div className="max-w-md mx-auto pt-safe">
        {renderStep()}
      </div>
    </div>
  );
};

export default CheckInFlow;
```

#### 2. QR Scanner Component
```jsx
// components/attendance/QRScanner.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '../ui/button';
import { AlertCircle } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "qr-scanner-container",
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
      },
      false
    );

    const onScanSuccessHandler = (decodedText, decodedResult) => {
      setIsScanning(false);
      scanner.clear();
      onScanSuccess(decodedText);
    };

    const onScanErrorHandler = (errorMessage) => {
      // Handle scan errors (mostly just noise, don't show to user)
      if (errorMessage.includes('NotFoundException')) {
        // Normal - no QR code in view
        return;
      }
      setError(`Scan error: ${errorMessage}`);
    };

    scanner.render(onScanSuccessHandler, onScanErrorHandler);
    setIsScanning(true);

    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {
          console.log('Scanner cleanup error:', e);
        }
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="space-y-4">
      <div 
        id="qr-scanner-container" 
        ref={scannerRef}
        className="w-full"
        style={{
          // Override html5-qrcode styles to match our theme
          '--qr-scanner-background': 'hsl(var(--background))',
          '--qr-scanner-border': 'hsl(var(--border))',
        }}
      />
      
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="text-center text-sm text-theme-secondary">
        {isScanning ? (
          <p>Position the QR code within the frame to scan</p>
        ) : (
          <p>Initializing camera...</p>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
```

---

