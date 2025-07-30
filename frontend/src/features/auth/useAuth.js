/**
 * useAuth Hook - Authentication state management hook
 * Features: Authentication state access, Login/logout functions, User data management
 * Dependencies: AuthContext
 * Global State: Provides access to authentication context
 * Mock Data Integration: Works with mock authentication system
 * Returns: Authentication state and control functions
 */

import { useContext } from "react";
import AuthContext from "./AuthContext";

/**
 * useAuth - Custom hook for accessing authentication context
 * Features: Authentication state, Login/logout functions, Error handling
 * Dependencies: AuthContext
 * @returns {Object} - Authentication state and control functions
 * @throws {Error} - If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuth;
