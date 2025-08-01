/**
 * Campus Reporting Interface
 * Story 1.6: Campus-Specific Reporting & Analytics - Task 5
 * 
 * Campus-aware reporting interface with export functionality and data isolation
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3,
  Users,
  Activity,
  Building2,
  ChevronDown,
  Eye,
  Loader2
} from 'lucide-react';
import { useCampus } from '../../contexts/CampusContext';
import campusReportingService from '../../services/campusReportingService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { CampusSelector } from '../ui/CampusSelector';
import { devLog, devError } from '../common/devLogger';

/**
 * Campus Reporting Component
 */
const CampusReporting = () => {
  const { 
    currentCampus, 
    userCampusPermissions, 
    availableCampuses,
    isLoading: campusLoading 
  } = useCampus();

  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCampusId, setSelectedCampusId] = useState(null);
  const [reportOptions, setReportOptions] = useState({
    reportType: 'comprehensive',
    dateRange: {
      start: '',
      end: ''
    },
    includeCharts: true,
    format: 'json'
  });

  // Set default date range (last 30 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setReportOptions(prev => ({
      ...prev,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }));
  }, []);

  // Handle option changes
  const handleOptionChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setReportOptions(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setReportOptions(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      devLog("[CampusReporting] Generating report with options:", reportOptions);

      const campusContext = {
        currentCampus,
        userCampusPermissions,
        availableCampuses
      };

      const options = {
        ...reportOptions,
        selectedCampusId: selectedCampusId || currentCampus.id
      };

      let report;
      if (userCampusPermissions.isSuperAdmin && reportOptions.reportType === 'system_overview') {
        report = await campusReportingService.generateSystemReport(campusContext, options);
      } else {
        report = await campusReportingService.generateCampusReport(campusContext, options);
      }

      setReportData(report);
      devLog("[CampusReporting] Report generated successfully");
    } catch (error) {
      devError("[CampusReporting] Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle export
  const handleExport = async (format) => {
    if (!reportData) return;

    try {
      devLog("[CampusReporting] Exporting report in format:", format);
      
      const exportOptions = {
        ...reportOptions,
        format,
        selectedCampusId: selectedCampusId || currentCampus.id
      };

      const campusContext = {
        currentCampus,
        userCampusPermissions,
        availableCampuses
      };

      let exportReport;
      if (userCampusPermissions.isSuperAdmin && reportOptions.reportType === 'system_overview') {
        exportReport = await campusReportingService.generateSystemReport(campusContext, exportOptions);
      } else {
        exportReport = await campusReportingService.generateCampusReport(campusContext, exportOptions);
      }

      // Create download
      const filename = `${reportData.metadata.campusName || 'System'}_Report_${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportReport, null, 2)], { type: 'application/json' });
        downloadBlob(blob, filename);
      } else if (format === 'csv') {
        // Simple CSV export for events
        let csvContent = '';
        if (exportReport.data?.details?.events) {
          csvContent = 'Event ID,Title,Date,Category,Attendees,Max Attendees\n';
          csvContent += exportReport.data.details.events.map(event => 
            `${event.id},"${event.title}",${event.date},${event.category},${event.attendees},${event.maxAttendees}`
          ).join('\n');
        } else {
          csvContent = 'No event data available for CSV export';
        }
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        downloadBlob(blob, filename);
      }

      devLog("[CampusReporting] Report exported successfully");
    } catch (error) {
      devError("[CampusReporting] Error exporting report:", error);
    }
  };

  // Download blob helper
  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (campusLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-48 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Campus Reporting
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Generate comprehensive reports with campus-specific data isolation
        </p>
      </div>

      {/* Report Configuration */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Report Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Report Type
              </label>
              <select
                value={reportOptions.reportType}
                onChange={(e) => handleOptionChange('reportType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="comprehensive">Comprehensive Report</option>
                <option value="events">Events Report</option>
                <option value="attendance">Attendance Report</option>
                <option value="users">Users Report</option>
                {userCampusPermissions.isSuperAdmin && (
                  <option value="system_overview">System Overview</option>
                )}
              </select>
            </div>

            {/* Campus Selection for Super Admin */}
            {userCampusPermissions.isSuperAdmin && reportOptions.reportType !== 'system_overview' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Campus
                </label>
                <CampusSelector
                  value={selectedCampusId || currentCampus.id}
                  onValueChange={setSelectedCampusId}
                  placeholder="Select Campus"
                />
              </div>
            )}

            {/* Date Range Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={reportOptions.dateRange.start}
                onChange={(e) => handleOptionChange('dateRange.start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={reportOptions.dateRange.end}
                onChange={(e) => handleOptionChange('dateRange.end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Additional Options */}
          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={reportOptions.includeCharts}
                onChange={(e) => handleOptionChange('includeCharts', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include charts and visualizations</span>
            </label>
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Display */}
      {reportData && (
        <div className="space-y-6">
          {/* Report Header */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {reportData.metadata.campusName || 'System'} Report
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generated on {new Date(reportData.metadata.generatedAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('json')}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('csv')}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </Button>
                </div>
              </div>

              {/* Report Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {reportData.metadata.dataPoints?.events || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Events</p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Activity className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {reportData.metadata.dataPoints?.attendance || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Attendance</p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {reportData.metadata.dataPoints?.users || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Users</p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Building2 className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {reportData.metadata.campusName || 'System'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Scope</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Report Summary */}
          {reportData.data?.summary && (
            <Card>
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-4">Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.data.summary.totalEvents || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.data.summary.totalAttendance || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Attendance</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.data.summary.totalUsers || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.data.summary.attendanceRate || 0}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* System Report Display */}
          {reportData.systemMetrics && (
            <Card>
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-4">System Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.systemMetrics.totalCampuses}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Campuses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.systemMetrics.totalEvents}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Events</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.systemMetrics.totalUsers}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.systemMetrics.totalAttendance}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.systemMetrics.averageEventsPerCampus}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Events</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.systemMetrics.systemAttendanceRate}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rate</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Campus Comparison Table for System Reports */}
          {reportData.campusReports && (
            <Card>
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-4">Campus Comparison</h4>
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
                      {reportData.campusReports.map((campus) => (
                        <tr key={campus.campusId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {campus.campusName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {campus.campusCode}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {campus.metrics.events?.total || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {campus.metrics.users?.total || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {campus.metrics.attendance?.total || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              (campus.metrics.attendance?.attendanceRate || 0) >= 80 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : (campus.metrics.attendance?.attendanceRate || 0) >= 60
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {campus.metrics.attendance?.attendanceRate || 0}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          {/* Recent Activity */}
          {reportData.data?.details?.recentActivity && (
            <Card>
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {reportData.data.details.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'event' 
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                          : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                      }`}>
                        {activity.type === 'event' ? <Calendar className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CampusReporting;
