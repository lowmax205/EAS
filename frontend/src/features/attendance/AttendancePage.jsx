import React, { useMemo, useCallback, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  FileText,
  BarChart3,
  Download,
  CheckCircle,
  Eye,
  QrCode,
  Hand,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useDataPreload } from "../../services/DataPreloadContext";
import { useModal } from "../../components/forms/ModalContext";
import { formatDateTime } from "../../components/common/formatting";
import { usePagination } from "../../components/common";
import { ATTENDANCE_STATS_CONFIG } from "../../components/common/constants/index";
import Button from "../../components/ui/Button";
import FilterComponent from "../../components/common/FilterComponent";
import useFilters from "../../components/common/useFilters";
import {
  createAttendanceFilterConfig,
  attendanceFilterFunction,
} from "../../components/common/filterConfigs";
import {
  StatsCard,
  StatusIndicator,
  MethodIndicator,
  EmptyState,
  DataTable,
  ErrorDisplay,
  LoadingSpinner,
} from "../../components/common";
import QuickActions from "../../components/common/QuickActions";

const AttendancePage = () => {
  const { user } = useAuth();
  const {
    attendanceData,
    eventsData,
    isPreloading,
    error: preloadError,
  } = useDataPreload();
  const { openAttendanceDetails, openAttendanceForm } = useModal();

  // Use preloaded data with memoization
  const attendanceList = useMemo(() => {
    return attendanceData?.attendanceList || [];
  }, [attendanceData?.attendanceList]);

  const eventsList = useMemo(() => {
    return eventsData?.eventsList || [];
  }, [eventsData?.eventsList]);

  // Enhanced statistics calculation from expanded attendance data
  const stats = useMemo(() => {
    const defaultStats = {
      totalAttendance: 0,
      presentCount: 0,
      verifiedCount: 0,
      byMethod: { qr: 0, manual: 0 },
      byDepartment: {},
      byGender: { male: 0, female: 0 },
      byCampus: {},
    };

    if (!attendanceList || attendanceList.length === 0) {
      return defaultStats;
    }

    // Calculate comprehensive statistics
    const calculatedStats = attendanceList.reduce((acc, record) => {
      // Basic counts
      acc.totalAttendance++;
      if (record.status === 'present') acc.presentCount++;
      acc.verifiedCount++; // All records in our data are verified

      // Method breakdown - handle both method and checkInMethod fields with different formats
      if (
        record.method === "qr" || 
        record.method === "qr_code" || 
        record.checkInMethod === "qr" || 
        record.checkInMethod === "qr_code"
      ) {
        acc.byMethod.qr = (acc.byMethod.qr || 0) + 1;
      } else if (
        record.method === "manual" || 
        record.checkInMethod === "manual"
      ) {
        acc.byMethod.manual = (acc.byMethod.manual || 0) + 1;
      }

      // Department breakdown
      const dept = record.departmentName || 'Unknown';
      acc.byDepartment[dept] = (acc.byDepartment[dept] || 0) + 1;

      // Gender breakdown
      const gender = record.gender || 'unknown';
      if (gender === 'male' || gender === 'female') {
        acc.byGender[gender]++;
      }

      // Campus breakdown
      const campus = record.college || 'Unknown Campus';
      acc.byCampus[campus] = (acc.byCampus[campus] || 0) + 1;

      return acc;
    }, { ...defaultStats });

    return calculatedStats;
  }, [attendanceList]);

  // Helper function to get event title
  const getEventTitle = useCallback(
    (eventId) => {
      const event = eventsList.find((e) => e.id === eventId);
      return event ? event.title : `Event #${eventId}`;
    },
    [eventsList]
  );

  // Set up attendance filtering with enhanced data
  const enhancedAttendanceList = useMemo(() => {
    return attendanceList.map((record) => ({
      ...record,
      eventTitle: getEventTitle(record.eventId),
    }));
  }, [attendanceList, getEventTitle]);

  const filterConfig = useMemo(() => {
    return createAttendanceFilterConfig(enhancedAttendanceList, eventsList);
  }, [enhancedAttendanceList, eventsList]);

  const {
    searchTerm,
    setSearchTerm,
    filters,
    filteredData: filteredAttendance,
    handleFilterChange,
    clearAllFilters,
  } = useFilters(
    filterConfig,
    enhancedAttendanceList,
    attendanceFilterFunction
  );

  // Pagination for attendance records (default: 10 items per page)
  const {
    paginatedData: paginatedAttendance,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    onPageChange,
    onItemsPerPageChange,
    resetPagination,
  } = usePagination(filteredAttendance, 10);

  // Reset pagination when filtered data changes
  useEffect(() => {
    resetPagination();
  }, [filteredAttendance.length, resetPagination]);

  // Show loading skeleton while preloading
  if (isPreloading) {
    return <LoadingSpinner message="Loading attendance data..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Quick Actions at the very top */}
      {(user?.role === "admin" || user?.role === "organizer") && (
        <QuickActions current="attendance" />
      )}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-theme">
              {user?.role === "student"
                ? "My Attendance"
                : "Attendance Records"}
            </h1>
            <p className="text-theme opacity-70 mt-1">
              {user?.role === "student"
                ? "Track your event attendance and participation"
                : "Monitor and manage event attendance records"}
            </p>
          </div>
          {(user?.role === "admin" || user?.role === "organizer") && (
            <div className="flex gap-3">
              <Button
                onClick={() =>
                  openAttendanceForm(1)
                } /* Pass event ID 1 for demo/preview */
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview the Attendance Form
              </Button>
              <Button
                onClick={() =>
                  openAttendanceForm(1, true)
                } /* Pass event ID and simplified flag */
                className="flex items-center gap-2"
              >
                <Hand className="h-4 w-4" />
                Manual Attendance Entry
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Records
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Stats Cards with comprehensive data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Records"
            value={stats.totalAttendance}
            subtitle="Attendance records"
            icon={<BarChart3 />}
            iconBg={ATTENDANCE_STATS_CONFIG.totalRecords.iconBg}
            iconColor={ATTENDANCE_STATS_CONFIG.totalRecords.iconColor}
          />
          <StatsCard
            title="Present"
            value={stats.presentCount}
            subtitle="Successful check-ins"
            icon={<CheckCircle />}
            iconBg={ATTENDANCE_STATS_CONFIG.present.iconBg}
            iconColor={ATTENDANCE_STATS_CONFIG.present.iconColor}
            valueColor={ATTENDANCE_STATS_CONFIG.present.valueColor}
          />
          <StatsCard
            title="QR Code"
            value={stats.byMethod?.qr || 0}
            subtitle={`Manual: ${stats.byMethod?.manual || 0}`}
            icon={<QrCode />}
            iconBg={ATTENDANCE_STATS_CONFIG.qrCode.iconBg}
            iconColor={ATTENDANCE_STATS_CONFIG.qrCode.iconColor}
            valueColor={ATTENDANCE_STATS_CONFIG.qrCode.valueColor}
          />
          <StatsCard
            title="Departments"
            value={Object.keys(stats.byDepartment).length}
            subtitle="Active departments"
            icon={<User />}
            iconBg="bg-purple-100 dark:bg-purple-900"
            iconColor="text-purple-600 dark:text-purple-400"
            valueColor="text-purple-600 dark:text-purple-400"
          />
        </div>

        {/* Additional Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card-light dark:bg-card-dark rounded-lg p-6 shadow-light-sm dark:shadow-dark-sm">
            <h3 className="text-sm font-medium text-foreground-light dark:text-foreground-dark mb-4">
              Campus Distribution
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.byCampus).map(([campus, count]) => (
                <div key={campus} className="flex justify-between">
                  <span className="text-sm text-foreground-light dark:text-foreground-dark opacity-70">
                    {campus}
                  </span>
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-card-light dark:bg-card-dark rounded-lg p-6 shadow-light-sm dark:shadow-dark-sm">
            <h3 className="text-sm font-medium text-foreground-light dark:text-foreground-dark mb-4">
              Gender Distribution
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-foreground-light dark:text-foreground-dark opacity-70">
                  Male
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {stats.byGender.male}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-foreground-light dark:text-foreground-dark opacity-70">
                  Female
                </span>
                <span className="text-sm font-medium text-pink-600 dark:text-pink-400">
                  {stats.byGender.female}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-card-light dark:bg-card-dark rounded-lg p-6 shadow-light-sm dark:shadow-dark-sm">
            <h3 className="text-sm font-medium text-foreground-light dark:text-foreground-dark mb-4">
              Check-in Methods
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-foreground-light dark:text-foreground-dark opacity-70">
                  QR Code
                </span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {stats.byMethod.qr || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-foreground-light dark:text-foreground-dark opacity-70">
                  Manual Entry
                </span>
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {stats.byMethod.manual || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <FilterComponent
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Search attendance records..."
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearAllFilters}
          showActiveFilters={true}
          showResultsCount={true}
          totalResults={attendanceList.length}
          filteredResults={filteredAttendance.length}
          variant="dropdown"
        />

        {/* Attendance Records */}
        {filteredAttendance.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title="No Attendance Records Found"
            message={
              attendanceList.length === 0
                ? "No attendance records available yet."
                : "No attendance records match your current filters. Try adjusting your search criteria."
            }
            actionLabel={attendanceList.length > 0 ? "Clear Filters" : null}
            onAction={attendanceList.length > 0 ? clearAllFilters : null}
          />
        ) : (
          <DataTable
            title={`Attendance Records (${filteredAttendance.length})`}
            subtitle={`Total records available`}
            enablePagination={true}
            paginationConfig={{
              currentPage,
              itemsPerPage,
              totalItems: filteredAttendance.length,
              onPageChange,
              onItemsPerPageChange,
              itemsPerPageOptions: [10, 20, 30, 50],
            }}
            columns={[
              {
                key: "event",
                header: "Event",
                render: (record) => (
                  <div>
                    <div className="text-sm font-medium text-theme">
                      {getEventTitle(record.eventId)}
                    </div>
                    <div className="text-sm text-theme opacity-70">
                      Event #{record.eventId}
                    </div>
                  </div>
                ),
              },
              ...(user?.role !== "student"
                ? [
                    {
                      key: "student",
                      header: "Student",
                      render: (record) => (
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-theme">
                              {record.userName}
                            </div>
                            <div className="text-sm text-theme opacity-70">
                              {record.studentId}
                            </div>
                          </div>
                        </div>
                      ),
                    },
                  ]
                : []),
              {
                key: "checkInTime",
                header: "Check-in Time",
                render: (record) => (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm text-theme">
                      {formatDateTime(record.checkInTime)}
                    </span>
                  </div>
                ),
              },
              {
                key: "method",
                header: "Method",
                render: (record) => (
                  <MethodIndicator method={record.checkInMethod || record.method || "Unknown"} />
                ),
              },
              {
                key: "verified",
                header: "Verified",
                render: (record) => (
                  <StatusIndicator
                    status={(record.isVerified || record.verified) ? "verified" : "unverified"}
                  />
                ),
              },
            ]}
            data={paginatedAttendance}
            showActions={true} /* Show actions for all user roles */
            onRowAction={(record) =>
              openAttendanceDetails({
                ...record,
                eventTitle: getEventTitle(record.eventId),
              })
            }
          />
        )}

        {preloadError && <ErrorDisplay error={preloadError} />}
      </div>
    </div>
  );
};

export default AttendancePage;
