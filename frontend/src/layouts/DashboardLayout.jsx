import React from "react";
import { useLocation } from "react-router-dom";
import { useModal } from "../components/forms/ModalContext";
import { useTheme } from "../components/layout/ThemeContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AuthModals from "../components/forms/AuthModals";
import ProtectedModals from "../components/forms/ProtectedModals";
import { PUBLIC_ROUTES } from "../components/common/constants/index";

/**
 * AppLayout component that wraps all pages with consistent header/footer
 * Also handles theme application and auth modals
 */
const AppLayout = ({ children }) => {
  const location = useLocation();
  const {
    isLoginModalOpen,
    isRegisterModalOpen,
    openLogin,
    closeLogin,
    openRegister,
    closeRegister,
  } = useModal();

  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  // Check if current route is public using centralized constants
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${themeClasses.background}`}
    >
      <Header isPublic={isPublicRoute} onOpenLogin={openLogin} />{" "}
      <main className={`flex-1 ${themeClasses.text}`}>{children}</main>
      <Footer isPublic={isPublicRoute} onOpenLogin={openLogin} />{" "}
      {/* Auth Modals */}{" "}
      <AuthModals
        isLoginOpen={isLoginModalOpen}
        isRegisterOpen={isRegisterModalOpen}
        onCloseLogin={closeLogin}
        onCloseRegister={closeRegister}
        onOpenLogin={openLogin}
        onOpenRegister={openRegister}
      />
      {/* Protected Modals */}
      <ProtectedModals />
    </div>
  );
};

export default AppLayout;
