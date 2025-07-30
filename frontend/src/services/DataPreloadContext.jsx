/**
 * DataPreloadContext - Comprehensive data preloading and caching system
 * Features: Preload all protected page data, localStorage caching, data sync management
 * Dependencies: React context, useReducer, localStorage, API hooks
 * Purpose: Load Dashboard, Attendance, Management, Reports data once and cache for instant navigation
 * Cache Strategy: localStorage with timestamp-based invalidation
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "../features/auth/AuthContext";
import { useApi } from "../hooks/useApi";
import { devLog, devError } from "../components/common/devLogger";

/**
 * Data preload actions enum
 */
const PRELOAD_ACTIONS = {
  START_PRELOAD: "START_PRELOAD",
  DASHBOARD_LOADED: "DASHBOARD_LOADED",
  ATTENDANCE_LOADED: "ATTENDANCE_LOADED",
  EVENTS_LOADED: "EVENTS_LOADED",
  REPORTS_LOADED: "REPORTS_LOADED",
  PRELOAD_COMPLETE: "PRELOAD_COMPLETE",
  PRELOAD_ERROR: "PRELOAD_ERROR",
  RESTORE_FROM_CACHE: "RESTORE_FROM_CACHE",
  CLEAR_CACHE: "CLEAR_CACHE",
  UPDATE_DATA: "UPDATE_DATA",
};

/**
 * Initial preload state
 */
const initialState = {
  isPreloading: false,
  preloadComplete: false,
  dashboardData: null,
  attendanceData: null,
  eventsData: null,
  reportsData: null,
  lastUpdated: null,
  error: null,
  loadingProgress: 0, // 0-100 percentage
};

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  KEY: "eas_preload_cache",
  EXPIRY_HOURS: 1, // Cache expires after 1 hour
  VERSION: "1.1", // Cache version for invalidation - updated to force refresh
};

/**
 * Data preload reducer
 * @param {Object} state - Current preload state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} - New preload state
 */
const preloadReducer = (state, action) => {
  switch (action.type) {
    case PRELOAD_ACTIONS.START_PRELOAD:
      return {
        ...state,
        isPreloading: true,
        preloadComplete: false,
        error: null,
        loadingProgress: 0,
      };
    case PRELOAD_ACTIONS.DASHBOARD_LOADED:
      return {
        ...state,
        dashboardData: action.payload,
        loadingProgress: 25,
      };
    case PRELOAD_ACTIONS.ATTENDANCE_LOADED:
      return {
        ...state,
        attendanceData: action.payload,
        loadingProgress: 50,
      };
    case PRELOAD_ACTIONS.EVENTS_LOADED:
      return {
        ...state,
        eventsData: action.payload,
        loadingProgress: 75,
      };
    case PRELOAD_ACTIONS.REPORTS_LOADED:
      return {
        ...state,
        reportsData: action.payload,
        loadingProgress: 100,
      };
    case PRELOAD_ACTIONS.PRELOAD_COMPLETE:
      return {
        ...state,
        isPreloading: false,
        preloadComplete: true,
        lastUpdated: new Date().toISOString(),
        loadingProgress: 100,
      };
    case PRELOAD_ACTIONS.PRELOAD_ERROR:
      return {
        ...state,
        isPreloading: false,
        error: action.payload,
        loadingProgress: 0,
      };
    case PRELOAD_ACTIONS.RESTORE_FROM_CACHE:
      return {
        ...state,
        ...action.payload,
        isPreloading: false,
        preloadComplete: true,
      };
    case PRELOAD_ACTIONS.CLEAR_CACHE:
      return {
        ...initialState,
      };
    case PRELOAD_ACTIONS.UPDATE_DATA:
      return {
        ...state,
        [action.payload.dataType]: action.payload.data,
        lastUpdated: new Date().toISOString(),
      };
    default:
      return state;
  }
};

// Create contexts
const DataPreloadContext = createContext(null);

/**
 * DataPreloadProvider - Provides preloaded data to all protected pages
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} - Provider component
 */
