import { EVENT_CATEGORIES, EVENT_STATUS, DEPARTMENTS } from "./constants/index";

/**
 * Shared filter configurations for the application
 * This file centralizes filter configurations to be reused across different pages
 * and components to maintain consistency and reduce redundant code.
 */

/**
 * Helper function to determine semester based on date
 * @param {string} dateString - Date string in ISO format
 * @returns {string} - Semester (1st, 2nd, or summer)
 */
export const getSemesterFromDate = (dateString) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; // getMonth() returns 0-11

  if (month >= 7 && month <= 11) {
    return "1st"; // August to December
  } else if (month >= 1 || month <= 5) {
    return "2nd"; // January to May
  } else {
    return "summer"; // June To July
  }
};

/**
 * Helper function to get unique years from a collection of items with date property
 * @param {Array} items - Array of objects containing a date property
 * @param {string} dateField - The field containing the date string (default: 'date')
 * @returns {Array} - Array of unique years as select options
 */
export const getAvailableYears = (items = [], dateField = "date") => {
  if (!items.length) return [{ value: "all", label: "All Years" }];

  const years = items
    .map((item) => new Date(item[dateField]).getFullYear())
    .filter((year) => !isNaN(year)); // Filter out invalid dates

  const uniqueYears = [...new Set(years)].sort();

  return [
    { value: "all", label: "All Years" },
    ...uniqueYears.map((year) => ({
      value: year.toString(),
      label: year.toString(),
    })),
  ];
};

/**
 * Creates event filter configuration with dynamic year options
 * @param {Array} events - Events array for generating year options
 * @returns {Array} - Filter configuration array
 */
export const createEventFilterConfig = (events = []) => [
  {
    id: "category",
    label: "Category",
    type: "select",
    field: "category",
    value: "",
    defaultValue: "",
    options: EVENT_CATEGORIES,
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    field: "status",
    value: "all",
    defaultValue: "all",
    options: EVENT_STATUS,
  },
  {
    id: "semester",
    label: "Semester",
    type: "select",
    field: "semester",
    value: "all",
    defaultValue: "all",
    options: [
      { value: "all", label: "All Semesters" },
      { value: "1st", label: "1st Semester" },
      { value: "2nd", label: "2nd Semester" },
      { value: "summer", label: "Summer" },
    ],
  },
  {
    id: "year",
    label: "Year",
    type: "select",
    field: "year",
    value: "all",
    defaultValue: "all",
    options: getAvailableYears(events),
  },
];

/**
 * Creates user filter configuration
 * @param {Array} _users - Users array for generating additional options if needed (unused but kept for API consistency)
 * @returns {Array} - Filter configuration array
 */

export const createUserFilterConfig = (_users = []) => [
  {
    id: "role",
    label: "Role",
    type: "select",
    field: "role",
    value: "",
    defaultValue: "",
    options: [
      { value: "", label: "All Roles" },
      { value: "admin", label: "Admin" },
      { value: "student", label: "Student" },
      { value: "faculty", label: "Faculty" },
      { value: "staff", label: "Staff" },
    ],
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    field: "status",
    value: "all",
    defaultValue: "all",
    options: [
      { value: "all", label: "All Status" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "pending", label: "Pending" },
    ],
  },
  {
    id: "department",
    label: "Department",
    type: "select",
    field: "department",
    value: "",
    defaultValue: "",
    options: [
      { value: "", label: "All Departments" },
      ...DEPARTMENTS.map((dept) => ({ value: dept, label: dept })),
    ],
  },
];

/**
 * Creates attendance filter configuration
 * @param {Array} attendanceRecords - Attendance records for generating options
 * @param {Array} events - Events array for generating event options
 * @returns {Array} - Filter configuration array
 */
export const createAttendanceFilterConfig = (
  attendanceRecords = [],
  events = []
) => [
    {
      id: "event",
      label: "Event",
      type: "select",
      field: "eventId",
      value: "all",
      defaultValue: "all",
      options: [
        { value: "all", label: "All Events" },
        ...events.map((event) => ({
          value: event.id.toString(),
          label: event.title,
        })),
      ],
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      field: "status",
      value: "all",
      defaultValue: "all",
      options: [
        { value: "all", label: "All Status" },
        { value: "present", label: "Present" },
        { value: "absent", label: "Absent" },
        { value: "late", label: "Late" },
        { value: "excused", label: "Excused" },
      ],
    },
    {
      id: "method",
      label: "Check-in Method",
      type: "select",
      field: "checkInMethod",
      value: "all",
      defaultValue: "all",
      options: [
        { value: "all", label: "All Methods" },
        { value: "qr_code", label: "QR Code" },
        { value: "manual", label: "Manual" },
      ],
    },
    {
      id: "date",
      label: "Date",
      type: "select",
      field: "checkInTime",
      value: "all",
      defaultValue: "all",
      options: [
        { value: "all", label: "All Dates" },
        { value: "today", label: "Today" },
        { value: "yesterday", label: "Yesterday" },
        { value: "thisWeek", label: "This Week" },
        { value: "lastWeek", label: "Last Week" },
        { value: "thisMonth", label: "This Month" },
        { value: "lastMonth", label: "Last Month" },
      ],
    },
    {
      id: "year",
      label: "Year",
      type: "select",
      field: "year",
      value: "all",
      defaultValue: "all",
      options: getAvailableYears(attendanceRecords, "checkInTime"),
    },
  ];

/**
 * This function filters event data based on search term and selected filter values
 * @param {Array} data - Events array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} filters - Array of filter objects
 * @returns {Array} - Filtered events
 */
