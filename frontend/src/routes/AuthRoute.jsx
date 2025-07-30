import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import { useModal } from "../components/forms/ModalContext";

const AuthRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { openLogin } = useModal();
  const location = useLocation();

  // Only open login modal if not loading and not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      openLogin();
    }
  }, [isAuthenticated, isLoading, openLogin]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated (only after loading is complete)
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return children;
};

export default AuthRoute;
