import React, { useMemo, useState } from "react";
import {
  BarChart3,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Building2,
  Download,
  Server,
  HardDrive,
  Cpu,
  Activity,
  Globe,
  Shield,
  Database,
  Network,
  Clock,
  Eye,
  ArrowUp,
  QrCode,
  PenTool,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../auth/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { StatsCard, EmptyState } from "../../components/common";
import QuickActions from "../../components/common/QuickActions";
import {
  EVENT_CATEGORIES,
  EVENT_STATUS,
  STATUS_CONFIG,
  UI_COMPONENT_STYLES,
  ATTENDANCE_STATS_CONFIG,
} from "../../components/common/constants/index";
import { formatDate } from "../../components/common/formatting";
import mockReportsData from "../../data/mockReports.json";
import mockAnalytics from "../../data/mockAnalytics.json";

const ReportsPage = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("overview");

  // Enhanced report data from expanded mock files
  const reportData = useMemo(() => {
    const reportsData = mockReportsData.reportsData || {};
    return {
      events: Array.isArray(reportsData.events) ? reportsData.events : [],
      attendanceStats: reportsData.attendanceStats || {
        totalEvents: 0,
        totalRegistrations: 0,
        totalAttendances: 0,
        overallAttendanceRate: 0,
      },
      departmentStats: Array.isArray(reportsData.departmentStats) ? reportsData.departmentStats : [],
      categoryStats: Array.isArray(reportsData.categoryStats) ? reportsData.categoryStats : [],
      monthlyStats: Array.isArray(reportsData.monthlyStats) ? reportsData.monthlyStats : [],
      campusStats: Array.isArray(reportsData.campusStats) ? reportsData.campusStats : [],
      generatedReports: Array.isArray(mockReportsData.generatedReports) ? mockReportsData.generatedReports : [],
      attendance: Array.isArray(reportsData.attendance) ? reportsData.attendance : [],
    };
  }, []);

  // Get analytics and system performance data
  const analyticsData = mockAnalytics?.websiteAnalytics || {
    visitorsToday: 0,
    averageTimeSpent: "0:00",
    currentActiveUsers: 0,
    totalPageViews: 0,
    hourlyVisitors: [],
    topPages: [],
    trafficSources: {},
    dailyTrends: {}
  };
  const systemData = mockAnalytics?.systemPerformance || {
    serverStatus: { status: "unknown", uptime: "0" },
    performance: {
      cpuUsage: { current: 0, average24h: 0 },
      ramUsage: { usagePercentage: 0, used: "0GB", total: "0GB" },
      networkTraffic: { inbound: "0", outbound: "0", totalToday: "0" }
    },
    storage: {
      usagePercentage: 0,
      usedSpace: "0GB",
      totalCapacity: "0GB",
      databaseSize: "0GB",
      mediaFiles: "0GB",
      backups: "0GB",
      logs: "0GB"
    },
    connectivity: {
      connectionHistory: []
    },
    security: {
      failedLoginAttempts: 0,
      blockedIPs: 0,
      suspiciousActivity: "None"
    },
    database: {
      activeConnections: 0,
      connectionPoolSize: 0,
      queryResponseTime: "0ms",
      slowQueries: 0
    }
  };

  // Chart colors for theme compatibility
  const chartColors = {
    primary: "#22c55e",
    secondary: "#3b82f6",
    tertiary: "#8b5cf6",
    quaternary: "#f59e0b",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  };

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold" style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Prepare hourly data for chart
  const hourlyData = (analyticsData?.hourlyVisitors || []).map((item) => ({
    hour: `${item.hour}:00`,
    visitors: item.visitors,
    time: item.hour,
  }));

  // Prepare connectivity data for chart
  const connectivityData = (systemData?.connectivity?.connectionHistory || []).map(
    (item) => ({
      time: item.time,
      connections: item.connections,
    })
  );

  // Calculate attendance by check-in method from mock data
  const attendanceByMethod = useMemo(() => {
    const qrCodeCount = reportData.attendance.filter(
      (record) =>
        record.checkInMethod === "qr_code" && record.status === "present"
    ).length;

    const manualCount = reportData.attendance.filter(
      (record) =>
        record.checkInMethod === "manual" && record.status === "present"
    ).length;

    return {
      qrCode: qrCodeCount,
      manual: manualCount,
      total: qrCodeCount + manualCount,
    };
  }, [reportData.attendance]);

  const getEventAttendanceRate = (event) => {
    const eventAttendance = reportData.attendance.filter(
      (record) => record.eventId === event.id
    );
    const attendanceCount = eventAttendance.filter(
      (record) => record.status === "present"
    ).length;
    return event.maxAttendees > 0
      ? Math.round((attendanceCount / event.maxAttendees) * 100)
      : 0;
  };

  const generateReport = (type) => {
    // This would generate and download a report
    alert(
      `Generating ${type} report... (Feature will be implemented in Phase 3)`
    );
  };

  // Check if user has access to reports
  const hasReportAccess = user?.role === "admin" || user?.role === "organizer";

  if (!hasReportAccess) {
    return (
      <EmptyState
        icon={<Building2 />}
        title="Access Restricted"
        message="You don't have permission to view reports. Contact an administrator if you need access."
        iconClassName="h-16 w-16 text-theme opacity-50 mx-auto mb-4"
      />
    );
  }

  // No loading state needed for mock data
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Quick Actions at the very top */}
      {(user?.role === "admin" || user?.role === "organizer") && (
        <QuickActions current="reports" />
      )}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-theme">
              Reports & Analytics
            </h1>
            <p className="text-theme opacity-70">
              View attendance statistics, website analytics, and system
              performance
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => generateReport("pdf")}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => generateReport("excel")}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <Button
            variant={activeView === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("overview")}
            className="flex-1"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeView === "analytics" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("analytics")}
            className="flex-1"
          >
            <Globe className="h-4 w-4 mr-2" />
            Website Analytics
          </Button>
          <Button
            variant={activeView === "system" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("system")}
            className="flex-1"
          >
            <Server className="h-4 w-4 mr-2" />
            System Performance
          </Button>
        </div>

        {/* Content based on active view */}
        {activeView === "overview" && (
          <>
            {/* Enhanced Statistics Cards with comprehensive data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Events"
                value={reportData.attendanceStats.totalEvents}
                subtitle={`${reportData.events.length} active events`}
                icon={<Calendar className="h-6 w-6" />}
                iconBg="bg-blue-100 dark:bg-blue-900"
                iconColor="text-blue-600 dark:text-blue-400"
                valueColor="text-blue-600 dark:text-blue-400"
              />

              <StatsCard
                title="Total Attendance"
                value={reportData.attendanceStats.totalAttendances}
                subtitle={`${reportData.attendanceStats.overallAttendanceRate}% rate`}
                icon={<Users className="h-6 w-6" />}
                iconBg="bg-green-100 dark:bg-green-900"
                iconColor="text-green-600 dark:text-green-400"
                valueColor="text-green-600 dark:text-green-400"
              />

              <StatsCard
                title="Departments"
                value={reportData.departmentStats.length}
                subtitle="Active departments"
                icon={<Building2 className="h-6 w-6" />}
                iconBg="bg-purple-100 dark:bg-purple-900"
                iconColor="text-purple-600 dark:text-purple-400"
                valueColor="text-purple-600 dark:text-purple-400"
              />

              <StatsCard
                title="Avg. Attendance"
                value={reportData.attendanceStats.averageAttendeesPerEvent || 0}
                subtitle="per event"
                icon={<BarChart3 className="h-6 w-6" />}
                iconBg="bg-orange-100 dark:bg-orange-900"
                iconColor="text-orange-600 dark:text-orange-400"
                valueColor="text-orange-600 dark:text-orange-400"
              />
            </div>

            {/* Additional Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Department Performance */}
              <Card title="Department Performance">
                <div className="space-y-3">
                  {reportData.departmentStats.slice(0, 5).map((dept) => (
                    <div key={dept.department} className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                          {dept.department.replace(/College of |Department/g, '')}
                        </h4>
                        <p className="text-xs text-foreground-light dark:text-foreground-dark opacity-70">
                          {dept.eventsOrganized} events • {dept.totalAttendees} attendees
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                          {dept.attendanceRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Category Distribution */}
              <Card title="Event Categories">
                <div className="space-y-3">
                  {reportData.categoryStats.slice(0, 5).map((category) => (
                    <div key={category.category} className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                          {category.category}
                        </h4>
                        <p className="text-xs text-foreground-light dark:text-foreground-dark opacity-70">
                          {category.eventCount} events
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-secondary-600 dark:text-secondary-400">
                          {category.totalAttendees}
                        </span>
                        <p className="text-xs text-foreground-light dark:text-foreground-dark opacity-70">
                          attendees
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Monthly Trends */}
              <Card title="Monthly Activity">
                <div className="space-y-3">
                  {reportData.monthlyStats.map((month) => (
                    <div key={month.month} className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-foreground-light dark:text-foreground-dark">
                          {month.month}
                        </h4>
                        <p className="text-xs text-foreground-light dark:text-foreground-dark opacity-70">
                          {month.eventCount} events
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-accent-600 dark:text-accent-400">
                          {month.totalAttendees}
                        </span>
                        <p className="text-xs text-foreground-light dark:text-foreground-dark opacity-70">
                          attendees
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Performance */}
              <Card title="Event Performance">
                <div className="space-y-4">
                  {reportData.events.slice(0, 5).map((event) => {
                    const attendanceRate = getEventAttendanceRate(event);
                    const attendanceCount = reportData.attendance.filter(
                      (r) => r.eventId === event.id && r.status === "present"
                    ).length;

                    return (
                      <div
                        key={event.id}
                        className="border-l-4 border-primary pl-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-theme">
                              {event.title}
                            </h4>
                            <p className="text-sm text-theme opacity-70">
                              {formatDate(event.date)}
                            </p>
                            <p className="text-sm text-theme opacity-60">
                              {event.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary-600 dark:text-primary-400">
                              {attendanceCount}/{event.maxAttendees}
                            </div>
                            <div className="text-sm text-theme opacity-70">
                              {attendanceRate}% attendance
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 w-full bg-theme-light rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(attendanceRate, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card title="Recent Activity">
                <div className="space-y-4">
                  {reportData.attendance.slice(0, 10).map((record) => {
                    const event = reportData.events.find(
                      (e) => e.id === record.eventId
                    );

                    return (
                      <div
                        key={record.id}
                        className="flex items-center justify-between py-2 border-b border-theme-light last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              record.status === "present"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <div>
                            <div className="text-sm font-medium text-theme">
                              {record.userName}
                            </div>
                            <div className="text-sm text-theme opacity-70">
                              {event ? event.title : `Event #${record.eventId}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-theme">
                            {formatDate(record.checkInTime, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-theme opacity-60 capitalize">
                            {record.checkInMethod?.replace("_", " ")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Detailed Reports */}
            <Card title="Generate Detailed Reports">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-theme rounded-lg hover:shadow-theme-md transition-shadow">
                  <BarChart3 className="h-8 w-8 text-theme opacity-60 mx-auto mb-3" />
                  <h3 className="font-semibold text-theme mb-2">
                    Attendance Summary
                  </h3>
                  <p className="text-sm text-theme opacity-70 mb-4">
                    Overall attendance statistics and trends
                  </p>
                  <Button
                    size="sm"
                    onClick={() => generateReport("attendance-summary")}
                  >
                    Generate
                  </Button>
                </div>

                <div className="text-center p-4 border border-theme rounded-lg hover:shadow-theme-md transition-shadow">
                  <Calendar className="h-8 w-8 text-theme opacity-60 mx-auto mb-3" />
                  <h3 className="font-semibold text-theme mb-2">
                    Event Report
                  </h3>
                  <p className="text-sm text-theme opacity-70 mb-4">
                    Detailed event information and performance
                  </p>
                  <Button
                    size="sm"
                    onClick={() => generateReport("event-report")}
                  >
                    Generate
                  </Button>
                </div>

                <div className="text-center p-4 border border-theme rounded-lg hover:shadow-theme-md transition-shadow">
                  <Users className="h-8 w-8 text-theme opacity-60 mx-auto mb-3" />
                  <h3 className="font-semibold text-theme mb-2">
                    Student Report
                  </h3>
                  <p className="text-sm text-theme opacity-70 mb-4">
                    Individual student attendance records
                  </p>
                  <Button
                    size="sm"
                    onClick={() => generateReport("student-report")}
                  >
                    Generate
                  </Button>
                </div>

                <div className="text-center p-4 border border-theme rounded-lg hover:shadow-theme-md transition-shadow">
                  <TrendingUp className="h-8 w-8 text-theme opacity-60 mx-auto mb-3" />
                  <h3 className="font-semibold text-theme mb-2">
                    Trends Analysis
                  </h3>
                  <p className="text-sm text-theme opacity-70 mb-4">
                    Attendance patterns and insights
                  </p>
                  <Button
                    size="sm"
                    onClick={() => generateReport("trends-analysis")}
                  >
                    Generate
                  </Button>
                </div>

                <div className="text-center p-4 border border-theme rounded-lg hover:shadow-theme-md transition-shadow">
                  <Building2 className="h-8 w-8 text-theme opacity-60 mx-auto mb-3" />
                  <h3 className="font-semibold text-theme mb-2">
                    Department Report
                  </h3>
                  <p className="text-sm text-theme opacity-70 mb-4">
                    Department-wise attendance comparison
                  </p>
                  <Button
                    size="sm"
                    onClick={() => generateReport("department-report")}
                  >
                    Generate
                  </Button>
                </div>

                <div className="text-center p-4 border border-theme rounded-lg hover:shadow-theme-md transition-shadow">
                  <FileText className="h-8 w-8 text-theme opacity-60 mx-auto mb-3" />
                  <h3 className="font-semibold text-theme mb-2">
                    Custom Report
                  </h3>
                  <p className="text-sm text-theme opacity-70 mb-4">
                    Build your own custom report
                  </p>
                  <Button
                    size="sm"
                    onClick={() => generateReport("custom-report")}
                  >
                    Build
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Website Analytics View */}
        {activeView === "analytics" && (
          <>
            {/* Website Analytics Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Visitors Today */}
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-theme">
                    Visitors Today
                  </h3>
                  <Eye className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-3xl font-bold text-theme mb-2">
                  {analyticsData.visitorsToday}
                </p>
                <div className="flex items-center text-sm">
                  <span className="flex items-center text-green-600 dark:text-green-400 mr-2">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    {analyticsData.dailyTrends?.todayVsYesterday || "0%"}
                  </span>
                  <span className="text-theme opacity-60">vs yesterday</span>
                </div>
              </div>

              {/* Average Time Spent */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-theme">Avg. Time</h3>
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-theme mb-2">
                  {analyticsData.averageTimeSpent}
                </p>
                <div className="flex items-center text-sm">
                  <span className="flex items-center text-green-600 dark:text-green-400 mr-2">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    {analyticsData.dailyTrends?.timeSpentTrend || "0%"}
                  </span>
                  <span className="text-theme opacity-60">vs yesterday</span>
                </div>
              </div>

              {/* Active Users */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-theme">
                    Active Users
                  </h3>
                  <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-theme mb-2">
                  {analyticsData.currentActiveUsers}
                </p>
                <div className="flex items-center text-sm">
                  <span className="flex items-center text-green-600 dark:text-green-400 mr-2">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    {analyticsData.dailyTrends?.activeUsersTrend || "0%"}
                  </span>
                  <span className="text-theme opacity-60">vs yesterday</span>
                </div>
              </div>

              {/* Page Views */}
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-theme">Page Views</h3>
                  <Globe className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-theme mb-2">
                  {analyticsData.totalPageViews}
                </p>
                <div className="flex items-center text-sm">
                  <span className="flex items-center text-green-600 dark:text-green-400 mr-2">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    {analyticsData.dailyTrends?.pageViewsTrend || "0%"}
                  </span>
                  <span className="text-theme opacity-60">vs yesterday</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Traffic Chart */}
              <Card title="Hourly Website Traffic">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 12 }}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="visitors"
                        stroke={chartColors.primary}
                        fill={chartColors.primary}
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Top Pages */}
              <Card title="Top Pages Performance">
                <div className="space-y-4">
                  {(analyticsData?.topPages || []).map((page, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-theme">
                          {page.page === "/"
                            ? "Home"
                            : page.page
                                .replace("/", "")
                                .charAt(0)
                                .toUpperCase() +
                              page.page.replace("/", "").slice(1)}
                        </div>
                        <div className="text-sm text-theme opacity-60">
                          {page.page}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-theme">
                          {page.views} views
                        </div>
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{
                              width: `${
                                analyticsData?.topPages?.[0]?.views 
                                  ? (page.views / analyticsData.topPages[0].views) * 100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Traffic Sources */}
            <Card title="Traffic Sources Breakdown">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {Object.entries(analyticsData?.trafficSources || {}).map(
                    ([source, count]) => {
                      const total = Object.values(
                        analyticsData?.trafficSources || {}
                      ).reduce((a, b) => a + b, 0);
                      const percentage = Math.round((count / total) * 100);
                      return (
                        <div
                          key={source}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 rounded-full bg-primary-500"></div>
                            <span className="font-medium text-theme capitalize">
                              {source}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-theme">
                              {count} visits
                            </span>
                            <div className="text-sm text-theme opacity-60">
                              {percentage}%
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(analyticsData?.trafficSources || {}).map(
                          ([source, count]) => ({
                            name:
                              source.charAt(0).toUpperCase() + source.slice(1),
                            value: count,
                          })
                        )}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {Object.entries(analyticsData?.trafficSources || {}).map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={Object.values(chartColors)[index]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* System Performance View */}
        {activeView === "system" && (
          <>
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Server Status */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-theme">
                    Server Status
                  </h3>
                  <Server className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2 capitalize">
                  {systemData.serverStatus.status}
                </p>
                <div className="text-sm text-theme opacity-60">
                  Uptime: {systemData.serverStatus.uptime}
                </div>
              </div>

              {/* CPU Usage */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-theme">CPU Usage</h3>
                  <Cpu className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-theme mb-2">
                  {systemData.performance.cpuUsage.current}%
                </p>
                <div className="text-sm text-theme opacity-60">
                  24h avg: {systemData.performance.cpuUsage.average24h}%
                </div>
              </div>

              {/* RAM Usage */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-theme">RAM Usage</h3>
                  <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-theme mb-2">
                  {systemData.performance.ramUsage.usagePercentage}%
                </p>
                <div className="text-sm text-theme opacity-60">
                  {systemData.performance.ramUsage.used} /{" "}
                  {systemData.performance.ramUsage.total}
                </div>
              </div>

              {/* Storage */}
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-theme">Storage</h3>
                  <HardDrive className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-theme mb-2">
                  {systemData.storage.usagePercentage}%
                </p>
                <div className="text-sm text-theme opacity-60">
                  {systemData.storage.usedSpace} /{" "}
                  {systemData.storage.totalCapacity}
                </div>
              </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Server Connectivity */}
              <Card title="Server Connectivity Timeline">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={connectivityData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="opacity-30"
                      />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="connections"
                        stroke={chartColors.secondary}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Storage Breakdown */}
              <Card title="Storage Breakdown">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-theme">Database</span>
                    <span className="font-semibold text-theme">
                      {systemData.storage.databaseSize}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme">Media Files</span>
                    <span className="font-semibold text-theme">
                      {systemData.storage.mediaFiles}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme">Backups</span>
                    <span className="font-semibold text-theme">
                      {systemData.storage.backups}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme">System Logs</span>
                    <span className="font-semibold text-theme">
                      {systemData.storage.logs}
                    </span>
                  </div>

                  {/* Storage Usage Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-theme opacity-70 mb-2">
                      <span>Storage Usage</span>
                      <span>{systemData.storage.usagePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-primary-500 h-3 rounded-full"
                        style={{
                          width: `${systemData.storage.usagePercentage}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* System Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Network Performance */}
              <Card title="Network Performance">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-theme">
                      <Network className="h-4 w-4 mr-2" />
                      Inbound Traffic
                    </span>
                    <span className="font-semibold text-theme">
                      {systemData.performance.networkTraffic.inbound}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-theme">
                      <Network className="h-4 w-4 mr-2" />
                      Outbound Traffic
                    </span>
                    <span className="font-semibold text-theme">
                      {systemData.performance.networkTraffic.outbound}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme">Total Today</span>
                    <span className="font-semibold text-theme">
                      {systemData.performance.networkTraffic.totalToday}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Security Status */}
              <Card title="Security Status">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-theme">
                      <Shield className="h-4 w-4 mr-2" />
                      Failed Logins
                    </span>
                    <span className="font-semibold text-theme">
                      {systemData.security.failedLoginAttempts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme">Blocked IPs</span>
                    <span className="font-semibold text-theme">
                      {systemData.security.blockedIPs}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme">Suspicious Activity</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {systemData.security.suspiciousActivity}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Database Performance */}
              <Card title="Database Performance">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-theme">
                      <Database className="h-4 w-4 mr-2" />
                      Active Connections
                    </span>
                    <span className="font-semibold text-theme">
                      {systemData.database.activeConnections}/
                      {systemData.database.connectionPoolSize}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme">Query Response</span>
                    <span className="font-semibold text-theme">
                      {systemData.database.queryResponseTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-theme">Slow Queries</span>
                    <span className="font-semibold text-theme">
                      {systemData.database.slowQueries}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
