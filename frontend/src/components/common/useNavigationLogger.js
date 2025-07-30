/**
 * Navigation Logger Hook
 * Handles centralized navigation logging to prevent duplicate logs
 * Should be used only once at the router level
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { logNavigation } from "./devLogger";

/**
 * Hook to track navigation changes centrally
 * Use this only in the main App component or router
 */
export const useNavigationLogger = () => {
  const location = useLocation();
  const previousLocation = useRef(location.pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip logging on first render to avoid initial route log
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousLocation.current = location.pathname;
      return;
    }

    // Only log if location actually changed
    if (previousLocation.current !== location.pathname) {
      logNavigation(
        previousLocation.current,
        location.pathname,
        "route_change"
      );
      previousLocation.current = location.pathname;
    }
  }, [location.pathname]);
};

// Default export for easier importing
export default useNavigationLogger;
