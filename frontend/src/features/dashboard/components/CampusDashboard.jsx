/**
 * Campus Dashboard Component
 * Story 1.6: Campus-Specific Reporting & Analytics - Task 1
 * 
 * Campus-aware dashboard showing analytics isolated to the user's campus context
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Activity,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
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
  BarChart,
  Bar
} from 'recharts';
import { useCampus } from '../../../contexts/CampusContext';
import campusAnalyticsService from '../../../services/campusAnalyticsService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { StatsCard } from '../../../components/common';
import { CampusSelector } from '../../../components/ui/CampusSelector';
import { devLog, devError } from '../../../components/common/devLogger';

/**
 * Campus-specific dashboard with analytics and metrics
 */
const CampusDashboard = () => {
  const { 
    currentCampus, 
    userCampusPermissions, 
    availableCampuses,
    isLoading: campusLoading 
  } = useCampus();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [crossCampusData, setCrossCampusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampusId, setSelectedCampusId] = useState(null);
  const [viewMode, setViewMode] = useState('campus'); // 'campus' or 'system'

  // Load campus analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (campusLoading || !currentCampus) return;

      setIsLoading(true);
      try {
        // Load campus-specific analytics
        const campusData = await campusAnalyticsService.getCampusDashboardAnalytics(
          { currentCampus, userCampusPermissions, availableCampuses },
          { selectedCampusId: selectedCampusId || currentCampus.id }
        );
        
        setAnalyticsData(campusData);

        // Load cross-campus data for super admins
        if (userCampusPermissions.isSuperAdmin) {
          const systemData = await campusAnalyticsService.getCrossCampusAnalytics(
            { currentCampus, userCampusPermissions, availableCampuses }
          );
          setCrossCampusData(systemData);
        }

        devLog("[CampusDashboard] Analytics data loaded successfully");
      } catch (error) {
        devError("[CampusDashboard] Error loading analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [campusLoading, currentCampus, userCampusPermissions, availableCampuses, selectedCampusId]);

  // Handle campus selection for super admins
  const handleCampusChange = (newCampusId) => {
    setSelectedCampusId(newCampusId);
  };

  // Chart colors for consistent theming
  const chartColors = {
    primary: currentCampus?.theme?.primary || '#3B82F6',
    secondary: currentCampus?.theme?.secondary || '#8B5CF6',
    accent: currentCampus?.theme?.accent || '#10B981'
  };

  // Memoized chart data
  const pieChartData = useMemo(() => {
    if (!analyticsData?.charts?.eventsByCategory) return [];
    return analyticsData.charts.eventsByCategory.map((item, index) => ({
      ...item,
      color: [chartColors.primary, chartColors.secondary, chartColors.accent, '#F59E0B', '#EF4444'][index % 5]
    }));
  }, [analyticsData, chartColors]);

  if (campusLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-80 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayedCampus = analyticsData?.campusInfo || currentCampus;
  const metrics = analyticsData?.metrics || {};

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Campus Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {viewMode === 'system' ? 'System Overview' : `${displayedCampus.campusName} Dashboard`}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {viewMode === 'system' 
              ? 'Cross-campus analytics and system metrics'
              : `Campus-specific analytics and metrics for ${displayedCampus.campusCode}`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle for Super Admin */}
          {userCampusPermissions.isSuperAdmin && (
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={viewMode === 'campus' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('campus')}
                className="px-3 py-1"
              >
                Campus View
              </Button>
              <Button
                variant={viewMode === 'system' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('system')}
                className="px-3 py-1"
              >
                System View
              </Button>
            </div>
          )}

          {/* Campus Selector for Super Admin in Campus View */}
          {userCampusPermissions.isSuperAdmin && viewMode === 'campus' && (
            <CampusSelector 
              value={selectedCampusId || currentCampus.id}
              onValueChange={handleCampusChange}
              placeholder="Select Campus"
              className="w-48"
            />
          )}
        </div>
      </div>

      {/* System View for Super Admin */}
      {viewMode === 'system' && crossCampusData && (
        <div className="space-y-6">
          {/* System-Wide Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatsCard
              title="Total Campuses"
              value={crossCampusData.systemMetrics.totalCampuses}
              subtitle="Active campuses"
              icon={<Building2 />}
              iconBg="bg-blue-100 dark:bg-blue-900"
              iconColor="text-blue-600 dark:text-blue-400"
            />
            <StatsCard
              title="Total Events"
              value={crossCampusData.systemMetrics.totalEvents}
              subtitle="System-wide"
              icon={<Calendar />}
              iconBg="bg-green-100 dark:bg-green-900"
              iconColor="text-green-600 dark:text-green-400"
            />
            <StatsCard
              title="Total Users"
              value={crossCampusData.systemMetrics.totalUsers}
              subtitle="All campuses"
              icon={<Users />}
              iconBg="bg-purple-100 dark:bg-purple-900"
              iconColor="text-purple-600 dark:text-purple-400"
            />
            <StatsCard
              title="Total Attendance"
              value={crossCampusData.systemMetrics.totalAttendance}
              subtitle="All records"
              icon={<Activity />}
              iconBg="bg-orange-100 dark:bg-orange-900"
              iconColor="text-orange-600 dark:text-orange-400"
            />
            <StatsCard
              title="Avg Events/Campus"
              value={crossCampusData.systemMetrics.averageEventsPerCampus}
              subtitle="Per campus"
              icon={<BarChart3 />}
              iconBg="bg-pink-100 dark:bg-pink-900"
              iconColor="text-pink-600 dark:text-pink-400"
            />
            <StatsCard
              title="Avg Users/Campus"
              value={crossCampusData.systemMetrics.averageUsersPerCampus}
              subtitle="Per campus"
              icon={<TrendingUp />}
              iconBg="bg-indigo-100 dark:bg-indigo-900"
              iconColor="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          {/* Cross-Campus Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Campus Events Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={crossCampusData.crossCampusCharts.campusEventsComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="campus" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="events" fill={chartColors.primary} name="Events" />
                    <Bar dataKey="attendance" fill={chartColors.secondary} name="Attendance" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Attendance Rate by Campus</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={crossCampusData.crossCampusCharts.attendanceRateComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="campus" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                    <Bar dataKey="rate" fill={chartColors.accent} name="Attendance Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Campus Comparison Table */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Campus Performance Summary</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Campus
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Events
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Attendance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {crossCampusData.campusComparison.map((campus) => (
                      <tr key={campus.campusId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-3"
                              style={{ backgroundColor: chartColors.primary }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {campus.campusName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {campus.campusCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {campus.metrics.totalEvents}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {campus.metrics.totalUsers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {campus.metrics.totalAttendance}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campus.metrics.attendanceRate >= 80 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : campus.metrics.attendanceRate >= 60
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {campus.metrics.attendanceRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Campus-Specific View */}
      {viewMode === 'campus' && analyticsData && (
        <div className="space-y-6">
          {/* Campus-Specific Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Events"
              value={metrics.totalEvents}
              subtitle={`${metrics.activeEvents} active`}
              icon={<Calendar />}
              iconBg="bg-blue-100 dark:bg-blue-900"
              iconColor="text-blue-600 dark:text-blue-400"
            />
            <StatsCard
              title="Campus Users"
              value={metrics.totalUsers}
              subtitle="Registered users"
              icon={<Users />}
              iconBg="bg-green-100 dark:bg-green-900"
              iconColor="text-green-600 dark:text-green-400"
            />
            <StatsCard
              title="Total Attendance"
              value={metrics.totalAttendance}
              subtitle={`${metrics.averageAttendancePerEvent} avg/event`}
              icon={<Activity />}
              iconBg="bg-purple-100 dark:bg-purple-900"
              iconColor="text-purple-600 dark:text-purple-400"
            />
            <StatsCard
              title="Attendance Rate"
              value={`${metrics.attendanceRate}%`}
              subtitle="Overall rate"
              icon={<TrendingUp />}
              iconBg="bg-orange-100 dark:bg-orange-900"
              iconColor="text-orange-600 dark:text-orange-400"
            />
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Over Time */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Attendance Trends (30 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.charts.attendanceOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayDate" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="attendance" 
                      stroke={chartColors.primary} 
                      fill={chartColors.primary}
                      fillOpacity={0.3}
                      name="Attendance"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Events by Category */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Events by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      label={({ category, percentage }) => `${category} (${percentage}%)`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Trends (6 Months)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.charts.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="events" 
                      stroke={chartColors.primary} 
                      strokeWidth={2}
                      name="Events"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="attendance" 
                      stroke={chartColors.secondary} 
                      strokeWidth={2}
                      name="Attendance"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* User Activity */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.charts.userActivityMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={chartColors.accent} name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {analyticsData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'event_created' 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                        : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                    }`}>
                      {activity.type === 'event_created' ? <Calendar className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CampusDashboard;
