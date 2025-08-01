/**
 * AuthContext - Authentication context provider with comprehensive state management
 * Enhanced with campus-aware authentication for multi-campus support
 * 
 * CAMPUS-AWARE ENHANCEMENTS:
 * - Campus context included in authentication state
 * - Campus permissions based on user role (super_admin, campus_admin, organizer, student)
 * - Campus access validation functions
 * - Campus context restoration on session restore
 * - Integration with CampusService for campus data
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";
import {
  AUTH_STORAGE_KEYS,
  API_DELAYS,
  AUTH_ERROR_MESSAGES,
  TOKEN_PATTERNS,
} from "../../components/common/constants/index.js";
import {
  devError,
  devLog,
  logAuthEvent,
  logStateChange,
} from "../../components/common/devLogger.js";
import { CampusService } from "../../services/campusService.js";

/**
 * Authentication actions enum
 */
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  RESTORE_SESSION: "RESTORE_SESSION",
  INITIALIZE_SESSION: "INITIALIZE_SESSION",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  INITIAL_DATA_LOAD_COMPLETE: "INITIAL_DATA_LOAD_COMPLETE",
  UPDATE_CAMPUS_CONTEXT: "UPDATE_CAMPUS_CONTEXT", // New action for campus context updates
};

/**
 * Initial authentication state with campus context
 */
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check for existing session
  initialDataLoadComplete: false, // Track if initial dashboard data has been loaded
  error: null,
  // Campus-aware authentication context
  campusContext: {
    userCampusId: null,
    campusPermissions: {
      canAccessMultipleCampuses: false,
      canSwitchCampuses: false,
      isSuperAdmin: false,
      isCampusAdmin: false,
      accessibleCampusIds: []
    }
  },
  _lastAction: null, // Track last action for logging
  _actionPayload: null, // Store action payload for logging
};

/**
 * authReducer - Authentication state reducer
 */
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        _lastAction: action.type, // Track action for logging
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        campusContext: action.payload.campusContext || state.campusContext, // Include campus context
        _lastAction: action.type,
        _actionPayload: action.payload, // Store payload for logging
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
        _lastAction: action.type,
        _actionPayload: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
        initialDataLoadComplete: false, // Reset on logout
        _lastAction: action.type,
        _actionPayload: { user: state.user }, // Store user for logging
      };
    case AUTH_ACTIONS.RESTORE_SESSION:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        campusContext: action.payload.campusContext || state.campusContext, // Restore campus context
        _lastAction: action.type,
        _actionPayload: action.payload,
      };
    case AUTH_ACTIONS.INITIALIZE_SESSION:
      return {
        ...state,
        isLoading: false,
        _lastAction: action.type,
      };
    case AUTH_ACTIONS.UPDATE_PROFILE: {
      const newUser = { ...state.user, ...action.payload };
      return {
        ...state,
        user: newUser,
        _lastAction: action.type,
        _actionPayload: { oldUser: state.user, newUser },
      };
    }
    case AUTH_ACTIONS.INITIAL_DATA_LOAD_COMPLETE:
      return {
        ...state,
        initialDataLoadComplete: true,
        _lastAction: action.type,
      };
    case AUTH_ACTIONS.UPDATE_CAMPUS_CONTEXT:
      return {
        ...state,
        campusContext: {
          ...state.campusContext,
          ...action.payload,
        },
        _lastAction: action.type,
        _actionPayload: action.payload,
      };
    default:
      return state;
  }
};

// Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const previousState = useRef(initialState);

  // Enhanced state change and auth event logging that prevents duplicates
  useEffect(() => {
    const prev = previousState.current;
    const current = state;

    // Only log if values actually changed
    if (prev.isLoading !== current.isLoading) {
      logStateChange(
        "AuthContext",
        "isLoading",
        prev.isLoading,
        current.isLoading
      );
    }

    if (prev.isAuthenticated !== current.isAuthenticated) {
      logStateChange(
        "AuthContext",
        "isAuthenticated",
        prev.isAuthenticated,
        current.isAuthenticated
      );
    }

    if (
      prev.user !== current.user &&
      JSON.stringify(prev.user) !== JSON.stringify(current.user)
    ) {
      logStateChange("AuthContext", "user", prev.user, current.user);
    }

    if (prev.error !== current.error) {
      logStateChange("AuthContext", "error", prev.error, current.error);
    }

    // Handle auth event logging based on last action (only if action changed)
    if (prev._lastAction !== current._lastAction && current._lastAction) {
      switch (current._lastAction) {
        case AUTH_ACTIONS.LOGIN_START:
          logAuthEvent("login_start", "info");
          break;
        case AUTH_ACTIONS.LOGIN_SUCCESS:
          logAuthEvent("login", "success", current._actionPayload?.user);
          break;
        case AUTH_ACTIONS.LOGIN_FAILURE:
          logAuthEvent("login", "failure", null, current._actionPayload?.error);
          break;
        case AUTH_ACTIONS.LOGOUT:
          logAuthEvent("logout", "success", current._actionPayload?.user);
          break;
        case AUTH_ACTIONS.RESTORE_SESSION:
          logAuthEvent(
            "session_restore",
            "success",
            current._actionPayload?.user
          );
          break;
        case AUTH_ACTIONS.UPDATE_PROFILE:
          // Only log if user actually changed
          if (
            JSON.stringify(current._actionPayload?.oldUser) !==
            JSON.stringify(current._actionPayload?.newUser)
          ) {
            logAuthEvent(
              "profile_update",
              "success",
              current._actionPayload?.newUser
            );
          }
          break;
      }
    }

    // Update previous state
    previousState.current = current;
  }, [state]);

  // Restore session on app start
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
        const user = localStorage.getItem(AUTH_STORAGE_KEYS.USER);

        if (token && user) {
          const parsedUser = JSON.parse(user);

          // Validate the token format to ensure it's still valid
          if (token.startsWith(TOKEN_PATTERNS.MOCK)) {
            // Generate campus context for restored session
            const campusContext = generateCampusContext(parsedUser);
            
            devLog("[AuthContext] Session restored for user:", parsedUser.name, "with campus context:", campusContext);
            dispatch({
              type: AUTH_ACTIONS.RESTORE_SESSION,
              payload: { 
                token, 
                user: parsedUser,
                campusContext
              },
            });
          } else {
            // Invalid token format, clear storage
            localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
            localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
            dispatch({ type: AUTH_ACTIONS.INITIALIZE_SESSION });
          }
        } else {
          // No stored session, just stop loading
          dispatch({ type: AUTH_ACTIONS.INITIALIZE_SESSION });
        }
      } catch (error) {
        devError("[AuthContext] Error parsing stored user data:", error);
        // Clear invalid stored data
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        dispatch({ type: AUTH_ACTIONS.INITIALIZE_SESSION });
      }
    };

    initializeSession();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      // Mock API call - replace with actual API call later
      const mockResponse = await mockApiLogin(credentials);

      if (mockResponse.success) {
        const { user, token } = mockResponse.data;

        // Store in localStorage
        localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token },
        });

        return { success: true };
      } else {
        throw new Error(
          mockResponse.message || AUTH_ERROR_MESSAGES.LOGIN_FAILED
        );
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    devLog("[AuthContext] Logging out user");
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update profile function
  const updateProfile = (profileData) => {
    const updatedUser = { ...state.user, ...profileData };
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    dispatch({
      type: AUTH_ACTIONS.UPDATE_PROFILE,
      payload: profileData,
    });
  };

  // Mark initial data load as complete
  const markInitialDataLoadComplete = () => {
    dispatch({ type: AUTH_ACTIONS.INITIAL_DATA_LOAD_COMPLETE });
  };

  // Update campus context
  const updateCampusContext = (newCampusContext) => {
    devLog("[AuthContext] Updating campus context:", newCampusContext);
    dispatch({
      type: AUTH_ACTIONS.UPDATE_CAMPUS_CONTEXT,
      payload: newCampusContext,
    });
  };

  // Check if user can access specific campus
  const canAccessCampus = (campusId) => {
    if (!state.campusContext.campusPermissions) return false;
    return state.campusContext.campusPermissions.accessibleCampusIds.includes(campusId);
  };

  // Get user's campus permissions
  const getCampusPermissions = () => {
    return state.campusContext.campusPermissions;
  };

  // Context value (exclude internal logging fields)
  const { _lastAction, _actionPayload, ...publicState } = state;
  const value = {
    ...publicState,
    login,
    logout,
    updateProfile,
    markInitialDataLoadComplete,
    updateCampusContext,
    canAccessCampus,
    getCampusPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Mock API login function with campus-aware authentication
const mockApiLogin = async (credentials) => {
  devLog("[AuthContext] Attempting login for:", credentials.email);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, API_DELAYS.LOGIN));

  try {
    // Import mock users from JSON file
    const mockUsersData = await import("../../data/mockUsers.json");
    const mockUsers = mockUsersData.default.users || mockUsersData.users;

    const { email, password } = credentials;
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      
      // Generate campus context based on user
      const campusContext = generateCampusContext(userWithoutPassword);
      
      devLog(
        "[AuthContext] Login successful for user:",
        userWithoutPassword.name,
        "Campus context:",
        campusContext
      );
      
      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token: `${TOKEN_PATTERNS.MOCK}${user.id}_${Date.now()}`,
          campusContext, // Include campus context in login response
        },
      };
    } else {
      devLog("[AuthContext] Login failed: Invalid credentials");
      return {
        success: false,
        message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS,
      };
    }
  } catch (error) {
    devError("[AuthContext] Error loading mock users:", error);
    return {
      success: false,
      message: AUTH_ERROR_MESSAGES.SERVICE_UNAVAILABLE,
    };
  }
};

/**
 * Generate campus context based on user role and campus assignment
 * @param {Object} user - User object with role and campusId
 * @returns {Object} Campus context with permissions
 */
export const generateCampusContext = (user) => {
  const campusService = new CampusService();
  const isSuperAdmin = user.role === 'super_admin';
  const isCampusAdmin = user.role === 'campus_admin' || user.role === 'admin';
  const isOrganizer = user.role === 'organizer';
  
  // Get accessible campus IDs based on role
  let accessibleCampusIds = [user.campusId || 1]; // Default to SNSU
  
  if (isSuperAdmin) {
    // Super admin can access all campuses
    accessibleCampusIds = campusService.getAllCampuses().map(c => c.id);
  } else if (isCampusAdmin) {
    // Campus admin can access their assigned campus
    accessibleCampusIds = [user.campusId || 1];
  }
  
  return {
    userCampusId: user.campusId || 1, // Default to SNSU campus
    campusPermissions: {
      canAccessMultipleCampuses: isSuperAdmin,
      canSwitchCampuses: isSuperAdmin || isCampusAdmin,
      isSuperAdmin,
      isCampusAdmin,
      accessibleCampusIds
    }
  };
};

export default AuthContext;
