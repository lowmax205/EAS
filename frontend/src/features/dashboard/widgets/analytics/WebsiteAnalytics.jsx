/**
 * WebsiteAnalytics Widget - Enhanced analytics dashboard with interactive charts
 * Features: Traffic visualization, User engagement metrics, Role-based visibility, Interactive charts
 * Dependencies: Card component, Recharts library, Analytics data
 * Theme Support: Complete light/dark theme with smooth transitions
 * Accessibility: Screen reader compatibility, color contrast compliance
 * Chart types: Daily visitors, Browser usage, Top pages performance
 * 
 * Uses mockAnalytics.json data structure with:
 * - dailyVisitors: Array of {date, visitors} for last 30 days
 * - browserUsage: Object with browser percentage distribution
 * - topPages: Array of {page, views} for popular pages
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import { APP_ROUTES } from "../../../../components/common/constants/index";
import mockAnalytics from "../../../../data/mockAnalytics.json";

/**
 * WebsiteAnalytics - Enhanced analytics dashboard with charts
 * Features: Traffic visualization, User engagement metrics, Interactive charts
 * @param {Object} props - Component props
 * @param {string} props.userRole - User role (student, organizer, admin)
 * @returns {JSX.Element|null} - Analytics component or null if not admin/organizer
 */
const WebsiteAnalytics = ({ userRole }) => {
  const [activeChart, setActiveChart] = useState("daily");
  const navigate = useNavigate();

  // Only show analytics to admin and organizer roles
  if (userRole !== "admin" && userRole !== "organizer") {
    return null;
  }

  const analyticsData = mockAnalytics.websiteAnalytics;

  // Handler for View Details button - navigate to reports page
  const handleViewDetails = () => {
    navigate(APP_ROUTES.REPORTS);
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

  // Prepare daily visitors data for chart (use dailyVisitors from mockAnalytics)
  const dailyData = analyticsData.dailyVisitors?.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    visitors: item.visitors,
  })) || [];

  // Prepare browser usage data for pie chart (use browserUsage from mockAnalytics)  
  const browserData = analyticsData.browserUsage ? Object.entries(analyticsData.browserUsage).map(
    ([browser, percentage]) => ({
      name: browser.charAt(0).toUpperCase() + browser.slice(1),
      value: percentage,
      count: Math.round((analyticsData.totalPageViews * percentage) / 100),
    })
  ) : [];

  // Prepare top pages data for bar chart
  const topPagesData = analyticsData.topPages?.map((page) => ({
    page:
      page.page === "/"
        ? "Home"
        : page.page.replace("/", "").charAt(0).toUpperCase() +
          page.page.replace("/", "").slice(1),
    views: page.views,
  })) || [];

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

  // Render chart based on active selection
  const renderChart = () => {
    switch (activeChart) {
      case "daily":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
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
        );

      case "browsers":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={browserData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percentage }) => `${name} ${percentage}%`}
              >
                {browserData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={Object.values(chartColors)[index]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case "pages":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topPagesData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="page"
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="views"
                fill={chartColors.secondary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="row-span-2 lg:col-span-2">
      <Card title="Website Analytics" className="h-full">
        <div className="flex flex-col h-full">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Visitors Today */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-theme">Visitors</h3>
                <Eye className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="text-2xl font-bold text-theme mb-1">
                {analyticsData.visitorsToday}
              </p>
              <div className="flex items-center text-xs">
                <span className="flex items-center text-green-600 dark:text-green-400 mr-2">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {analyticsData.dailyTrends?.todayVsYesterday || "0%"}
                </span>
                <span className="text-theme opacity-60">vs yesterday</span>
              </div>
            </div>

            {/* Average Time Spent */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-theme">Avg. Time</h3>
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-theme mb-1">
                {analyticsData.averageTimeSpent}
              </p>
              <div className="flex items-center text-xs">
                <span className="flex items-center text-green-600 dark:text-green-400 mr-2">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {analyticsData.dailyTrends?.timeSpentTrend || "0%"}
                </span>
                <span className="text-theme opacity-60">vs yesterday</span>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-theme">Active</h3>
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-theme mb-1">
                {analyticsData.currentActiveUsers}
              </p>
              <div className="flex items-center text-xs">
                <span className="flex items-center text-green-600 dark:text-green-400 mr-2">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {analyticsData.dailyTrends?.activeUsersTrend || "0%"}
                </span>
                <span className="text-theme opacity-60">vs yesterday</span>
              </div>
            </div>

            {/* Page Views */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-theme">Page Views</h3>
                <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-theme mb-1">
                {analyticsData.totalPageViews}
              </p>
              <div className="flex items-center text-xs">
                <span className="flex items-center text-green-600 dark:text-green-400 mr-2">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {analyticsData.dailyTrends?.pageViewsTrend || "0%"}
                </span>
                <span className="text-theme opacity-60">vs yesterday</span>
              </div>
            </div>
          </div>

          {/* Chart Controls */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={activeChart === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("daily")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Daily Traffic
            </Button>
            <Button
              variant={activeChart === "browsers" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("browsers")}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Browser Usage
            </Button>
            <Button
              variant={activeChart === "pages" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart("pages")}
            >
              <Globe className="h-4 w-4 mr-2" />
              Top Pages
            </Button>
          </div>

          {/* Chart Area */}
          <div className="flex-1 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
            {renderChart()}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-theme opacity-70">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <div className="flex items-center space-x-4">
                <span>Bounce Rate: {analyticsData.bounceRate}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={handleViewDetails}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WebsiteAnalytics;
