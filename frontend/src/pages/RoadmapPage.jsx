import React from "react";
import { Check, Clock, AlertCircle, Target } from "lucide-react";

/**
 * Roadmap milestone component
 */
const MilestoneCard = ({ milestone, index }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <Check className="w-5 h-5 text-green-500" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "upcoming":
        return <Target className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10";
      case "in-progress":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10";
      case "upcoming":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10";
      default:
        return "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50";
    }
  };

  return (
    <div className={`rounded-lg border p-6 theme-transition ${getStatusColor(milestone.status)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getStatusIcon(milestone.status)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-theme">{milestone.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{milestone.timeline}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
          milestone.status === "completed" 
            ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30"
            : milestone.status === "in-progress"
            ? "text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30"
            : "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30"
        }`}>
          {milestone.status.replace("-", " ")}
        </span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        {milestone.description}
      </p>
      {milestone.features && milestone.features.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-theme mb-2">Key Features:</h4>
          <ul className="space-y-1">
            {milestone.features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Main Roadmap Page Component
 */
const RoadmapPage = () => {
  // Roadmap data
  const roadmapData = [
    {
      title: "Phase 1: Frontend Foundation & UI Design",
      timeline: "Completed - May 25 - June 10, 2025",
      status: "completed",
      description: "Established the complete frontend foundation with modern React architecture, theme system, and comprehensive UI components.",
      features: [
        "React 18 + Vite development environment setup",
        "TailwindCSS theme system (Light/Dark/System modes)",
        "Responsive component architecture",
        "Authentication UI components and flows",
        "Complete page layouts and navigation system"
      ]
    },
    {
      title: "Phase 2: Mock Data Integration & UI Testing",
      timeline: "Completed - June 11 - July 5, 2025", 
      status: "completed",
      description: "Full frontend functionality implementation using mock data for comprehensive UI testing and user experience validation.",
      features: [
        "Mock data services for all major features",
        "Event management interface with mock data",
        "Attendance tracking UI with simulated data",
        "User profile and management interfaces",
        "Analytics and reporting dashboard mockups"
      ]
    },
    {
      title: "Phase 3: Django Backend Development",
      timeline: "In Progress - July 6 - July 25, 2025",
      status: "in-progress",
      description: "Development of robust Django REST API backend to replace mock data with real database operations and business logic.",
      features: [
        "Django REST Framework API setup",
        "User authentication and authorization system",
        "Event management backend models and APIs",
        "Attendance tracking system with database persistence",
        "Role-based access control implementation"
      ]
    },
    {
      title: "Phase 4: Frontend-Backend Integration",
      timeline: "July 26 - August 5, 2025",
      status: "upcoming",
      description: "Replace mock data services with real API calls to Django backend, ensuring seamless data flow and error handling.",
      features: [
        "API service layer implementation",
        "Real-time data synchronization",
        "Error handling and loading states",
        "Authentication token management",
        "Data caching and optimization strategies"
      ]
    },
    {
      title: "Phase 5: Testing & Production Deployment",
      timeline: "August 6 - August 10, 2025",
      status: "upcoming", 
      description: "Final testing, bug fixes, and production deployment with SNSU system integration and security implementation.",
      features: [
        "Comprehensive system testing and QA",
        "Bug fixes and performance optimization",
        "Production server deployment and configuration",
        "SSL certificates and security implementation",
        "Final user acceptance testing"
      ]
    },
    {
      title: "Phase 6: Future Enhancements (Post-Launch)",
      timeline: "September 2025 onwards",
      status: "upcoming",
      description: "Post-launch enhancements including advanced analytics, SNSU system integration, and additional features.",
      features: [
        "Advanced analytics and reporting dashboard",
        "SNSU Student Information System integration",
        "LDAP authentication integration",
        "Email notifications and reminder system",
        "Advanced search and filtering capabilities"
      ]
    },
    {
      title: "Phase 7: Mobile Application Development",
      timeline: "Q4 2025",
      status: "upcoming",
      description: "Mobile application development for enhanced accessibility and user engagement on mobile devices.",
      features: [
        "React Native mobile application",
        "Push notifications for events and updates",
        "QR code scanner for mobile attendance",
        "Enhanced accessibility features"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark theme-transition">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              EAS Development Roadmap
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Follow the intensive 11-week development journey of SNSU's Event Attendance System from May 25 to August 10, 2025.
              From frontend design to full-stack Django implementation and production deployment.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card-theme rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-theme mb-2">2</h3>
            <p className="text-gray-600 dark:text-gray-400">Phases Completed</p>
          </div>
          <div className="card-theme rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-theme mb-2">1</h3>
            <p className="text-gray-600 dark:text-gray-400">Phase In Progress</p>
          </div>
          <div className="card-theme rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-theme mb-2">2</h3>
            <p className="text-gray-600 dark:text-gray-400">Core Phases Remaining</p>
          </div>
          <div className="card-theme rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-theme mb-2">Aug 10</h3>
            <p className="text-gray-600 dark:text-gray-400">Target Completion</p>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-theme mb-4">Development Timeline</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              An accelerated 11-week development sprint from May 25 to August 10, 2025, building a comprehensive 
              event attendance management system with Django backend integration for Surigao del Norte State University.
            </p>
          </div>

          {/* Timeline Items */}
          {roadmapData.map((milestone, index) => (
            <MilestoneCard key={index} milestone={milestone} index={index} />
          ))}
        </div>

        {/* Future Developments */}
        <div className="mt-16 text-center card-theme rounded-lg p-8">
          <h2 className="text-2xl font-bold text-theme mb-4">Current Sprint: Django Backend Development</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            The EAS development team is currently in an intensive development sprint, transitioning from mock data 
            to a robust Django REST API backend, targeting completion by August 10, 2025.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-5xl mx-auto">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">✅ Frontend Complete</h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                UI design and mock data integration completed (May 25 - July 5)
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">🚧 Backend In Progress</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Django REST Framework implementation (July 6 - July 25)
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">🎯 Target: Aug 10</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Full production deployment and testing completion
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>Project Timeline: May 25 - August 10, 2025 (11 weeks)</p>
            <p>
              Developed and maintained by Nilo Jr. Olang - 
              <a 
                href="https://github.com/lowmax205" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 ml-1 transition-colors duration-200"
              >
                GitHub Profile
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
