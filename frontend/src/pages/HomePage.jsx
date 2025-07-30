/**
 * HomePage - Landing page component with features showcase and call-to-action
 */

import React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Smartphone,
  MapPin,
  Camera,
  BarChart3,
  Shield,
  ArrowRight,
} from "lucide-react";
import Button from "../components/ui/Button";
import SNSULogo from "../assets/images/SNSU-Logo.png";
import { logUserInteraction } from "../components/common/devLogger";
import {
  APP_NAME,
  APP_DESCRIPTION,
  UNIVERSITY_NAME,
  HOME_FEATURES,
  HOW_IT_WORKS_STEPS,
} from "../components/common/constants/index";

/**
 * Feature Card Component
 */
const FeatureCard = ({ icon, title, description }) => {
  const getIconComponent = (iconName) => {
    const icons = {
      CheckCircle: (
        <CheckCircle className="w-8 h-8 text-primary-600 dark:text-primary-400 theme-transition" />
      ),
      Smartphone: (
        <Smartphone className="w-8 h-8 text-primary-600 dark:text-primary-400 theme-transition" />
      ),
      MapPin: (
        <MapPin className="w-8 h-8 text-primary-600 dark:text-primary-400 theme-transition" />
      ),
      Camera: (
        <Camera className="w-8 h-8 text-primary-600 dark:text-primary-400 theme-transition" />
      ),
      BarChart3: (
        <BarChart3 className="w-8 h-8 text-primary-600 dark:text-primary-400 theme-transition" />
      ),
      Shield: (
        <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400 theme-transition" />
      ),
    };
    return icons[iconName] || null;
  };

  return (
    <div className="card-theme rounded-lg p-6 hover:shadow-theme-md theme-transition">
      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
        {getIconComponent(icon)}
      </div>
      <h3 className="text-xl font-semibold text-theme mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
};

/**
 * Step Card Component
 */
const StepCard = ({ number, title, description }) => {
  return (
    <div className="card-theme rounded-lg p-6 text-center">
      <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {number}
        </span>
      </div>
      <h3 className="text-xl font-semibold text-theme mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
};

/**
 * HomePage - Main landing page component
 */
const HomePage = () => {
  /**
   * handleNavigation - Logs user navigation from homepage
   */
  const handleNavigation = (destination) => {
    logUserInteraction("HomePage", "navigation", {
      destination,
      timestamp: new Date().toISOString(),
    });
  };

  const defaultFeatures = [
    {
      icon: "CheckCircle",
      title: "Digital Attendance",
      description: "QR code-based check-in and check-out system for accurate attendance tracking."
    },
    {
      icon: "Smartphone",
      title: "Mobile Friendly",
      description: "Responsive design that works seamlessly on all devices and screen sizes."
    },
    {
      icon: "MapPin",
      title: "Location Verification",
      description: "GPS-based location verification ensures students are physically present at events."
    },
    {
      icon: "Camera",
      title: "Photo Verification",
      description: "Optional photo capture during check-in for additional security and verification."
    },
    {
      icon: "BarChart3",
      title: "Analytics Dashboard",
      description: "Comprehensive reporting and analytics for administrators and organizers."
    },
    {
      icon: "Shield",
      title: "Secure & Private",
      description: "Enterprise-grade security with role-based access control and data protection."
    }
  ];

  const defaultSteps = [
    {
      step: 1,
      title: "Register for Event",
      description: "Browse available events and register for ones you want to attend."
    },
    {
      step: 2,
      title: "Scan QR Code",
      description: "Use your device to scan the QR code at the event location for check-in."
    },
    {
      step: 3,
      title: "Track Attendance",
      description: "Your attendance is automatically recorded and available in your dashboard."
    }
  ];

  const features = HOME_FEATURES || defaultFeatures;
  const steps = HOW_IT_WORKS_STEPS || defaultSteps;

  return (
    <div className="min-h-screen bg-theme">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {APP_NAME || "Event Attendance System"}
              </h1>
              <p className="text-xl text-green-100 mb-8 max-w-lg">
                {APP_DESCRIPTION || "Digital attendance management for campus events and activities at Surigao del Norte State University."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/events"
                  onClick={() => handleNavigation("/events")}
                >
                  <Button className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 inline-flex items-center">
                    Browse Events
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link
                  to="/roadmap"
                  onClick={() => handleNavigation("/roadmap")}
                >
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3">
                    View Roadmap
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:text-center">
              <img
                src={SNSULogo}
                alt={UNIVERSITY_NAME || "SNSU Logo"}
                className="mx-auto h-64 w-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-theme mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need for efficient event attendance management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-theme mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Simple and secure attendance process in just three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <StepCard
                key={step.step}
                number={step.step}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
