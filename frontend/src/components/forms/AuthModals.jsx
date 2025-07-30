import React from "react";
import LoginModal from "../../features/auth/LoginForm";
import RegisterModal from "../../features/auth/RegisterForm";
import EventDetailsModal from "./EventDetailsModal";
import { useModal } from "./ModalContext";

const AuthModals = ({
  isLoginOpen,
  isRegisterOpen,
  onCloseLogin,
  onCloseRegister,
  onOpenLogin,
  onOpenRegister,
}) => {
  const { isEventDetailsModalOpen, selectedEvent, closeEventDetails } =
    useModal();

  const handleSwitchToRegister = () => {
    onCloseLogin();
    onOpenRegister();
  };

  const handleSwitchToLogin = () => {
    onCloseRegister();
    onOpenLogin();
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={onCloseLogin}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={onCloseRegister}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <EventDetailsModal
        isOpen={isEventDetailsModalOpen}
        onClose={closeEventDetails}
        event={selectedEvent}
      />
    </>
  );
};

export default AuthModals;
