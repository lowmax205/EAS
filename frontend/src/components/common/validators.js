/**
 * Form Validation Utilities
 * This file contains validation functions for forms in the EAS application
 */

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { isValid: false, message: "Email is required" };
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  // Check for SNSU domain (optional validation for university emails)
  if (
    email.includes("@") &&
    !email.includes("@snsu.edu.ph") &&
    !email.includes("@gmail.com")
  ) {
    return {
      isValid: true,
      message: "Warning: Consider using your SNSU email address",
      warning: true,
    };
  }

  return { isValid: true, message: "" };
};

// Password validation
export const validatePassword = (password, confirmPassword = null) => {
  if (!password) {
    return { isValid: false, message: "Password is required" };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters long",
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      message: "Password is too long (max 128 characters)",
    };
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      message: "Password must contain at least one letter and one number",
    };
  }

  // If confirm password is provided, check if they match
  if (confirmPassword !== null && password !== confirmPassword) {
    return { isValid: false, message: "Passwords do not match" };
  }

  return { isValid: true, message: "" };
};

// Student ID validation
export const validateStudentId = (studentId) => {
  if (!studentId) {
    return { isValid: false, message: "Student ID is required" };
  }

  // SNSU student ID format: SNSU-YYYY-XXX or similar patterns
  const studentIdRegex = /^(SNSU-\d{4}-\d{3}|ADMIN\d{3}|ORG\d{3})$/i;

  if (!studentIdRegex.test(studentId)) {
    return {
      isValid: false,
      message:
        "Invalid Student ID format. Use: SNSU-YYYY-XXX, ADMINXXX, or ORGXXX",
    };
  }

  return { isValid: true, message: "" };
};

// Name validation
export const validateName = (name, fieldName = "Name") => {
  if (!name) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      message: `${fieldName} must be at least 2 characters long`,
    };
  }

  if (name.length > 100) {
    return {
      isValid: false,
      message: `${fieldName} is too long (max 100 characters)`,
    };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-'.]+$/;
  if (!nameRegex.test(name)) {
    return {
      isValid: false,
      message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`,
    };
  }

  return { isValid: true, message: "" };
};

// Event title validation
export const validateEventTitle = (title) => {
  if (!title) {
    return { isValid: false, message: "Event title is required" };
  }

  if (title.trim().length < 5) {
    return {
      isValid: false,
      message: "Event title must be at least 5 characters long",
    };
  }

  if (title.length > 200) {
    return {
      isValid: false,
      message: "Event title is too long (max 200 characters)",
    };
  }

  return { isValid: true, message: "" };
};

// Event description validation
export const validateEventDescription = (description) => {
  if (!description) {
    return { isValid: false, message: "Event description is required" };
  }

  if (description.trim().length < 20) {
    return {
      isValid: false,
      message: "Event description must be at least 20 characters long",
    };
  }

  if (description.length > 1000) {
    return {
      isValid: false,
      message: "Event description is too long (max 1000 characters)",
    };
  }

  return { isValid: true, message: "" };
};

// Date validation
export const validateDate = (date, fieldName = "Date") => {
  if (!date) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  if (isNaN(selectedDate.getTime())) {
    return {
      isValid: false,
      message: `Please enter a valid ${fieldName.toLowerCase()}`,
    };
  }

  if (selectedDate < today) {
    return { isValid: false, message: `${fieldName} cannot be in the past` };
  }

  // Check if date is too far in the future (e.g., more than 2 years)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2);

  if (selectedDate > maxDate) {
    return {
      isValid: false,
      message: `${fieldName} cannot be more than 2 years in the future`,
    };
  }

  return { isValid: true, message: "" };
};

// Time validation
export const validateTime = (time, fieldName = "Time") => {
  if (!time) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    return {
      isValid: false,
      message: `Please enter a valid ${fieldName.toLowerCase()} (HH:MM format)`,
    };
  }

  return { isValid: true, message: "" };
};

// Location validation
export const validateLocation = (location) => {
  if (!location) {
    return { isValid: false, message: "Location is required" };
  }

  if (location.trim().length < 5) {
    return {
      isValid: false,
      message: "Location must be at least 5 characters long",
    };
  }

  if (location.length > 200) {
    return {
      isValid: false,
      message: "Location is too long (max 200 characters)",
    };
  }

  return { isValid: true, message: "" };
};

// Max attendees validation
export const validateMaxAttendees = (maxAttendees) => {
  if (!maxAttendees) {
    return { isValid: false, message: "Maximum attendees is required" };
  }

  const num = parseInt(maxAttendees);

  if (isNaN(num) || num <= 0) {
    return {
      isValid: false,
      message: "Maximum attendees must be a positive number",
    };
  }

  if (num > 10000) {
    return {
      isValid: false,
      message: "Maximum attendees cannot exceed 10,000",
    };
  }

  return { isValid: true, message: "" };
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach((field) => {
    const rules = validationRules[field];
    const value = formData[field];

    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
        break; // Stop at first validation error for this field
      }
    }
  });

  return { isValid, errors };
};

// Common validation rule sets
export const validationRules = {
  login: {
    email: [validateEmail],
    password: [(password) => validatePassword(password)],
  },

  register: {
    name: [(name) => validateName(name, "Full Name")],
    email: [validateEmail],
    password: [(password) => validatePassword(password)],
    studentId: [validateStudentId],
  },

  event: {
    title: [validateEventTitle],
    description: [validateEventDescription],
    date: [validateDate],
    time: [validateTime],
    location: [validateLocation],
    maxAttendees: [validateMaxAttendees],
  },

  profile: {
    name: [(name) => validateName(name, "Full Name")],
    studentId: [validateStudentId],
  },
};

export default {
  validateEmail,
  validatePassword,
  validateStudentId,
  validateName,
  validateEventTitle,
  validateEventDescription,
  validateDate,
  validateTime,
  validateLocation,
  validateMaxAttendees,
  validateForm,
  validationRules,
};
