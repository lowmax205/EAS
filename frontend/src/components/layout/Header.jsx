import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useTheme } from "./ThemeContext";
import {
  Menu,
  X,
  Home,
  Calendar,
  BarChart3,
  Users,
  User,
  LogOut,
  Bell,
  Settings,
  Map,
} from "lucide-react";
import Button from "../ui/Button";
import SNSULogo from "../../assets/images/SNSU-Logo.jpg";
import USCLogo from "../../assets/images/USC-Logo2.png";
import ThemeToggle from "../ui/ThemeToggle";
import { APP_NAME, NAVIGATION_ITEMS } from "../common/constants/index";
import { generateAvatarWithStyle } from "../../features/profile/avatarUtils.js";
import { useLogger } from "../common/useLogger.jsx";
import {
  logUIInteraction,
  logRouteChange,
  logAction,
  logComponentLifecycle,
} from "../common/devLogger";
import NotificationBell from "../../features/dashboard/widgets/ui/NotificationBell";

/**
 * Header component for the application
 * Handles navigation, authentication actions, and responsive menu
 */
const Header = ({ isPublic, onOpenLogin }) => {
  // Enhanced logging setup
  const logger = useLogger("Header", { logMountUnmount: false });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle logout action
  const handleLogout = () => {
    logUIInteraction("button", "logout", "click", { userRole: user?.role });
    logAction(
      "AUTH",
      "LOGOUT_INITIATED",
      "Header",
      { userId: user?.id },
      "pending"
    );

    logger.userInteraction("logout_click", {
      userRole: user?.role,
      currentPath: location.pathname,
    });

    logout();
    navigate("/");

    // Log successful logout navigation
    logRouteChange(location.pathname, "/", "logout_redirect");
    logAction(
      "AUTH",
      "LOGOUT_SUCCESS",
      "Header",
      { previousPath: location.pathname },
      "success"
    );
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;

    logUIInteraction("button", "mobile-menu-toggle", "click", { newState });
    logAction(
      "UI",
      "MOBILE_MENU_TOGGLE",
      "Header",
      { isOpen: newState },
      "info"
    );

    logger.userInteraction("mobile_menu_toggle", {
      isOpen: newState,
      currentPath: location.pathname,
    });
    setIsMobileMenuOpen(newState);
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    const newState = !isProfileDropdownOpen;

    logUIInteraction("dropdown", "profile-dropdown", "toggle", {
      isOpen: newState,
    });
    logAction(
      "UI",
      "PROFILE_DROPDOWN_TOGGLE",
      "Header",
      { isOpen: newState },
      "info"
    );

    logger.userInteraction("profile_dropdown_toggle", {
      isOpen: newState,
      userRole: user?.role,
    });
    setIsProfileDropdownOpen(newState);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Navigation items definitions
  const publicNavItems = NAVIGATION_ITEMS.PUBLIC;
  const protectedNavItems = NAVIGATION_ITEMS.PROTECTED;

  // Icon mapping for navigation items
  const iconMap = {
    Home,
    Calendar,
    BarChart3,
    Users,
    User,
    Settings,
    Map,
  };

  // Helper function to get icon component from string
  const getIconComponent = (iconName) => {
    return iconMap[iconName] || Home;
  };

  // Get profile dropdown items based on user role
  const getProfileDropdownItems = () => {
    const baseItems = [
      { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
      { name: "Attendance", href: "/attendance", icon: Users },
    ];

    // Add Management for admin and organizer roles
    if (user?.role === "admin" || user?.role === "organizer") {
      baseItems.push({
        name: "Management",
        href: "/management",
        icon: Settings,
      });
    }

    // Only show Reports menu for admin and organizer roles
    if (user?.role === "admin" || user?.role === "organizer") {
      baseItems.push({ name: "Reports", href: "/reports", icon: BarChart3 });
    }

    return baseItems;
  };

  const navItems = isPublic ? publicNavItems : protectedNavItems;

  // Check if a route is active
  const isActiveRoute = (href) => {
    return location.pathname === href;
  };

  return (
    <header
      className="sticky top-0 z-10 w-full h-16 backdrop-blur-md"
      style={{
        background:
          "linear-gradient(to right, rgba(22, 163, 74, 0.98), rgba(21, 128, 61, 0.98))",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 no-underline">
              <img
                src={SNSULogo}
                alt="SNSU Logo"
                className="w-8 h-8 rounded-full"
              />
              <img
                src={USCLogo}
                alt="USC Logo"
                className="w-8 h-8 bg-white rounded-full"
              />
              <span className="text-xl font-bold text-white hover:text-green-200">
                {APP_NAME}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="items-center hidden space-x-4 md:flex">
            {/* Nav Links */}
            {navItems.map((item, index) => {
              const Icon = getIconComponent(item.icon);
              // Add extra margin to Events button
              const extraSpacing = item.name === "Events" ? "mr-4" : "";
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${extraSpacing} ${
                    isActiveRoute(item.href)
                      ? "text-white bg-green-700"
                      : "text-white hover:text-white hover:bg-green-700"
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </span>
                </Link>
              );
            })}

            {/* Notification Bell - only show for authenticated users */}
            {isAuthenticated && (
              <div className="flex items-center">
                <NotificationBell userRole={user?.role} />
              </div>
            )}

            {/* User Actions */}
            {isAuthenticated ? (
              <UserProfileSection
                user={user}
                isProfileDropdownOpen={isProfileDropdownOpen}
                toggleProfileDropdown={toggleProfileDropdown}
                profileDropdownRef={profileDropdownRef}
                getProfileDropdownItems={getProfileDropdownItems}
                handleLogout={handleLogout}
              />
            ) : (
              <AuthButtons onOpenLogin={onOpenLogin} />
            )}

            {/* Theme Toggle */}
            <div className="flex items-center ml-2">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Notification Bell for authenticated mobile users */}
            {isAuthenticated && (
              <div className="flex items-center">
                <NotificationBell userRole={user?.role} />
              </div>
            )}
            
            {/* Theme Toggle for Mobile */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <MobileMenu
          navItems={navItems}
          isAuthenticated={isAuthenticated}
          user={user}
          getProfileDropdownItems={getProfileDropdownItems}
          handleLogout={handleLogout}
          onOpenLogin={onOpenLogin}
          isActiveRoute={isActiveRoute}
          getIconComponent={getIconComponent}
        />
      )}
    </header>
  );
};

/**
 * User Profile Section Component with dropdown
 */
const UserProfileSection = ({
  user,
  isProfileDropdownOpen,
  toggleProfileDropdown,
  profileDropdownRef,
  getProfileDropdownItems,
  handleLogout,
}) => {
  const { resolvedTheme } = useTheme();
  const avatarWithStyle = generateAvatarWithStyle(
    user?.name,
    resolvedTheme === "dark"
  );

  return (
    <div className="flex items-center space-x-3">
      <div className="relative" ref={profileDropdownRef}>
        <button
          onClick={toggleProfileDropdown}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-theme bg-theme rounded-lg shadow-theme hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 theme-transition"
        >
          <div className="flex-shrink-0 w-6 h-6 mr-2 overflow-hidden rounded-full">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            ) : (
              <div
                className={`flex items-center justify-center w-full h-full text-white bg-gradient-to-br ${avatarWithStyle.color} theme-transition`}
                style={avatarWithStyle.style}
              >
                <span className="text-xs font-bold">
                  {avatarWithStyle.initial}
                </span>
              </div>
            )}
          </div>
          <span className="text-theme">{user?.name}</span>
        </button>

        {/* Dropdown Menu */}
        {isProfileDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 card-theme rounded-md shadow-theme-lg border transition-all duration-200 z-50">
            <div className="py-1">
              {/* Dashboard/Attendance items for authenticated users */}
              {getProfileDropdownItems().map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-theme hover:bg-secondary-100 dark:hover:bg-secondary-800 theme-transition"
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <hr className="my-1 border-border-light dark:border-border-dark" />
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-theme hover:bg-secondary-100 dark:hover:bg-secondary-800 theme-transition"
              >
                <User size={16} />
                <span>Profile</span>
              </Link>
              <hr className="my-1 border-border-light dark:border-border-dark" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-10"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Authentication Buttons Component
 */
const AuthButtons = ({ onOpenLogin }) => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        className="bg-transparent border border-white text-white hover:bg-white hover:text-green-700"
        onClick={onOpenLogin}
      >
        Log in
      </Button>
    </div>
  );
};

/**
 * Mobile Menu Component
 */
const MobileMenu = ({
  navItems,
  isAuthenticated,
  user: _user,
  getProfileDropdownItems,
  handleLogout,
  onOpenLogin,
  isActiveRoute,
  getIconComponent: _getIconComponent,
}) => {
  return (
    <div className="md:hidden bg-green-700 shadow-lg">
      <div className="px-2 pt-2 pb-3 space-y-1">
        {/* Nav Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-2 px-3 py-2 text-base font-medium rounded-md ${
                isActiveRoute(item.href)
                  ? "bg-green-800 text-white"
                  : "text-white hover:bg-green-800"
              }`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Authenticated User Menu Items */}
        {isAuthenticated && (
          <>
            <hr className="border-green-600" />
            {getProfileDropdownItems().map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-white hover:bg-green-800 rounded-md"
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <Link
              to="/profile"
              className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-white hover:bg-green-800 rounded-md"
            >
              <User size={18} />
              <span>Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-2 px-3 py-2 text-base font-medium text-white hover:bg-green-800 rounded-md"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </>
        )}

        {/* Auth Buttons for Non-Authenticated Users */}
        {!isAuthenticated && (
          <div className="pt-3">
            <button
              onClick={onOpenLogin}
              className="w-full bg-transparent border border-white text-white rounded-md py-2 text-center hover:bg-green-800"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
