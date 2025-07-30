import React, { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);
  const [isAttendanceDetailsModalOpen, setIsAttendanceDetailsModalOpen] =
    useState(false);
  const [isAttendanceFormModalOpen, setIsAttendanceFormModalOpen] =
    useState(false);
  const [isViewAllEventsModalOpen, setIsViewAllEventsModalOpen] =
    useState(false);
  const [isSimplifiedAttendanceForm, setIsSimplifiedAttendanceForm] =
    useState(false); // New state for simplified attendance form
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] =
    useState(null);
  const [selectedEventForAttendance, setSelectedEventForAttendance] =
    useState(null);

  const openLogin = () => {
    setIsRegisterModalOpen(false); // Close register if open
    setIsLoginModalOpen(true);
  };

  const closeLogin = () => {
    setIsLoginModalOpen(false);
  };

  const openRegister = () => {
    setIsLoginModalOpen(false); // Close login if open
    setIsRegisterModalOpen(true);
  };

  const closeRegister = () => {
    setIsRegisterModalOpen(false);
  };

  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setIsEventDetailsModalOpen(true);
  };
  const closeEventDetails = () => {
    setIsEventDetailsModalOpen(false);
    // Optional: clear the selected event after a delay to allow for animations
    setTimeout(() => setSelectedEvent(null), 300);
  };

  const openAttendanceDetails = (record) => {
    setSelectedAttendanceRecord(record);
    setIsAttendanceDetailsModalOpen(true);
  };

  const closeAttendanceDetails = () => {
    setIsAttendanceDetailsModalOpen(false);
    // Clear the selected attendance record after a delay to allow for animations
    setTimeout(() => setSelectedAttendanceRecord(null), 300);
  };

  const openAttendanceForm = (eventId, simplified = false) => {
    setSelectedEventForAttendance(eventId);
    setIsAttendanceFormModalOpen(true);
    setIsSimplifiedAttendanceForm(simplified); // Store the flag for simplified form
  };

  const closeAttendanceForm = () => {
    setIsAttendanceFormModalOpen(false);
    // Clear the selected event after a delay to allow for animations
    setTimeout(() => {
      setSelectedEventForAttendance(null);
      setIsSimplifiedAttendanceForm(false);
    }, 300);
  };

  const openViewAllEventsModal = () => {
    setIsViewAllEventsModalOpen(true);
  };

  const closeViewAllEventsModal = () => {
    setIsViewAllEventsModalOpen(false);
  };

  const value = {
    isLoginModalOpen,
    isRegisterModalOpen,
    isEventDetailsModalOpen,
    isAttendanceDetailsModalOpen,
    isAttendanceFormModalOpen,
    isViewAllEventsModalOpen,
    isSimplifiedAttendanceForm,
    selectedEvent,
    selectedAttendanceRecord,
    selectedEventForAttendance,
    openLogin,
    closeLogin,
    openRegister,
    closeRegister,
    openEventDetails,
    closeEventDetails,
    openAttendanceDetails,
    closeAttendanceDetails,
    openAttendanceForm,
    closeAttendanceForm,
    openViewAllEventsModal,
    closeViewAllEventsModal,
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};
