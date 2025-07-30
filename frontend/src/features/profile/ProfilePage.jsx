import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useApi } from "../../hooks/useApi";
import { useTheme } from "../../components/layout/ThemeContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import {
  validateForm,
  validationRules,
  validateEmail,
} from "../../components/common/validators";
import { DEPARTMENTS, COURSES } from "../../components/common/constants/index";
import { devError } from "../../components/common/devLogger";
import { generateAvatarWithStyle, isPlaceholderAvatar } from "./avatarUtils";
import { User, File } from "lucide-react";
import DocumentUpload from "./DocumentUpload";
import SignatureCanvas from "./SignatureCanvas";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { auth, loading, error, clearError } = useApi();
  const { resolvedTheme } = useTheme();

  const avatarWithStyle = generateAvatarWithStyle(
    user?.name,
    resolvedTheme === "dark"
  );

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    studentId: "",
    department: "",
    departmentId: "",
    course: "",
    courseId: "",
    college: "",
    yearLevel: "",
    section: "",
    gender: "",
    birthDate: "",
    phone: "",
    address: "",
    avatar: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    recoveryEmail: user?.recoveryEmail || "",
  });
  const [documentData, setDocumentData] = useState({
    idFront: null,
    idBack: null,
    signature: null,
    registrationCertificate: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        middleName: user.middleName || "",
        email: user.email || "",
        studentId: user.studentId || "",
        department: user.department || "",
        departmentId: user.departmentId || "",
        course: user.course || "",
        courseId: user.courseId || "",
        college: user.college || "",
        yearLevel: user.yearLevel || "",
        section: user.section || "",
        gender: user.gender || "",
        birthDate: user.birthDate || "",
        phone: user.phone || "",
        address: user.address || "",
        avatar: user.avatar || "",
      });

      // Set recovery email when user data loads
      setPasswordData((prev) => ({
        ...prev,
        recoveryEmail: user.recoveryEmail || "",
      }));
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    clearError();

    // Validate form
    const validation = validateForm(formData, validationRules.profile);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      const result = await auth.updateProfile(user.id, formData);

      if (result.success) {
        updateProfile(result.data);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      devError("Error updating profile:", error);
    }
  };

  const handleChangePassword = async () => {
    clearError();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setFormErrors({ password: "All password fields are required" });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFormErrors({ password: "New passwords do not match" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setFormErrors({
        password: "Password must be at least 6 characters long",
      });
      return;
    }

    try {
      const result = await auth.changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.success) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          recoveryEmail: passwordData.recoveryEmail,
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      devError("Error changing password:", error);
    }
  };

  const handleUpdateRecoveryEmail = async () => {
    clearError();

    // Validate email format using existing validation function
    if (passwordData.recoveryEmail) {
      const emailValidation = validateEmail(passwordData.recoveryEmail);
      if (!emailValidation.isValid) {
        setFormErrors({ recoveryEmail: emailValidation.message });
        return;
      }
    }

    try {
      const result = await auth.updateRecoveryEmail(user.id, {
        recoveryEmail: passwordData.recoveryEmail,
      });

      if (result.success) {
        updateProfile({
          ...user,
          recoveryEmail: passwordData.recoveryEmail,
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      devError("Error updating recovery email:", error);
    }
  };

  // Document upload handlers
  const handleDocumentUpload = (type, file) => {
    setDocumentData((prev) => ({
      ...prev,
      [type]: file,
    }));

    // Clear document upload errors
    if (formErrors[type]) {
      setFormErrors((prev) => ({
        ...prev,
        [type]: "",
      }));
    }
  };

  const handleSignatureSave = (dataUrl) => {
    setDocumentData((prev) => ({
      ...prev,
      signature: dataUrl,
    }));

    // In a real app, you would save this to your backend
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveDocuments = async () => {
    clearError();

    // Validate required documents
    const requiredDocs = {
      idFront: "ID Front is required",
      idBack: "ID Back is required",
      signature: "Signature is required",
    };

    const errors = {};
    Object.entries(requiredDocs).forEach(([key, message]) => {
      if (!documentData[key]) {
        errors[key] = message;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // In a real app, you would upload the documents to your backend here
      // const result = await auth.updateDocuments(user.id, documentData);

      // For mock implementation
      const mockResult = { success: true };

      if (mockResult.success) {
        updateProfile({
          ...user,
          hasUploadedDocuments: true,
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      devError("Error updating documents:", error);
    }
  };

  const tabs = [
    { id: "profile", name: "Profile Information", icon: "👤" },
    { id: "security", name: "Security Settings", icon: "🔒" },
    { id: "preferences", name: "Preferences", icon: "⚙️" },
    { id: "documents", name: "Documents", icon: "📄" },
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "organizer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "student":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-eas-light-primary to-eas-light-secondary dark:from-eas-dark-primary dark:to-eas-dark-secondary rounded-lg p-4 sm:p-6 theme-transition">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm border-2 border-white/20 dark:border-gray-700/30 rounded-full flex items-center justify-center theme-transition shadow-lg mx-auto sm:mx-0">
              {user?.avatar && !isPlaceholderAvatar(user.avatar) ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div
                  className={`w-full h-full rounded-full bg-gradient-to-br ${avatarWithStyle.color} flex items-center justify-center border border-white/10 shadow-inner`}
                  style={avatarWithStyle.style}
                >
                  <span className="text-white text-xl font-bold drop-shadow-md select-none">
                    {avatarWithStyle.initial}
                  </span>
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {user?.name}
              </h1>
              <p className="text-gray-700 dark:text-gray-200">{user?.email}</p>
              <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                    user?.role
                  )}`}
                >
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
                <span className="text-gray-700 dark:text-gray-200 text-sm">
                  {user?.studentId}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-200 px-4 py-3 rounded theme-transition">
            Changes saved successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-200 px-4 py-3 rounded theme-transition">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Tabs */}
        <Card>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex flex-wrap space-x-4 md:space-x-8 p-2 sm:p-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap theme-transition ${
                    activeTab === tab.id
                      ? "border-eas-light-primary dark:border-eas-dark-primary text-eas-light-primary dark:text-eas-dark-primary"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <span className="mr-1 sm:mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="p-4 sm:p-6">
            {/* Profile Information Tab */}
            {activeTab === "profile" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <h2 className="text-lg font-semibold text-theme">
                    Profile Information
                  </h2>
                  <Button
                    variant={isEditing ? "outline" : "primary"}
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full sm:w-auto"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Personal Information Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-md font-medium text-theme mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                      Personal Information
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                          formErrors.firstName
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        value={user?.firstName || ""}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 py-2">
                        {user?.firstName || "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                        value={user?.lastName || ""}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 py-2">
                        {user?.lastName || "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Middle Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                        value={user?.middleName || ""}
                        onChange={(e) =>
                          handleInputChange("middleName", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 py-2">
                        {user?.middleName || "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <p className="text-gray-900 dark:text-gray-100 py-2">
                      {user?.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Auto-generated from first, middle, and last name
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <p className="text-gray-900 dark:text-gray-100 py-2">
                      {user?.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gender
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={user?.gender || ""}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 py-2">
                        {user?.gender
                          ? user.gender.charAt(0).toUpperCase() +
                            user.gender.slice(1)
                          : "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Birth Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={user?.birthDate || ""}
                        onChange={(e) =>
                          handleInputChange("birthDate", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 py-2">
                        {user?.birthDate
                          ? new Date(user.birthDate).toLocaleDateString()
                          : "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={user?.phone || ""}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 py-2">
                        {user?.phone || "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        rows="2"
                        value={user?.address || ""}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                      ></textarea>
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 py-2">
                        {user?.address || "Not set"}
                      </p>
                    )}
                  </div>

                  {/* Academic Information Section */}
                  <div className="md:col-span-2">
                    <h3 className="text-md font-medium text-theme mt-4 mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                      Academic Information
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Student ID
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                          formErrors.studentId
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        value={formData.studentId}
                        onChange={(e) =>
                          handleInputChange("studentId", e.target.value)
                        }
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 py-2">
                        {user?.studentId}
                      </p>
                    )}
                    {formErrors.studentId && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                        {formErrors.studentId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      College/Campus
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={user?.college || ""}
                        onChange={(e) =>
                          handleInputChange("college", e.target.value)
                        }
                      >
                        <option value="">Select College</option>
                        <option value="main-campus">Main Campus</option>
                        <option value="malimono-campus">Malimono Campus</option>
                        <option value="claver-campus">
                          Claver Extension Campus
                        </option>
                        <option value="mainit-campus">Mainit Campus</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 py-2">
                        {user?.college === "main-campus"
                          ? "Main Campus"
                          : user?.college === "malimono-campus"
                          ? "Malimono Campus"
                          : user?.college === "claver-campus"
                          ? "Claver Extension Campus"
                          : user?.college === "mainit-campus"
                          ? "Mainit Campus"
                          : "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.department}
                        onChange={(e) => {
                          handleInputChange("department", e.target.value);
                          // Clear course when department changes
                          handleInputChange("course", "");
                        }}
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 py-2">
                        {user?.department}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Course
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.course}
                        onChange={(e) =>
                          handleInputChange("course", e.target.value)
                        }
                        disabled={!formData.department}
                      >
                        <option value="">Select Course</option>
                        {formData.department &&
                          COURSES[formData.department]?.map((course) => (
                            <option key={course} value={course}>
                              {course}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 py-2">
                        {user?.course}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account Status
                    </label>
                    <p className="text-gray-900 dark:text-gray-100 py-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user?.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {user?.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Security Settings Tab */}
            {activeTab === "security" && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg font-semibold text-theme">
                  Security Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Change Password Column */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Change Password
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            "currentPassword",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          handlePasswordChange("newPassword", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            "confirmPassword",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {formErrors.password && (
                      <p className="text-red-500 dark:text-red-400 text-sm">
                        {formErrors.password}
                      </p>
                    )}

                    <Button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Updating..." : "Change Password"}
                    </Button>
                  </div>

                  {/* Account Recovery Column */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Account Recovery
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Recovery Email Address
                      </label>
                      <input
                        type="email"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-eas-light-primary dark:focus:ring-eas-dark-primary focus:border-transparent theme-transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                          formErrors.recoveryEmail
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter backup email address for account recovery"
                        value={passwordData.recoveryEmail}
                        onChange={(e) =>
                          handlePasswordChange("recoveryEmail", e.target.value)
                        }
                      />
                      {formErrors.recoveryEmail && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                          {formErrors.recoveryEmail}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This email will be used if you forget your password or
                        need to recover your account
                      </p>
                    </div>
                    <Button
                      onClick={handleUpdateRecoveryEmail}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Updating..." : "Save Recovery Email"}
                    </Button>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
                  <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                    Account Information
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <strong>Last Login:</strong>{" "}
                      {user?.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "Never"}
                    </p>
                    <p>
                      <strong>Account Created:</strong>{" "}
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                    <p>
                      <strong>Role:</strong> {user?.role}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg font-semibold text-theme">
                  Preferences
                </h2>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Email Notifications
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        Receive email notifications for new events
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle mt-1 sm:mt-0"
                      defaultChecked
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        SMS Notifications
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Not Available Yet!
                        </span>
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        Receive SMS reminders for events
                      </p>
                    </div>
                    <input type="checkbox" className="toggle mt-1 sm:mt-0" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Public Profile and Share
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Not Available Yet!
                        </span>
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        Make your attendance history visible to others
                      </p>
                    </div>
                    <input type="checkbox" className="toggle mt-1 sm:mt-0" />
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full sm:w-auto">Save Preferences</Button>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                  <h2 className="text-lg font-semibold text-theme flex items-center">
                    <File className="h-5 w-5 mr-2" />
                    Required Documents
                  </h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center">
                      <span className="h-2 w-2 rounded-full bg-yellow-400 mr-1"></span>
                      Please upload all required documents
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* ID Documents Section */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-md font-medium text-theme mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                      Identification Cards
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* ID Front */}
                      <div>
                        <DocumentUpload
                          documentType="ID Front"
                          acceptedTypes={["image/jpeg", "image/png"]}
                          maxSizeMB={2}
                          currentDocument={documentData.idFront}
                          required={true}
                          onFileSelect={(file) =>
                            handleDocumentUpload("idFront", file)
                          }
                        />
                        {formErrors.idFront && (
                          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                            {formErrors.idFront}
                          </p>
                        )}
                      </div>

                      {/* ID Back */}
                      <div>
                        <DocumentUpload
                          documentType="ID Back"
                          acceptedTypes={["image/jpeg", "image/png"]}
                          maxSizeMB={2}
                          currentDocument={documentData.idBack}
                          required={true}
                          onFileSelect={(file) =>
                            handleDocumentUpload("idBack", file)
                          }
                        />
                        {formErrors.idBack && (
                          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                            {formErrors.idBack}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-md font-medium text-theme mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                      Digital Signature
                    </h3>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Please sign in the box below. This signature will be
                        used for official documents.
                      </p>

                      <SignatureCanvas
                        onSave={handleSignatureSave}
                        initialSignature={documentData.signature}
                      />

                      {formErrors.signature && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                          {formErrors.signature}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Certificate of Registration */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-md font-medium text-theme mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                      Certificate of Registration (COR)
                    </h3>

                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload your Certificate of Registration. Accepted
                        formats: PDF, JPG, PNG.
                      </p>

                      <DocumentUpload
                        documentType="Certificate of Registration"
                        acceptedTypes={[
                          "image/jpeg",
                          "image/png",
                          "application/pdf",
                        ]}
                        maxSizeMB={5}
                        currentDocument={documentData.registrationCertificate}
                        onFileSelect={(file) =>
                          handleDocumentUpload("registrationCertificate", file)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleSaveDocuments}
                    className="w-full sm:w-auto"
                  >
                    Save Documents
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
