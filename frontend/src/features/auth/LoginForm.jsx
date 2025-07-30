import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Eye, EyeOff, Mail, Lock, AlertCircle, X } from "lucide-react";
import SNSULogo from "../../assets/images/SNSU-Logo.jpg";
import { validateEmail, validatePassword } from "../../components/common/validators";
import { devLog, devError } from "../../components/common/devLogger";
import { useLogger } from "../../components/common/useLogger";
import { UNIVERSITY_NAME, UNIVERSITY_SHORT } from "../../components/common/constants/index";
import useScrollLock from "../../components/common/useScrollLock";
import mockUsers from "../../data/mockUsers.json";

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const logger = useLogger("LoginModal");
  const previousIsOpen = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  // Enable scroll lock when modal is open
  useScrollLock(isOpen, [location.pathname]);

  useEffect(() => {
    // Only log if this is a meaningful state change
    if (previousIsOpen.current !== null) {
      if (isOpen && !previousIsOpen.current) {
        // Modal is opening
        logger.userInteraction("modal_open", { from: location.pathname });
      } else if (!isOpen && previousIsOpen.current) {
        // Modal is closing
        logger.userInteraction("modal_close", { from: location.pathname });
      }
    }

    // Update the previous state
    previousIsOpen.current = isOpen;
  }, [isOpen, location.pathname, logger]);

  const validateForm = () => {
    const newErrors = {};

    // Use centralized email validation
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message;
    }

    // Use centralized password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    setErrors(newErrors);
    devLog("[LoginModal] Form validation:", {
      errors: newErrors,
      hasErrors: Object.keys(newErrors).length > 0,
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    logger.formEvent("LoginForm", "submit_attempt", {
      email: formData.email,
      hasPassword: !!formData.password,
    });

    devLog("[LoginModal] Form submission attempt:", {
      email: formData.email,
    });

    if (!validateForm()) {
      logger.formEvent("LoginForm", "validation_failed", {
        errors: Object.keys(errors),
      });
      return;
    }

    try {
      const startTime = Date.now();
      const result = await login(formData);
      const duration = Date.now() - startTime;

      if (result.success) {
        logger.formEvent("LoginForm", "submit_success", {
          duration,
          redirectTo: from,
          userRole: result.user?.role,
        });
        logger.navigation(from, "login_success");

        devLog("[LoginModal] Login successful, redirecting to:", from);
        onClose();
        navigate(from, { replace: true });
      }
    } catch (error) {
      logger.formEvent("LoginForm", "submit_error", {
        error: error.message,
        email: formData.email,
      });
      devError("[LoginModal] Login error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    logger.formEvent("LoginForm", "field_change", {
      field: name,
      hasValue: !!value,
      valueLength: value.length,
    });

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Get demo accounts from mock data
  const demoAccounts = mockUsers.users
    .filter((user) => ["admin", "student", "organizer"].includes(user.role))
    .map((user) => ({
      email: user.email,
      password: user.password,
      role:
        user.role === "admin"
          ? "Administrator"
          : user.role === "student"
          ? "Student"
          : "Event Organizer",
      name: user.name,
    }));

  const fillDemoAccount = (account) => {
    logger.userInteraction("demo_account_fill", {
      role: account.role,
      email: account.email,
    });

    devLog("[LoginModal] Filling demo account:", {
      role: account.role,
      email: account.email,
    });
    setFormData({
      email: account.email,
      password: account.password,
    });
    setErrors({});
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="flex items-center justify-center min-h-screen px-4 text-center"
        onClick={handleBackdropClick}
      >
        <div className="fixed inset-0 bg-black opacity-50"></div>
        <div className="relative w-full max-w-md transition-all duration-300 ease-in-out transform bg-white shadow-2xl rounded-xl">
          {/* Logo Section */}
          <div className="sticky top-0 z-10 p-6 text-center hero-gradient-bg rounded-t-xl">
            <img
              src={SNSULogo}
              alt={`${UNIVERSITY_SHORT} Logo`}
              className="w-20 h-20 mx-auto border-4 border-white rounded-full shadow-lg"
            />
            <h3 className="mt-4 text-2xl font-bold text-white">Welcome Back</h3>
            <p className="text-xs text-green-100">Sign in to your account</p>
          </div>

          {/* Form Section */}
          <div className="p-8 overflow-y-auto max-h-[calc(100vh-200px)]">
            {/* Demo Accounts */}
            <div className="mb-6">
              <h4 className="text-xs font-medium text-gray-700 mb-3">
                Demo Accounts:
              </h4>
              <div className="space-y-2">
                {demoAccounts.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => fillDemoAccount(account)}
                    className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    <div className="font-medium text-gray-700">
                      {account.role}
                    </div>
                    <div className="text-gray-500">{account.email}</div>
                  </button>
                ))}
              </div>
            </div>

            <hr className="mb-6" />

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-xs text-red-700">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-8 px-2 py-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.email ? "border-red-300" : ""
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-8 pr-8 px-2 py-1.5 text-xs text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.password ? "border-red-300" : ""
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    name="remember"
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label
                    htmlFor="remember"
                    className="block ml-2 text-xs text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-xs text-green-600 hover:text-green-500"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit and Cancel Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {" "}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg shadow-sm button-gradient-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Register Section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 text-gray-500 bg-white">
                    New to platform?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="flex justify-center w-full px-4 py-2 text-sm font-medium text-green-600 bg-white border border-green-600 rounded-lg shadow-sm hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Create new account
                </button>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute text-white top-4 right-4 hover:text-green-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
