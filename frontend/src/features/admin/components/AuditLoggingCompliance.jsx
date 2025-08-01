/**
 * Audit Logging and Compliance Reporting System
 * Story 1.7: Multi-Campus System Administration - Task 5
 * 
 * Super admin interface for:
 * - Comprehensive audit logging for all campus operations
 * - Compliance reporting dashboard with exportable reports
 * - Campus activity monitoring and suspicious behavior detection
 * - Data retention and privacy compliance tools
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building2,
  Activity,
  FileText,
  Calendar,
  BarChart3,
  TrendingUp,
  Database,
  Globe,
  Lock,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useCampus } from '../../../contexts/CampusContext';
import { devError, devLog } from '../../../components/common/devLogger';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

/**
 * Audit Logging and Compliance Component
 */
const AuditLoggingCompliance = () => {
  const { user } = useAuth();
  const { 
    availableCampuses, 
    userCampusPermissions,
    isLoading: campusLoading
  } = useCampus();

  // State management
  const [activeView, setActiveView] = useState('logs');
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [complianceReports, setComplianceReports] = useState([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampusFilter, setSelectedCampusFilter] = useState('all');
  const [selectedActionFilter, setSelectedActionFilter] = useState('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check permissions
  useEffect(() => {
    if (!campusLoading && (!userCampusPermissions?.isSuperAdmin)) {
      setError('Access denied. Super admin permissions required.');
      return;
    }
  }, [userCampusPermissions, campusLoading]);

  // Load audit and compliance data
  useEffect(() => {
    const loadAuditData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mock audit logs
        const mockAuditLogs = [
          {
            id: 1,
            timestamp: '2025-08-01T14:30:00Z',
            userId: 1,
            userName: 'Super Admin',
            userRole: 'super_admin',
            campusId: 1,
            campusName: 'SNSU',
            action: 'user.campus_transfer',
            resource: 'User',
            resourceId: 15,
            details: {
              targetUser: 'Maria Santos',
              fromCampus: 'SNSU',
              toCampus: 'USC',
              reason: 'Administrative transfer'
            },
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            outcome: 'success',
            riskLevel: 'medium',
            sessionId: 'sess_abc123'
          },
          {
            id: 2,
            timestamp: '2025-08-01T14:15:00Z',
            userId: 2,
            userName: 'Campus Admin USC',
            userRole: 'campus_admin',
            campusId: 2,
            campusName: 'USC',
            action: 'event.create',
            resource: 'Event',
            resourceId: 234,
            details: {
              eventName: 'USC Tech Conference 2025',
              eventDate: '2025-08-15',
              location: 'USC Main Auditorium'
            },
            ipAddress: '10.0.0.55',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            outcome: 'success',
            riskLevel: 'low',
            sessionId: 'sess_def456'
          },
          {
            id: 3,
            timestamp: '2025-08-01T13:45:00Z',
            userId: 5,
            userName: 'Unknown User',
            userRole: 'student',
            campusId: null,
            campusName: 'Unknown',
            action: 'auth.failed_login',
            resource: 'Authentication',
            resourceId: null,
            details: {
              attemptedEmail: 'admin@snsu.edu.ph',
              failureReason: 'Invalid credentials',
              attemptCount: 5
            },
            ipAddress: '203.123.45.67',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            outcome: 'failure',
            riskLevel: 'high',
            sessionId: null
          },
          {
            id: 4,
            timestamp: '2025-08-01T12:30:00Z',
            userId: 3,
            userName: 'Campus Admin Stanford',
            userRole: 'campus_admin',
            campusId: 3,
            campusName: 'Stanford',
            action: 'config.security_update',
            resource: 'Configuration',
            resourceId: 3,
            details: {
              setting: 'mfaRequired',
              oldValue: false,
              newValue: true
            },
            ipAddress: '172.16.0.25',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            outcome: 'success',
            riskLevel: 'medium',
            sessionId: 'sess_ghi789'
          },
          {
            id: 5,
            timestamp: '2025-08-01T11:00:00Z',
            userId: 1,
            userName: 'Super Admin',
            userRole: 'super_admin',
            campusId: null,
            campusName: 'System',
            action: 'system.backup_initiated',
            resource: 'System',
            resourceId: null,
            details: {
              backupType: 'full',
              targetLocation: 'cloud-storage-primary',
              estimatedSize: '15.2 GB'
            },
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            outcome: 'success',
            riskLevel: 'low',
            sessionId: 'sess_jkl012'
          }
        ];

        // Mock compliance reports
        const mockComplianceReports = [
          {
            id: 1,
            reportType: 'Data Access Audit',
            period: 'July 2025',
            generatedAt: '2025-08-01T09:00:00Z',
            status: 'completed',
            findings: {
              totalAccesses: 15420,
              unauthorizedAttempts: 3,
              dataExports: 45,
              complianceScore: 98.5
            },
            downloadUrl: '/reports/data-access-audit-july-2025.pdf'
          },
          {
            id: 2,
            reportType: 'User Activity Summary',
            period: 'Q2 2025',
            generatedAt: '2025-07-31T18:00:00Z',
            status: 'completed',
            findings: {
              activeUsers: 4630,
              suspiciousActivities: 12,
              policyViolations: 2,
              complianceScore: 96.8
            },
            downloadUrl: '/reports/user-activity-q2-2025.pdf'
          },
          {
            id: 3,
            reportType: 'Security Compliance Assessment',
            period: 'June 2025',
            generatedAt: '2025-07-01T12:00:00Z',
            status: 'completed',
            findings: {
              securityTests: 156,
              vulnerabilities: 3,
              patchLevel: 99.2,
              complianceScore: 94.1
            },
            downloadUrl: '/reports/security-compliance-june-2025.pdf'
          }
        ];

        // Mock suspicious activities
        const mockSuspiciousActivities = [
          {
            id: 1,
            timestamp: '2025-08-01T13:45:00Z',
            type: 'Multiple Failed Logins',
            description: 'User attempted login 5 times with wrong credentials',
            severity: 'high',
            userId: null,
            ipAddress: '203.123.45.67',
            campusId: null,
            status: 'active',
            actions: ['IP blocked', 'Admin notified']
          },
          {
            id: 2,
            timestamp: '2025-08-01T10:20:00Z',
            type: 'Unusual Data Access Pattern',
            description: 'User accessed 50+ student records in short timeframe',
            severity: 'medium',
            userId: 8,
            ipAddress: '10.0.0.75',
            campusId: 2,
            status: 'investigating',
            actions: ['User flagged', 'Activity logged']
          },
          {
            id: 3,
            timestamp: '2025-07-31T22:15:00Z',
            type: 'After-Hours Admin Access',
            description: 'Campus admin accessed system outside normal hours',
            severity: 'low',
            userId: 4,
            ipAddress: '172.16.0.30',
            campusId: 3,
            status: 'resolved',
            actions: ['Verified legitimate access']
          }
        ];

        setAuditLogs(mockAuditLogs);
        setFilteredLogs(mockAuditLogs);
        setComplianceReports(mockComplianceReports);
        setSuspiciousActivities(mockSuspiciousActivities);

        devLog('[AuditLoggingCompliance] Audit data loaded successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit data');
        devError('[AuditLoggingCompliance] Error loading audit data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userCampusPermissions?.isSuperAdmin) {
      loadAuditData();
    }
  }, [userCampusPermissions?.isSuperAdmin]);

  // Filter audit logs
  useEffect(() => {
    let filtered = auditLogs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.includes(searchQuery)
      );
    }

    // Campus filter
    if (selectedCampusFilter !== 'all') {
      filtered = filtered.filter(log => log.campusId === parseInt(selectedCampusFilter));
    }

    // Action filter
    if (selectedActionFilter !== 'all') {
      filtered = filtered.filter(log => log.action.includes(selectedActionFilter));
    }

    // Risk filter
    if (selectedRiskFilter !== 'all') {
      filtered = filtered.filter(log => log.riskLevel === selectedRiskFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
      filtered = filtered.filter(log => new Date(log.timestamp) >= cutoffDate);
    }

    setFilteredLogs(filtered);
  }, [auditLogs, searchQuery, selectedCampusFilter, selectedActionFilter, selectedRiskFilter, dateRange]);

  // Get risk level badge color
  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get outcome badge color
  const getOutcomeBadgeColor = (outcome) => {
    switch (outcome) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failure': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Navigation tabs
  const navigationTabs = [
    { id: 'logs', label: 'Audit Logs', icon: FileText },
    { id: 'compliance', label: 'Compliance Reports', icon: BarChart3 },
    { id: 'suspicious', label: 'Suspicious Activity', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  if (!userCampusPermissions?.isSuperAdmin && !campusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Super admin permissions required for audit and compliance access.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit and compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit & Compliance</h2>
          <p className="text-gray-600">Monitor system activity and ensure compliance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeView === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeView === 'logs' && (
            <AuditLogsView 
              logs={filteredLogs}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCampusFilter={selectedCampusFilter}
              setSelectedCampusFilter={setSelectedCampusFilter}
              selectedActionFilter={selectedActionFilter}
              setSelectedActionFilter={setSelectedActionFilter}
              selectedRiskFilter={selectedRiskFilter}
              setSelectedRiskFilter={setSelectedRiskFilter}
              dateRange={dateRange}
              setDateRange={setDateRange}
              availableCampuses={availableCampuses}
              getRiskBadgeColor={getRiskBadgeColor}
              getOutcomeBadgeColor={getOutcomeBadgeColor}
            />
          )}
          
          {activeView === 'compliance' && (
            <ComplianceReportsView 
              reports={complianceReports}
            />
          )}
          
          {activeView === 'suspicious' && (
            <SuspiciousActivityView 
              activities={suspiciousActivities}
            />
          )}
          
          {activeView === 'analytics' && (
            <AuditAnalyticsView 
              logs={auditLogs}
              activities={suspiciousActivities}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

/**
 * Audit Logs View Component
 */
const AuditLogsView = ({ 
  logs, 
  searchQuery, 
  setSearchQuery,
  selectedCampusFilter,
  setSelectedCampusFilter,
  selectedActionFilter,
  setSelectedActionFilter,
  selectedRiskFilter,
  setSelectedRiskFilter,
  dateRange,
  setDateRange,
  availableCampuses,
  getRiskBadgeColor,
  getOutcomeBadgeColor
}) => {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <select
          value={selectedCampusFilter}
          onChange={(e) => setSelectedCampusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Campuses</option>
          {availableCampuses.map(campus => (
            <option key={campus.id} value={campus.id}>{campus.displayName}</option>
          ))}
        </select>

        <select
          value={selectedActionFilter}
          onChange={(e) => setSelectedActionFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Actions</option>
          <option value="auth">Authentication</option>
          <option value="user">User Management</option>
          <option value="event">Event Management</option>
          <option value="config">Configuration</option>
          <option value="system">System</option>
        </select>

        <select
          value={selectedRiskFilter}
          onChange={(e) => setSelectedRiskFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Risk Levels</option>
          <option value="low">Low Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="high">High Risk</option>
          <option value="critical">Critical Risk</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="1">Last 24 hours</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="all">All time</option>
        </select>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Audit Logs Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campus
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Outcome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                      <div className="text-sm text-gray-500">{log.userRole}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{log.action}</div>
                  <div className="text-sm text-gray-500">{log.resource}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{log.campusName || 'System'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeColor(log.riskLevel)}`}>
                    {log.riskLevel.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOutcomeBadgeColor(log.outcome)}`}>
                    {log.outcome.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Compliance Reports View Component
 */
const ComplianceReportsView = ({ reports }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Compliance Reports</h3>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">{report.reportType}</h4>
              <span className="text-xs text-gray-500">{report.period}</span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Compliance Score:</span>
                <span className="font-medium text-green-600">{report.findings.complianceScore}%</span>
              </div>
              
              {report.findings.unauthorizedAttempts !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Unauthorized Attempts:</span>
                  <span className="font-medium">{report.findings.unauthorizedAttempts}</span>
                </div>
              )}
              
              {report.findings.suspiciousActivities !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Suspicious Activities:</span>
                  <span className="font-medium">{report.findings.suspiciousActivities}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Generated: {new Date(report.generatedAt).toLocaleDateString()}
              </span>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/**
 * Suspicious Activity View Component
 */
const SuspiciousActivityView = ({ activities }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Suspicious Activities</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          <span>Real-time monitoring</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <AlertTriangle className={`h-5 w-5 ${
                    activity.severity === 'high' ? 'text-red-500' : 
                    activity.severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'
                  }`} />
                  <h4 className="font-medium text-gray-900">{activity.type}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(activity.severity)}`}>
                    {activity.severity.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{new Date(activity.timestamp).toLocaleString()}</span>
                  {activity.ipAddress && <span>IP: {activity.ipAddress}</span>}
                  {activity.userId && <span>User ID: {activity.userId}</span>}
                </div>
                
                {activity.actions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Actions Taken:</p>
                    <div className="flex flex-wrap gap-1">
                      {activity.actions.map((action, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ml-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status.toUpperCase()}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/**
 * Audit Analytics View Component
 */
const AuditAnalyticsView = ({ logs, activities }) => {
  const riskDistribution = useMemo(() => {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    logs.forEach(log => {
      distribution[log.riskLevel]++;
    });
    return distribution;
  }, [logs]);

  const actionDistribution = useMemo(() => {
    const distribution = {};
    logs.forEach(log => {
      const actionType = log.action.split('.')[0];
      distribution[actionType] = (distribution[actionType] || 0) + 1;
    });
    return distribution;
  }, [logs]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Audit Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk Events</p>
              <p className="text-2xl font-bold text-red-600">{riskDistribution.high + riskDistribution.critical}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspicious Activities</p>
              <p className="text-2xl font-bold text-orange-600">{activities.length}</p>
            </div>
            <Activity className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Operations</p>
              <p className="text-2xl font-bold text-gray-900">
                {logs.filter(log => log.outcome === 'failure').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-gray-600" />
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Risk Level Distribution</h4>
          <div className="space-y-3">
            {Object.entries(riskDistribution).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <span className="text-sm capitalize">{level}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        level === 'critical' ? 'bg-purple-600' :
                        level === 'high' ? 'bg-red-600' :
                        level === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${(count / logs.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Action Type Distribution</h4>
          <div className="space-y-3">
            {Object.entries(actionDistribution).slice(0, 5).map(([action, count]) => (
              <div key={action} className="flex items-center justify-between">
                <span className="text-sm capitalize">{action}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${(count / logs.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuditLoggingCompliance;
