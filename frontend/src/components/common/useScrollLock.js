/**
 * Custom hook for managing modal scroll lock functionality
 * Prevents background scrolling when modals are open
 */

import { useEffect } from "react";

// Function to prevent touch move (defined outside to prevent re-creation)
const preventTouchMove = (e) => {
  e.preventDefault();
};

/**
 * useScrollLock - Hook to manage scroll lock for modals
 * @param {boolean} isLocked - Whether scroll should be locked
 * @param {Array} dependencies - Additional dependencies to watch for changes
 */
export const useScrollLock = (isLocked, dependencies = []) => {
  useEffect(() => {
    if (isLocked) {
      // Get the scrollbar width before hiding it to prevent layout shift
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Prevent body scroll
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;

      // Add class for additional CSS-based scroll prevention
      document.body.classList.add("modal-open");

      // Prevent scroll on mobile devices using touch events
      document.addEventListener("touchmove", preventTouchMove, {
        passive: false,
      });
    } else {
      // Reset all scroll prevention measures
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.body.classList.remove("modal-open");
      document.removeEventListener("touchmove", preventTouchMove);
    }

    // Cleanup function to reset everything when component unmounts
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.body.classList.remove("modal-open");
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [isLocked, ...dependencies]);
};

export default useScrollLock;
