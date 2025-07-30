import React from "react";
import { useModal } from "../../components/forms/ModalContext";
import { useDataPreload } from "../../services/DataPreloadContext";
import AttendanceDetailsModal from "./AttendanceDetailsModal";
import AttendanceFormModal from "../../features/attendance/AttendanceFormModal";
import ViewAllEventsModal from "./ViewAllEventsModal";

/**
 * ProtectedModals component that manages modals used in protected routes
 */
const ProtectedModals = () => {
  const {
    isAttendanceDetailsModalOpen,
    isAttendanceFormModalOpen,
    isSimplifiedAttendanceForm,
    selectedAttendanceRecord,
    selectedEventForAttendance,
    closeAttendanceDetails,
    closeAttendanceForm,
  } = useModal();

  const { eventsData } = useDataPreload();

  return (
    <>
      <AttendanceDetailsModal
        isOpen={isAttendanceDetailsModalOpen}
        onClose={closeAttendanceDetails}
        record={selectedAttendanceRecord}
      />
      <AttendanceFormModal
        isOpen={isAttendanceFormModalOpen}
        onClose={closeAttendanceForm}
        eventId={selectedEventForAttendance}
        simplified={isSimplifiedAttendanceForm}
      />
      <ViewAllEventsModal events={eventsData?.eventsList || []} />
      {/* Additional protected modals can be added here */}
    </>
  );
};

export default ProtectedModals;
