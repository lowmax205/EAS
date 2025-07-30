/**
 * Auth Service - Mock API for authentication operations
 * This service handles user authentication using JSON files
 * and provides login/logout functionality
 */

import {
  API_DELAYS,
  AUTH_ERROR_MESSAGES,
  TOKEN_PATTERNS,
  AUTH_STORAGE_KEYS,
  API_ENDPOINTS,
  HTTP_METHODS,
  STATUS_CODES,
} from "../../../components/common/constants/index";
import {
  devLog,
  logApiCall,
  logServiceCall,
  logAuthEvent,
  logAction,
  logDataOperation,
} from "../../../components/common/devLogger";

// Mock API functions for authentication (replace with real API later)
export const authService = {
  // User login
  async login(credentials) {
    const startTime = Date.now();

    // Log service call start
    logServiceCall(
      "authService",
      "login",
      { email: credentials.email },
      "pending"
    );
    logAction(
      "AUTH",
      "LOGIN_ATTEMPT",
      "authService",
      { email: credentials.email },
      "pending"
    );

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, API_DELAYS.LOGIN));

      // Import mock users from JSON file
      const mockUsersData = await import("../../../data/mockUsers.json");
      const mockUsers = mockUsersData.default.users || mockUsersData.users;

      const { email, password } = credentials;
      const user = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      const duration = Date.now() - startTime;

      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        const result = {
          success: true,
          data: {
            user: userWithoutPassword,
            token: `${TOKEN_PATTERNS.MOCK}${user.id}_${Date.now()}`,
          },
        };

        // Log successful operations
        logServiceCall("authService", "login", { email }, "success", duration);
        logAuthEvent("login", "success", userWithoutPassword);
        logAction(
          "AUTH",
          "LOGIN_SUCCESS",
          "authService",
          { userId: user.id, role: user.role },
          "success"
        );
        logDataOperation(
          "user",
          "authenticate",
          user.id,
          { email, role: user.role },
          "success"
        );

        logApiCall(
          "POST",
          API_ENDPOINTS.AUTH.LOGIN,
          { email, password: "***" },
          result,
          duration,
          "success"
        );

        return result;
      } else {
        const result = {
          success: false,
          message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
        };

        // Log failed operations
        logServiceCall("authService", "login", { email }, "error", duration);
        logAuthEvent(
          "login",
          "failure",
          null,
          AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS
        );
        logAction("AUTH", "LOGIN_FAILED", "authService", { email }, "error", {
          reason: "invalid_credentials",
        });

        logApiCall(
          "POST",
          API_ENDPOINTS.AUTH.LOGIN,
          { email, password: "***" },
          result,
          duration,
          "error"
        );

        return result;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const result = {
        success: false,
        message: AUTH_ERROR_MESSAGES.SERVICE_UNAVAILABLE,
      };

      // Log error operations
      logServiceCall(
        "authService",
        "login",
        { email: credentials.email },
        "error",
        duration
      );
      logAuthEvent("login", "error", null, error.message);
      logAction(
        "AUTH",
        "LOGIN_ERROR",
        "authService",
        { error: error.message },
        "error"
      );

      logApiCall(
        "POST",
        API_ENDPOINTS.AUTH.LOGIN,
        { email: credentials.email, password: "***" },
        result,
        duration,
        "error"
      );

      devLog("Error during login:", error);
      return result;
    }
  },

  // User logout
  async logout() {
    const startTime = Date.now();

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Clear any stored tokens/sessions
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);

      const duration = Date.now() - startTime;
      const result = {
        success: true,
        message: "Logged out successfully",
      };

      logApiCall("POST", "/api/auth/logout", {}, result, duration, "success");

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result = {
        success: false,
        message: "Logout failed",
      };

      logApiCall("POST", "/api/auth/logout", {}, result, duration, "error");

      devLog("Error during logout:", error);
      return result;
    }
  },

  // User registration
  async register(userData) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // In a real app, this would create a new user in the database
      const newUser = {
        id: Date.now(),
        email: userData.email,
        name: userData.name,
        role: userData.role || "student",
        studentId: userData.studentId,
        department: userData.department,
        course: userData.course || "N/A",
        avatar: userData.avatar || "/images/avatars/default.jpg",
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: null,
      };
      return {
        success: true,
        message: "Registration successful",
        data: {
          user: newUser,
          token: `${TOKEN_PATTERNS.MOCK}${newUser.id}_${Date.now()}`,
        },
      };
    } catch (error) {
      devLog("Error during registration:", error);
      return {
        success: false,
        message: "Registration failed",
      };
    }
  },

  // Get user profile
  async getProfile(userId) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const mockUsersData = await import("../../../data/mockUsers.json");
      const mockUsers = mockUsersData.default.users || mockUsersData.users;
      const user = mockUsers.find((u) => u.id === parseInt(userId));

      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return {
          success: true,
          data: userWithoutPassword,
        };
      } else {
        return {
          success: false,
          message: "User not found",
        };
      }
    } catch (error) {
      devLog("Error loading user profile:", error);
      return {
        success: false,
        message: "Failed to load user profile",
      };
    }
  },

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedProfile = {
        id: userId,
        ...profileData,
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
      };
    } catch (error) {
      devLog("Error updating profile:", error);
      return {
        success: false,
        message: "Failed to update profile",
      };
    }
  },

  // Change password
  async changePassword(userId, passwordData) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      // In a real app, this would validate current password and update
      const { currentPassword, newPassword } = passwordData;

      // Mock validation
      if (currentPassword === newPassword) {
        return {
          success: false,
          message: "New password must be different from current password",
        };
      }

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      devLog("Error changing password:", error);
      return {
        success: false,
        message: "Failed to change password",
      };
    }
  },

  // Verify token
  async verifyToken(token) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Mock token verification
      if (token && token.startsWith("mock_token_")) {
        return {
          success: true,
          data: { valid: true },
        };
      }

      return {
        success: false,
        data: { valid: false },
      };
    } catch (error) {
      devLog("Error verifying token:", error);
      return {
        success: false,
        data: { valid: false },
      };
    }
  },

  // Get all users (admin only)
  async getAllUsers() {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const mockUsersData = await import("../../../data/mockUsers.json");
      const mockUsers = mockUsersData.default.users || mockUsersData.users;

      // Remove passwords from response
      const usersWithoutPasswords = mockUsers.map((user) => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return {
        success: true,
        data: usersWithoutPasswords,
      };
    } catch (error) {
      devLog("Error loading users:", error);
      return {
        success: false,
        message: "Failed to load users",
        data: [],
      };
    }
  },
};

export default authService;
