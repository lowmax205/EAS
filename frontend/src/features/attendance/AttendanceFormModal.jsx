import React, { useState, useRef, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
  MapPin,
  Camera,
  FileSignature,
  Calendar,
  Mail,
  Phone,
  Home,
  Building,
  BookOpen,
  Clock,
  SwitchCamera,
  Download,
  Upload,
  Save,
  Eye,
  EyeOff,
  CheckSquare,
  AlarmClock,
  FileText,
  Plus,
} from "lucide-react";
import { Camera as CameraComponent } from "react-camera-pro";
import SignatureCanvas from "react-signature-canvas";
import mapboxgl from "mapbox-gl";
import { useAuth } from "../auth/AuthContext";
import { mapboxService } from "../../services/mapboxapiService";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { devError } from "../../components/common/devLogger";
import { formatDate, formatTime } from "../../components/common/formatting";
import useScrollLock from "../../components/common/useScrollLock";

// Import university data and images
import universityData from "../../data/mockUniversity.json";
import mockEventsData from "../../data/mockEvents.json";
import defaultCover from "../../assets/images/default-cover.jpg";

const mockEvents = mockEventsData.events;

const AttendanceFormModal = ({
  isOpen,
  onClose,
  eventId = 1,
  simplified = false,
}) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enable scroll lock when modal is open
  useScrollLock(isOpen);

  // Get event data for cover photo and details
  const [eventData, setEventData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [eventPhase, setEventPhase] = useState("check-in");

  // Camera states with preview data
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [cameraType, setCameraType] = useState("user"); // 'user' for front, 'environment' for back
  const [capturedImage, setCapturedImage] = useState(
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVMMTI1IDUwSDc1TDEwMCA3NVoiIGZpbGw9IiM2QjczODAiLz4KPHRleHQgeD0iMTAwIiB5PSIxMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjczODAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iMTIiPlByZXZpZXcgUGhvdG88L3RleHQ+Cjwvc3ZnPg=="
  ); // Preview image placeholder
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const cameraRef = useRef(null);

  // Signature state with preview data
  const [signatureData, setSignatureData] = useState(
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTUwIDUwUTc1IDI1IDEwMCA1MFExMjUgNzUgMTUwIDUwIiBzdHJva2U9IiMzMzMzMzMiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8dGV4dCB4PSIxMDAiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MzgwIiBmb250LWZhbWlseT0ic3lzdGVtLXVpIiBmb250LXNpemU9IjEwIj5QcmV2aWV3IFNpZ25hdHVyZTwvdGV4dD4KPC9zdmc+"
  ); // Preview signature placeholder
  const signatureRef = useRef(null);

  // Map state with preview location
  const [currentLocation, setCurrentLocation] = useState({
    lat: 8.228,
    lng: 124.2452,
  }); // SNSU coordinates
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Manual attendance form states
  const [attendanceStatus, setAttendanceStatus] = useState("present");
  const [documentName, setDocumentName] = useState("");
  const [hasDocument, setHasDocument] = useState(false);
  const fileInputRef = useRef(null);

  // Function to determine if event is in check-in or check-out phase
  const determineEventPhase = (eventDate, eventTime, eventEndTime) => {
    if (!eventDate || !eventTime || !eventEndTime) return "check-in";

    const currentTime = new Date();
    const [startHours, startMinutes] = eventTime
      .split(":")
      .map((num) => parseInt(num));
    const [endHours, endMinutes] = eventEndTime
      .split(":")
      .map((num) => parseInt(num));

    const eventStartDate = new Date(eventDate);
    eventStartDate.setHours(startHours, startMinutes, 0, 0);

    const eventEndDate = new Date(eventDate);
    eventEndDate.setHours(endHours, endMinutes, 0, 0);

    // Calculate event duration in ms
    const durationMs = eventEndDate - eventStartDate;

    // Define check-out phase as last 25% of event duration
    const checkoutThresholdMs = eventEndDate - durationMs * 0.25;
    const isInCheckoutPhase = currentTime >= new Date(checkoutThresholdMs);

    return isInCheckoutPhase ? "check-out" : "check-in";
  };

  // Function to calculate time remaining for the event
  const calculateTimeRemaining = (eventDate, eventEndTime) => {
    if (!eventDate || !eventEndTime) return "Event time not specified";

    const currentTime = new Date();
    const [hours, minutes] = eventEndTime
      .split(":")
      .map((num) => parseInt(num));
    const eventEndDate = new Date(eventDate);
    eventEndDate.setHours(hours, minutes, 0, 0);

    if (currentTime > eventEndDate) return "Event has ended";

    const timeLeft = eventEndDate - currentTime;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return `${hoursLeft}h ${minutesLeft}m remaining`;
  };

  // Load event data on component mount
  useEffect(() => {
    if (isOpen && eventId) {
      // In a real app, this would be an API call
      const event = mockEvents.find((e) => e.id === eventId) || mockEvents[0];
      setEventData(event);

      // Calculate and update time remaining and event phase
      const updateEventStatus = () => {
        const remaining = calculateTimeRemaining(event.date, event.endTime);
        setTimeRemaining(remaining);

        // Determine and set event phase (check-in vs check-out)
        const phase = determineEventPhase(
          event.date,
          event.time,
          event.endTime
        );
        setEventPhase(phase);
      };

      updateEventStatus();
      // Update time remaining and phase every minute
      const timer = setInterval(updateEventStatus, 60000);

      return () => clearInterval(timer);
    }
  }, [isOpen, eventId]);

  // Map state
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Form data with preview values for demonstration
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: "Nilo",
    lastName: "Lumacang",
    middleName: "Olang",
    birthDate: "2000-02-07",
    gender: "male",

    // College Information
    studentId: "2022-000529",
    college: "main-campus",
    department: "1",
    course: "1",
    yearLevel: "3",
    section: "A",

    // Additional Information
    currentLocation: { lat: 8.228, lng: 124.2452 }, // SNSU coordinates
    signature: "preview-signature",
    photo: "preview-photo",
  });

  // Get departments and courses from university data
  const departments = universityData.university.departments || [];

  // Form validation happens in handleSubmit during actual form processing

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle department change to reset course selection
  const handleDepartmentChange = (departmentId) => {
    setFormData((prev) => ({
      ...prev,
      department: departmentId,
      course: "", // Reset course when department changes
    }));
  };

  // Handle college change to reset department and course selection
  const handleCollegeChange = (collegeId) => {
    setFormData((prev) => ({
      ...prev,
      college: collegeId,
      department: "", // Reset department when college changes
      course: "", // Reset course when college changes
    }));
  };

  // Get colleges (campus-based structure)
  const colleges = [
    {
      id: "main-campus",
      name: "Main Campus",
      abbreviation: "MAIN",
      location: "Narciso St., Surigao City",
    },
    {
      id: "malimono-campus",
      name: "Malimono Campus",
      abbreviation: "MALIMONO",
      location: "Malimono, Surigao del Norte",
    },
    {
      id: "claver-campus",
      name: "Claver Extension Campus",
      abbreviation: "CLAVER",
      location: "Claver, Surigao del Norte",
    },
    {
      id: "mainit-campus",
      name: "Mainit Campus",
      abbreviation: "MAINIT",
      location: "Mainit, Surigao del Norte",
    },
  ];

  // Get departments based on selected campus
  const getAvailableDepartments = () => {
    if (!formData.college) return [];

    // For campus-based structure, return all departments
    // In a real implementation, you might filter by campus
    return departments;
  };

  const availableDepartments = getAvailableDepartments();

  // Get selected department and available courses
  const selectedDepartment = availableDepartments.find(
    (dept) => dept.id === parseInt(formData.department)
  );
  const availableCourses = selectedDepartment ? selectedDepartment.courses : [];
  // Initialize real Mapbox map when modal opens
  useEffect(() => {
    if (
      isOpen &&
      currentPage === 2 &&
      mapRef.current &&
      !mapInstanceRef.current
    ) {
      try {
        // Set Mapbox access token
        mapboxgl.accessToken =
          import.meta.env.VITE_MAPBOX_TOKEN;

        // Initialize the map
        mapInstanceRef.current = new mapboxgl.Map({
          container: mapRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [125.494501, 9.787444], // [lng, lat] - SNSU coordinates
          zoom: 15,
          attributionControl: true,
        });

        // Add navigation controls
        mapInstanceRef.current.addControl(
          new mapboxgl.NavigationControl(),
          "top-right"
        );

        // Add marker for SNSU location
        new mapboxgl.Marker({ color: "#22C55E" })
          .setLngLat([125.494501, 9.787444])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="text-center p-2">
                <h3 class="font-semibold text-gray-900">SNSU Main Campus</h3>
                <p class="text-sm text-gray-600">Narciso St., Surigao City</p>
                <p class="text-xs text-green-600 mt-1">📍 Event Location</p>
              </div>
            `)
          )
          .addTo(mapInstanceRef.current);

        getCurrentLocation();
      } catch (error) {
        devError("[AttendanceFormModal] Error initializing Mapbox map:", error);
      }
    }
  }, [isOpen, currentPage]);

  // Get current location
  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const locationResult = await mapboxService.getCurrentLocation();
      if (locationResult.success) {
        const { latitude, longitude } = locationResult.data;
        setCurrentLocation({ lat: latitude, lng: longitude });

        // Add user location marker to real map
        if (mapInstanceRef.current && mapInstanceRef.current.addTo) {
          new mapboxgl.Marker({ color: "#EF4444" })
            .setLngLat([longitude, latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div class="text-center p-2">
                  <h3 class="font-semibold text-gray-900">Your Location</h3>
                  <p class="text-sm text-gray-600">${latitude.toFixed(
                    6
                  )}, ${longitude.toFixed(6)}</p>
                  <p class="text-xs text-red-600 mt-1">📍 Current Position</p>
                </div>
              `)
            )
            .addTo(mapInstanceRef.current);

          // Fly to user location
          mapInstanceRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            duration: 2000,
          });
        }
      } else {
        devError("Failed to get location:", locationResult.message);
      }
    } catch (error) {
      devError("Error getting location:", error);
    } finally {
      setLoadingLocation(false);
    }
  };

  // Camera functions
  const openCamera = () => {
    setCameraOpen(true);
    setShowCameraPreview(false);
  };

  const switchCamera = () => {
    setCameraType((prev) => (prev === "user" ? "environment" : "user"));
  };

  const capturePhoto = () => {
    if (cameraRef.current) {
      const imageSrc = cameraRef.current.takePhoto();
      setCapturedImage(imageSrc);
      setCameraOpen(false);
      setShowCameraPreview(true);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowCameraPreview(false);
    setCameraOpen(true);
  };

  // Signature functions
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureData(null);
    }
  };

  const saveSignature = () => {
    if (signatureRef.current) {
      const signatureDataURL = signatureRef.current.toDataURL();
      setSignatureData(signatureDataURL);
    }
  };

  // Handle form submission - Preview mode
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Prepare form data for submission
      const submissionData = {
        ...formData,
        currentLocation,
        signature: signatureData,
        photo: capturedImage,
        submittedAt: new Date().toISOString(),
        userId: user?.id || "preview-user",
        previewMode: true,
      };

      // Simulate API call for preview
      devError("Preview: Attendance form submission data:", submissionData);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success feedback for preview
      alert(
        "Preview Complete! This is how the form would be submitted in the actual system."
      );
      onClose();
    } catch (error) {
      devError("Preview submission error:", error);
      alert("Preview submission completed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal closes - but preserve preview data
  useEffect(() => {
    if (!isOpen) {
      setCurrentPage(1);
      // Reset to preview data instead of empty values
      setFormData({
        firstName: "Nilo",
        lastName: "Lumacang",
        middleName: "Olang",
        birthDate: "2000-02-07",
        gender: "male",
        studentId: "2022-000529",
        college: "main-campus",
        department: "1",
        course: "1",
        yearLevel: "3",
        section: "A",
        currentLocation: { lat: 8.228, lng: 124.2452 },
        signature: "preview-signature",
        photo: "preview-photo",
      });
      // Reset camera and signature to preview state
      setCapturedImage(
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVMMTI1IDUwSDc1TDEwMCA3NVoiIGZpbGw9IiM2QjczODAiLz4KPHRleHQgeD0iMTAwIiB5PSIxMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjczODAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iMTIiPlByZXZpZXcgUGhvdG88L3RleHQ+Cjwvc3ZnPg=="
      );
      setSignatureData(
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiNFNUU3RUIiLz4KPGF0aCBkPSJNNTAgNTBRNzUgMjUgMTAwIDUwUTEyNSA3NSAxNTAgNTAiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjczODAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iMTAiPlByZXZpZXcgU2lnbmF0dXJlPC90ZXh0Pgo8L3N2Zz4="
      );
      setCurrentLocation({ lat: 8.228, lng: 124.2452 });
      setCameraOpen(false);
      setShowCameraPreview(false);

      // Cleanup map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    }
  }, [isOpen]);

  // Load event data on open
  useEffect(() => {
    if (isOpen && eventId) {
      const loadEventData = async () => {
        try {
          // Simulate API call to fetch event data by ID
          const event = mockEvents.find((evt) => evt.id === eventId);
          if (event) {
            setEventData(event);

            // Calculate time remaining until the event starts
            const now = new Date();
            const eventStart = new Date(event.start);
            const timeDiff = eventStart - now;

            if (timeDiff > 0) {
              const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
              const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
              setTimeRemaining(`${hours}h ${minutes}m`);
            } else {
              setTimeRemaining("Event has started");
            }
          } else {
            devError("Event not found for ID:", eventId);
          }
        } catch (error) {
          devError("Error loading event data:", error);
        }
      };

      loadEventData();
    }
  }, [isOpen, eventId]);

  // Function to render form content based on current page
  const renderForm = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Cover Photo and Event Details */}
            <Card>
              {/* Cover Photo with 16:9 aspect ratio */}
              <div
                className="relative w-full rounded-t-lg overflow-hidden"
                style={{ paddingBottom: "40%" }}
              >
                <img
                  src={eventData?.eventBackground || defaultCover}
                  alt={eventData?.title || "Event Cover"}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultCover;
                  }}
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-40"></div>

                {/* Event title overlay on image */}
                <div className="absolute bottom-0 left-0 w-full p-4 text-white">
                  <h2 className="text-2xl font-bold drop-shadow-md">
                    {eventData?.title || "Event Information"}
                  </h2>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Event Description */}
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {eventData?.description || "No description provided"}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Event Time and Location */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                        <Calendar className="h-5 w-5 text-primary dark:text-primary" />
                        <span className="font-medium">
                          {eventData?.date
                            ? formatDate(eventData.date)
                            : "Date not specified"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                        <Clock className="h-5 w-5 text-primary dark:text-primary" />
                        <span className="font-medium">
                          {eventData?.time
                            ? `${formatTime(eventData.time)} - ${formatTime(
                                eventData.endTime || ""
                              )}`
                            : "Time not specified"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                        <MapPin className="h-5 w-5 text-primary dark:text-primary" />
                        <span className="font-medium">
                          {eventData?.location || "Location not specified"}
                        </span>
                      </div>
                    </div>

                    {/* Check-in Status and Time Remaining */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                        <CheckSquare className="h-5 w-5 text-primary dark:text-primary" />
                        <span>
                          {eventPhase === "check-in"
                            ? "Check-in status: "
                            : "Check-out status: "}
                          <span className="font-semibold text-primary dark:text-primary">
                            Open
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                        <AlarmClock className="h-5 w-5 text-primary dark:text-primary" />
                        <span className="font-medium">{timeRemaining}</span>
                      </div>

                      <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                        <User className="h-5 w-5 text-primary dark:text-primary" />
                        <span className="font-medium">
                          {eventData?.currentAttendees || 0}/
                          {eventData?.maxAttendees || "∞"} attendees
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Personal Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Personal Information */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Personal Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={formData.middleName}
                      onChange={(e) =>
                        handleInputChange("middleName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter middle name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gender *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) =>
                        handleInputChange("birthDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </Card>

              {/* College Information */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    College Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) =>
                        handleInputChange("studentId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter student ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Campus *
                    </label>
                    <select
                      value={formData.college}
                      onChange={(e) => handleCollegeChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select campus</option>
                      {colleges.map((college) => (
                        <option key={college.id} value={college.id}>
                          {college.name}
                        </option>
                      ))}
                    </select>
                    {formData.college && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {
                          colleges.find((c) => c.id === formData.college)
                            ?.location
                        }
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={!formData.college}
                    >
                      <option value="">Select department</option>
                      {availableDepartments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.abbreviation})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course *
                    </label>
                    <select
                      value={formData.course}
                      onChange={(e) =>
                        handleInputChange("course", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={!formData.department}
                    >
                      <option value="">Select course</option>
                      {availableCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name} ({course.abbreviation})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Year Level *
                      </label>
                      <select
                        value={formData.yearLevel}
                        onChange={(e) =>
                          handleInputChange("yearLevel", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="5">5th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Section
                      </label>
                      <input
                        type="text"
                        value={formData.section}
                        onChange={(e) =>
                          handleInputChange("section", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter section"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {/* Preview Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Preview Mode:</strong> Location is set to SNSU campus
                  coordinates. Photo and signature are preview placeholders. All
                  verification elements are pre-populated for demonstration.
                </p>
              </div>
            </div>

            {/* Event Cover Photo */}
            {eventData && (
              <Card className="p-4 sm:p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Camera className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Event Cover Photo
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={eventData.coverPhoto}
                      alt="Event Cover"
                      className="w-full h-48 sm:h-64 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Button
                        onClick={() => {}}
                        variant="outline"
                        size="sm"
                        className="bg-black bg-opacity-50 text-white border-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <strong>Event:</strong> {eventData.title}
                    </p>
                    <p>
                      <strong>Date:</strong> {formatDate(eventData.start)}
                    </p>
                    <p>
                      <strong>Location:</strong> {eventData.location}
                    </p>
                    <p>
                      <strong>Time Remaining:</strong> {timeRemaining}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Verification Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Location & Map */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Location Verification
                    </h3>
                  </div>
                  <Button
                    onClick={getCurrentLocation}
                    disabled={loadingLocation}
                    variant="outline"
                    size="sm"
                  >
                    {loadingLocation ? "Locating..." : "Refresh Location"}
                  </Button>
                </div>
                <div className="space-y-4">
                  <div
                    ref={mapRef}
                    className="w-full h-48 sm:h-64 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  />
                  {currentLocation && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        ✓ Location verified: {currentLocation.lat.toFixed(6)},{" "}
                        {currentLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Camera & Photo */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Camera className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Photo Verification
                  </h3>
                </div>
                <div className="space-y-4">
                  {isCameraOpen && (
                    <div className="space-y-4">
                      <div className="relative">
                        <CameraComponent
                          ref={cameraRef}
                          aspectRatio={16 / 9}
                          facingMode={cameraType}
                          className="w-full rounded-lg"
                        />
                        <div className="absolute bottom-2 right-2 flex space-x-2">
                          <Button
                            onClick={switchCamera}
                            variant="outline"
                            size="sm"
                            className="bg-black bg-opacity-50 text-white border-white"
                          >
                            <SwitchCamera className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={capturePhoto} className="flex-1">
                          <Camera className="h-4 w-4 mr-2" />
                          Capture Photo
                        </Button>
                        <Button
                          onClick={() => setCameraOpen(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {showCameraPreview && capturedImage && (
                    <div className="space-y-4">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full rounded-lg"
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={retakePhoto}
                          variant="outline"
                          className="flex-1"
                        >
                          Retake Photo
                        </Button>
                        <Button
                          onClick={() => setShowCameraPreview(false)}
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Hide
                        </Button>
                      </div>
                    </div>
                  )}

                  {!isCameraOpen && !showCameraPreview && (
                    <div className="text-center py-4">
                      <div className="mb-4">
                        <img
                          src={capturedImage}
                          alt="Preview Photo"
                          className="w-32 h-24 object-cover rounded-lg mx-auto border-2 border-gray-300 dark:border-gray-600"
                        />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Preview photo captured (sample image)
                      </p>
                      <Button onClick={openCamera} className="w-full mb-2">
                        {capturedImage ? "Retake Photo" : "Take Photo"}
                      </Button>
                      {capturedImage && (
                        <Button
                          onClick={() => setShowCameraPreview(true)}
                          variant="outline"
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Size
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Digital Signature */}
            <Card className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileSignature className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Digital Signature
                </h3>
              </div>
              <div className="space-y-4">
                <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-center h-48">
                    <img
                      src={signatureData}
                      alt="Preview Signature"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={clearSignature} variant="outline">
                    Clear Signature
                  </Button>
                  <Button onClick={saveSignature} variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Save Signature
                  </Button>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                  ✓ Preview signature loaded (sample signature for
                  demonstration)
                </div>
              </div>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  // Handle file selection for manual attendance
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentName(file.name);
      setHasDocument(true);
    }
  };

  // Trigger file input click for document upload
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Render simplified form for manual attendance entry
  if (simplified) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileSignature className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Manual Attendance Entry
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Record attendance with optional excuse documentation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Simplified Form Body */}
          <div className="p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Handle form submission here
                alert("Attendance recorded successfully!");
                onClose();
              }}
            >
              <div className="space-y-4">
                {/* Student Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Student
                  </label>
                  <input
                    type="text"
                    placeholder="Enter student name or ID"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Event Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Event
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Check-in Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Check-in Time
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      required
                    />
                    <input
                      type="time"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      defaultValue={new Date().toTimeString().slice(0, 5)}
                      required
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={attendanceStatus}
                    onChange={(e) => setAttendanceStatus(e.target.value)}
                    required
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>

                {/* Conditional fields based on status */}
                {(attendanceStatus === "excused" ||
                  attendanceStatus === "absent") && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      {attendanceStatus === "excused"
                        ? "Excuse Information"
                        : "Absence Information"}
                    </h4>

                    {/* Reason Field */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Reason
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      >
                        <option value="">Select reason</option>
                        <option value="medical">Medical</option>
                        <option value="family">Family Emergency</option>
                        <option value="academic">Academic Conflict</option>
                        <option value="transportation">
                          Transportation Issue
                        </option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Document Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {attendanceStatus === "excused"
                          ? "Upload Excuse Letter (Optional)"
                          : "Upload Supporting Document (Optional)"}
                      </label>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />

                      <div className="flex items-center mt-1">
                        <Button
                          variant="outline"
                          onClick={triggerFileInput}
                          className="flex items-center space-x-2"
                          type="button"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Choose File</span>
                        </Button>

                        {hasDocument && (
                          <div className="ml-3 flex items-center bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-md">
                            <FileText className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                            <span className="text-sm text-green-800 dark:text-green-200 truncate max-w-[180px]">
                              {documentName}
                            </span>
                          </div>
                        )}
                      </div>

                      {hasDocument ? (
                        <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <CheckSquare className="h-3 w-3 mr-1 text-green-500" />
                          Document ready for upload
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes {attendanceStatus === "present" ? "(Optional)" : ""}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder={
                      attendanceStatus === "present"
                        ? "Add any additional notes here..."
                        : "Please provide details about the " +
                          (attendanceStatus === "excused"
                            ? "excuse"
                            : "absence") +
                          "..."
                    }
                    required={attendanceStatus !== "present"}
                  ></textarea>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button type="submit" className="px-4 py-2">
                  Record Attendance
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Original full attendance form with signature, photo, and location
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FileSignature className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {eventPhase === "check-in"
                  ? "Attendance Check-In Form"
                  : "Attendance Check-Out Form"}
                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs sm:text-sm rounded-full">
                  Preview Mode
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of 2 • This is a preview with sample data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Preview Progress: {Math.round((currentPage / 2) * 100)}%
            </span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {currentPage === 1
                ? "Basic & College Information"
                : "Verification & Submission"}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentPage / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
          {renderForm()}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
            <span className="inline-flex items-center space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Preview Mode - Navigate freely between pages</span>
            </span>
          </div>
          <div className="flex space-x-3 order-1 sm:order-2">
            {currentPage > 1 && (
              <Button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                variant="outline"
                className="flex items-center text-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            {currentPage < 2 ? (
              <Button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="flex items-center text-sm"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center text-sm"
              >
                {isSubmitting
                  ? "Submitting..."
                  : eventPhase === "check-in"
                  ? "Check In"
                  : "Check Out"}
                <Upload className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceFormModal;