export const DataPreloadProvider = ({ children }) => {
  const [state, dispatch] = useReducer(preloadReducer, initialState);
  const { user, isAuthenticated } = useAuth();
  const api = useApi();
  const preloadInProgress = useRef(false);

  /**
   * Check if cached data is still valid
   * @param {Object} cachedData - Cached data object
   * @returns {boolean} - True if cache is valid
   */
  const isCacheValid = (cachedData) => {
    if (
      !cachedData ||
      !cachedData.lastUpdated ||
      cachedData.version !== CACHE_CONFIG.VERSION
    ) {
      return false;
    }

    const lastUpdated = new Date(cachedData.lastUpdated);
    const now = new Date();
    const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);

    return hoursDiff < CACHE_CONFIG.EXPIRY_HOURS;
  };

  /**
   * Save data to localStorage cache
   * @param {Object} dataToCache - Data to cache
   */
  const saveToCache = (dataToCache) => {
    try {
      const cacheData = {
        ...dataToCache,
        version: CACHE_CONFIG.VERSION,
        userId: user?.id,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(CACHE_CONFIG.KEY, JSON.stringify(cacheData));
      devLog("[DataPreload] Data saved to cache");
    } catch (error) {
      devError("[DataPreload] Failed to save to cache:", error);
    }
  };

  /**
   * Load data from localStorage cache
   * @returns {Object|null} - Cached data or null if invalid
   */
  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_CONFIG.KEY);
      if (!cached) return null;

      const cachedData = JSON.parse(cached);

      // Check if cache is for current user and still valid
      if (cachedData.userId !== user?.id || !isCacheValid(cachedData)) {
        localStorage.removeItem(CACHE_CONFIG.KEY);
        return null;
      }

      devLog("[DataPreload] Valid cache found, restoring data");
      return cachedData;
    } catch (error) {
      devError("[DataPreload] Failed to load from cache:", error);
      localStorage.removeItem(CACHE_CONFIG.KEY);
      return null;
    }
  };

  /**
   * Preload dashboard data
   * @param {Object} currentUser - Current user object
   * @returns {Object} - Dashboard data
   */
  const preloadDashboardData = async (currentUser) => {
    const eventsResult = await api.events.getUpcomingEvents();
    let upcomingEvents = [];

    if (eventsResult.success) {
      upcomingEvents = eventsResult.data.slice(0, 5);
    }

    let recentAttendance = [];
    let attendanceStats = {
      totalEvents: 0,
      attendedEvents: 0,
      attendanceRate: 0,
    };

    if (currentUser?.role === "student") {
      const attendanceResult = await api.attendance.getAttendanceByUser(
        currentUser.id
      );
      if (attendanceResult.success) {
        recentAttendance = attendanceResult.data.slice(0, 5);
        attendanceStats.attendedEvents = attendanceResult.data.length;

        const totalPossibleEvents =
          upcomingEvents.length + recentAttendance.length;
        const attendedEvents = recentAttendance.filter(
          (record) => record.status === "present"
        ).length;
        attendanceStats.attendanceRate =
          totalPossibleEvents > 0
            ? Math.round((attendedEvents / totalPossibleEvents) * 100)
            : 0;
      }
    } else if (
      currentUser?.role === "admin" ||
      currentUser?.role === "organizer"
    ) {
      const statsResult = await api.attendance.getAttendanceStats();
      if (statsResult.success) {
        attendanceStats = {
          totalEvents: upcomingEvents.length,
          attendedEvents: statsResult.data.totalAttendance || 0,
          attendanceRate:
            statsResult.data.totalAttendance > 0
              ? Math.round(
                  (statsResult.data.presentCount /
                    statsResult.data.totalAttendance) *
                    100
                )
              : 0,
        };
      }
    }

    return {
      upcomingEvents,
      recentAttendance,
      stats: {
        totalEvents: upcomingEvents.length,
        attendedEvents: attendanceStats.attendedEvents,
        upcomingEvents: upcomingEvents.length,
        attendanceRate: attendanceStats.attendanceRate,
      },
    };
  };

  /**
   * Preload attendance data
   * @param {Object} currentUser - Current user object
   * @returns {Object} - Attendance data
   */
  const preloadAttendanceData = async (currentUser) => {
    let attendanceList = [];
    const stats = {
      totalAttendance: 0,
      presentCount: 0,
      verifiedCount: 0,
      byMethod: { qr_code: 0, manual: 0 },
    };

    if (currentUser?.role === "student") {
      const result = await api.attendance.getAttendanceByUser(currentUser.id);
      if (result.success) {
        attendanceList = result.data;
      }
    } else {
      const result = await api.attendance.getAttendance();
      if (result.success) {
        attendanceList = result.data;
      }
    }

    // Calculate stats
    stats.totalAttendance = attendanceList.length;
    stats.presentCount = attendanceList.filter(
      (record) => record.status === "present"
    ).length;
    stats.verifiedCount = attendanceList.filter(
      (record) => record.verified
    ).length;

    attendanceList.forEach((record) => {
      if (
        record.checkInMethod &&
        stats.byMethod[record.checkInMethod] !== undefined
      ) {
        stats.byMethod[record.checkInMethod]++;
      }
    });

    return { attendanceList, stats };
  };

  /**
   * Preload events data
   * @returns {Object} - Events data
   */
  const preloadEventsData = async () => {
    const result = await api.events.getEvents();
    return result.success ? { eventsList: result.data } : { eventsList: [] };
  };

  /**
   * Preload reports data
   * @returns {Object} - Reports data
   */
  const preloadReportsData = async () => {
    const eventsResult = await api.events.getEvents();
    const attendanceResult = await api.attendance.getAttendance();

    const eventsList = eventsResult.success ? eventsResult.data : [];
    const attendanceList = attendanceResult.success
      ? attendanceResult.data
      : [];

    // Calculate report statistics
    const totalEvents = eventsList.length;
    const totalAttendance = attendanceList.length;
    const averageAttendance =
      totalEvents > 0 ? Math.round(totalAttendance / totalEvents) : 0;

    // Find most popular event
    const eventAttendanceCounts = {};
    attendanceList.forEach((record) => {
      eventAttendanceCounts[record.eventId] =
        (eventAttendanceCounts[record.eventId] || 0) + 1;
    });

    const mostPopularEventId = Object.keys(eventAttendanceCounts).reduce(
      (a, b) => (eventAttendanceCounts[a] > eventAttendanceCounts[b] ? a : b),
      null
    );

    const mostPopularEvent = mostPopularEventId
      ? eventsList.find((e) => e.id === parseInt(mostPopularEventId))
      : null;

    return {
      events: eventsList,
      attendance: attendanceList,
      stats: {
        totalEvents,
        totalAttendance,
        averageAttendance,
        mostPopularEvent,
        attendanceByMonth: [], // Can be calculated if needed
      },
    };
  };

  /**
   * Preload all data for protected pages
   */
  const preloadAllData = async () => {
    if (!user || !isAuthenticated || preloadInProgress.current) {
      return;
    }

    try {
      preloadInProgress.current = true;
      dispatch({ type: PRELOAD_ACTIONS.START_PRELOAD });

      devLog(
        "[DataPreload] Starting comprehensive data preload for user:",
        user.id
      );

      // Check cache first
      const cachedData = loadFromCache();
      if (cachedData) {
        dispatch({
          type: PRELOAD_ACTIONS.RESTORE_FROM_CACHE,
          payload: cachedData,
        });
        preloadInProgress.current = false;
        return;
      }

      // Preload all data simultaneously
      const [dashboardData, attendanceData, eventsData, reportsData] =
        await Promise.all([
          preloadDashboardData(user),
          preloadAttendanceData(user),
          preloadEventsData(),
          preloadReportsData(),
        ]);

      // Dispatch each data load
      dispatch({
        type: PRELOAD_ACTIONS.DASHBOARD_LOADED,
        payload: dashboardData,
      });
      dispatch({
        type: PRELOAD_ACTIONS.ATTENDANCE_LOADED,
        payload: attendanceData,
      });
      dispatch({ type: PRELOAD_ACTIONS.EVENTS_LOADED, payload: eventsData });
      dispatch({ type: PRELOAD_ACTIONS.REPORTS_LOADED, payload: reportsData });

      // Mark preload as complete
      dispatch({ type: PRELOAD_ACTIONS.PRELOAD_COMPLETE });

      // Save to cache
      const allData = {
        dashboardData,
        attendanceData,
        eventsData,
        reportsData,
        preloadComplete: true,
        loadingProgress: 100,
      };
      saveToCache(allData);

      devLog("[DataPreload] All data preloaded successfully");
    } catch (error) {
      devError("[DataPreload] Failed to preload data:", error);
      dispatch({
        type: PRELOAD_ACTIONS.PRELOAD_ERROR,
        payload: error.message || "Failed to preload data",
      });
    } finally {
      preloadInProgress.current = false;
    }
  };

  /**
   * Clear cache and reload data
   */
  const clearCacheAndReload = () => {
    localStorage.removeItem(CACHE_CONFIG.KEY);
    dispatch({ type: PRELOAD_ACTIONS.CLEAR_CACHE });
    preloadAllData();
  };

  /**
   * Update specific data type and refresh cache
   * @param {string} dataType - Type of data to update
   * @param {Object} newData - New data to store
   */
  const updateData = (dataType, newData) => {
    dispatch({
      type: PRELOAD_ACTIONS.UPDATE_DATA,
      payload: { dataType, data: newData },
    });

    // Update cache
    saveToCache({
      ...state,
      [dataType]: newData,
    });
  };

  // Effect to start preloading when user is authenticated
  useEffect(() => {
    if (
      user &&
      isAuthenticated &&
      !state.preloadComplete &&
      !preloadInProgress.current
    ) {
      preloadAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  // Effect to clear data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: PRELOAD_ACTIONS.CLEAR_CACHE });
      localStorage.removeItem(CACHE_CONFIG.KEY);
      preloadInProgress.current = false;
    }
  }, [isAuthenticated]);

  const value = {
    ...state,
    preloadAllData,
    clearCacheAndReload,
    updateData,
  };

  return (
    <DataPreloadContext.Provider value={value}>
      {children}
    </DataPreloadContext.Provider>
  );
};

/**
 * Custom hook to use data preload context
 * @returns {Object} - Preload context value
 */
export const useDataPreload = () => {
  const context = useContext(DataPreloadContext);
  if (!context) {
    throw new Error("useDataPreload must be used within a DataPreloadProvider");
  }
  return context;
};

export default DataPreloadContext;
