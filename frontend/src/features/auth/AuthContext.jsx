/**
 * AuthContext - Authentication context provider with comprehensive state management
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
};

/**
 * Initial authentication state
 */
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check for existing session
  initialDataLoadComplete: false, // Track if initial dashboard data has been loaded
  error: null,
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
            devLog("[AuthContext] Session restored for user:", parsedUser.name);
            dispatch({
              type: AUTH_ACTIONS.RESTORE_SESSION,
              payload: { token, user: parsedUser },
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

  // Context value (exclude internal logging fields)
  const { _lastAction, _actionPayload, ...publicState } = state;
  const value = {
    ...publicState,
    login,
    logout,
    updateProfile,
    markInitialDataLoadComplete,
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

// Mock API login function (replace with real API later)
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
      devLog(
        "[AuthContext] Login successful for user:",
        userWithoutPassword.name
      );
      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token: `${TOKEN_PATTERNS.MOCK}${user.id}_${Date.now()}`,
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

export default AuthContext;