export const eventFilterFunction = (data, searchTerm, filters) => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  let filtered = [...data];

  // Apply search term
  if (searchTerm && searchTerm.trim() !== "") {
    const searchTermLower = searchTerm.toLowerCase();
    filtered = filtered.filter((event) => {
      if (!event) return false;

      return (
        (event.title && event.title.toLowerCase().includes(searchTermLower)) ||
        (event.description &&
          event.description.toLowerCase().includes(searchTermLower)) ||
        (event.location &&
          event.location.toLowerCase().includes(searchTermLower)) ||
        (event.venue &&
          event.venue.name &&
          event.venue.name.toLowerCase().includes(searchTermLower))
      );
    });
  }

  // Apply filters if filters array exists
  if (filters && Array.isArray(filters)) {
    filters.forEach((filter) => {
      if (filter && filter.value && filter.value !== filter.defaultValue) {
        switch (filter.id) {
          case "category":
            filtered = filtered.filter(
              (event) => event && event.category === filter.value
            );
            break;
          case "status":
            if (filter.value !== "all") {
              filtered = filtered.filter(
                (event) => event && event.status === filter.value
              );
            }
            break;
          case "semester":
            if (filter.value !== "all") {
              filtered = filtered.filter(
                (event) =>
                  event && getSemesterFromDate(event.date) === filter.value
              );
            }
            break;
          case "year":
            if (filter.value !== "all") {
              filtered = filtered.filter((event) => {
                try {
                  return (
                    event &&
                    event.date &&
                    new Date(event.date).getFullYear().toString() ===
                    filter.value
                  );
                } catch {
                  return false;
                }
              });
            }
            break;
        }
      }
    });
  }

  return filtered;
};

/**
 * Custom filter function for users
 * @param {Array} data - Users array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} filters - Array of filter objects
 * @returns {Array} - Filtered users
 */
export const userFilterFunction = (data, searchTerm, filters) => {
  let filtered = data;

  // Apply search term
  if (searchTerm) {
    filtered = filtered.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id?.toString().includes(searchTerm)
    );
  }

  // Apply filters
  filters.forEach((filter) => {
    if (filter.value && filter.value !== filter.defaultValue) {
      switch (filter.id) {
        case "role":
          filtered = filtered.filter((user) => user.role === filter.value);
          break;
        case "status":
          if (filter.value !== "all") {
            filtered = filtered.filter((user) => user.status === filter.value);
          }
          break;
        case "department":
          filtered = filtered.filter(
            (user) => user.department === filter.value
          );
          break;
      }
    }
  });

  return filtered;
};

/**
 * Custom filter function for attendance records
 * @param {Array} data - Attendance records array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} filters - Array of filter objects
 * @returns {Array} - Filtered attendance records
 */
export const attendanceFilterFunction = (data, searchTerm, filters) => {
  let filtered = data;

  // Apply search term
  if (searchTerm) {
    filtered = filtered.filter(
      (record) =>
        record.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.userId?.toString().includes(searchTerm) ||
        record.eventId?.toString().includes(searchTerm)
    );
  }
  // Apply filters
  filters.forEach((filter) => {
    if (filter.value && filter.value !== filter.defaultValue) {
      switch (filter.id) {
        case "event":
          if (filter.value !== "all") {
            filtered = filtered.filter(
              (record) => record.eventId?.toString() === filter.value
            );
          }
          break;
        case "status":
          if (filter.value !== "all") {
            filtered = filtered.filter(
              (record) => record.status === filter.value
            );
          }
          break;
        case "method":
          if (filter.value !== "all") {
            if (filter.value === "qr_code" || filter.value === "qr") {
              filtered = filtered.filter(
                (record) =>
                  record.checkInMethod === "qr_code" ||
                  record.checkInMethod === "qr" ||
                  record.method === "qr_code" ||
                  record.method === "qr"
              );
            } else {
              filtered = filtered.filter(
                (record) =>
                  record.checkInMethod === filter.value ||
                  record.method === filter.value
              );
            }
          }
          break;
        case "date":
          if (filter.value !== "all") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const thisWeekStart = new Date(today);
            thisWeekStart.setDate(
              thisWeekStart.getDate() - thisWeekStart.getDay()
            );

            const lastWeekStart = new Date(thisWeekStart);
            lastWeekStart.setDate(lastWeekStart.getDate() - 7);

            const thisMonthStart = new Date(
              today.getFullYear(),
              today.getMonth(),
              1
            );

            const lastMonthStart = new Date(
              today.getFullYear(),
              today.getMonth() - 1,
              1
            );
            const lastMonthEnd = new Date(
              today.getFullYear(),
              today.getMonth(),
              0
            );

            filtered = filtered.filter((record) => {
              const recordDate = new Date(record.checkInTime);
              recordDate.setHours(0, 0, 0, 0);

              switch (filter.value) {
                case "today":
                  return recordDate.getTime() === today.getTime();
                case "yesterday":
                  return recordDate.getTime() === yesterday.getTime();
                case "thisWeek":
                  return recordDate >= thisWeekStart && recordDate <= today;
                case "lastWeek":
                  return (
                    recordDate >= lastWeekStart && recordDate < thisWeekStart
                  );
                case "thisMonth":
                  return recordDate >= thisMonthStart && recordDate <= today;
                case "lastMonth":
                  return (
                    recordDate >= lastMonthStart && recordDate <= lastMonthEnd
                  );
                default:
                  return true;
              }
            });
          }
          break;
        case "year":
          if (filter.value !== "all") {
            filtered = filtered.filter(
              (record) =>
                new Date(record.checkInTime).getFullYear().toString() ===
                filter.value
            );
          }
          break;
      }
    }
  });
  return filtered;
};
