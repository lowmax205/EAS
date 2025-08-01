/**
 * System Administration Dashboard
 * Story 1.7: Multi-Campus System Administration - Task 1 & 3
 * 
 * Super admin interface for comprehensive system management with:
 * - Campus CRUD operations with configuration management
 * - System-wide monitoring dashboard with campus health indicators
 * - Real-time campus status monitoring and alert system
 * - Campus performance benchmarking and optimization recommendations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Settings, 
  BarChart3, 
  Users, 
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Wifi,
  Shield,
  Globe,
  Refresh
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useCampus } from '../../../contexts/CampusContext';
import { devError, devLog } from '../../../components/common/devLogger';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { CampusManagement } from './CampusManagement';

/**
 * System Administration Main Dashboard
 */
const SystemAdministration = () => {
  const { user } = useAuth();
  const { 
    availableCampuses, 
    userCampusPermissions,
    isLoading: campusLoading
  } = useCampus();

  // State management
  const [activeView, setActiveView] = useState('overview');
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [campusHealthData, setCampusHealthData] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Check permissions - only super admins can access
  useEffect(() => {
    if (!campusLoading && (!userCampusPermissions?.isSuperAdmin)) {
      setError('Access denied. Super admin permissions required.');
      return;
    }
  }, [userCampusPermissions, campusLoading]);

  // Load system administration data
  useEffect(() => {
    const loadSystemData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mock system-wide metrics
        const mockSystemMetrics = {
          totalCampuses: 4,
          activeCampuses: 4,
          totalUsers: 4630,
          activeUsers24h: 1250,
          totalEvents: 312,
          activeEvents: 25,
          totalAttendance: 32310,
          systemUptime: 99.8,
          avgResponseTime: 145,
          dataStorageUsed: '24.7 GB',
          dataStorageLimit: '100 GB',
          apiRequests24h: 18750,
          errorRate24h: 0.02
        };

        // Mock campus health indicators
        const mockCampusHealth = [
          {
            campusId: 1,
            campusName: 'SNSU',
            displayName: 'Surigao del Norte State University',
            status: 'healthy',
            uptime: 99.9,
            responseTime: 125,
            activeUsers: 650,
            totalUsers: 2450,
            activeEvents: 12,
            recentActivity: 'High',
            lastEventAt: '2025-08-01T14:30:00Z',
            healthScore: 95,
            alerts: [],
            metrics: {
              userActivity: 'high',
              eventActivity: 'normal',
              systemPerformance: 'excellent',
              dataIntegrity: 'good'
            }
          },
          {
            campusId: 2,
            campusName: 'USC',
            displayName: 'University of Southern California',
            status: 'warning',
            uptime: 98.5,
            responseTime: 185,
            activeUsers: 320,
            totalUsers: 1200,
            activeEvents: 8,
            recentActivity: 'Medium',
            lastEventAt: '2025-08-01T12:15:00Z',
            healthScore: 78,
            alerts: [
              { level: 'warning', message: 'Response time above threshold', time: '10m ago' }
            ],
            metrics: {
              userActivity: 'medium',
              eventActivity: 'low',
              systemPerformance: 'good',
              dataIntegrity: 'excellent'
            }
          },
          {
            campusId: 3,
            campusName: 'Stanford',
            displayName: 'Stanford University',
            status: 'healthy',
            uptime: 99.7,
            responseTime: 135,
            activeUsers: 210,
            totalUsers: 980,
            activeEvents: 5,
            recentActivity: 'Low',
            lastEventAt: '2025-07-31T16:45:00Z',
            healthScore: 88,
            alerts: [],
            metrics: {
              userActivity: 'low',
              eventActivity: 'low',
              systemPerformance: 'good',
              dataIntegrity: 'excellent'
            }
          },
          {
            campusId: 4,
            campusName: 'MIT',
            displayName: 'Massachusetts Institute of Technology',
            status: 'healthy',
            uptime: 99.9,
            responseTime: 98,
            activeUsers: 70,
            totalUsers: 450,
            activeEvents: 2,
            recentActivity: 'Low',
            lastEventAt: '2025-07-30T09:20:00Z',
            healthScore: 92,
            alerts: [],
            metrics: {
              userActivity: 'low',
              eventActivity: 'very-low',
              systemPerformance: 'excellent',
              dataIntegrity: 'excellent'
            }
          }
        ];

        // Mock system alerts
        const mockSystemAlerts = [
          {
            id: 1,
            level: 'warning',
            title: 'USC Campus Response Time High',
            message: 'Average response time for USC campus has exceeded 180ms threshold',
            timestamp: '2025-08-01T14:25:00Z',
            campusId: 2,
            status: 'active'
          },
          {
            id: 2,
            level: 'info',
            title: 'System Backup Completed',
            message: 'Scheduled system backup completed successfully for all campuses',
            timestamp: '2025-08-01T06:00:00Z',
            campusId: null,
            status: 'resolved'
          },
          {
            id: 3,
            level: 'success',
            title: 'New Campus Onboarded',
            message: 'MIT campus successfully onboarded with 450 initial users',
            timestamp: '2025-07-30T15:30:00Z',
            campusId: 4,
            status: 'resolved'
          }
        ];

        setSystemMetrics(mockSystemMetrics);
        setCampusHealthData(mockCampusHealth);
        setSystemAlerts(mockSystemAlerts);
        setLastRefresh(new Date());

        devLog('[SystemAdministration] System data loaded successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load system data');
        devError('[SystemAdministration] Error loading system data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userCampusPermissions?.isSuperAdmin) {
      loadSystemData();
    }
  }, [userCampusPermissions?.isSuperAdmin]);

  // Refresh system data
  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLastRefresh(new Date());
      setIsLoading(false);
    }, 1000);
  };

  // Get status color for campus health
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get status icon for campus health
  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Clock;
    }
  };

  // Calculate system health score
  const systemHealthScore = useMemo(() => {
    if (!campusHealthData.length) return 0;
    return Math.round(campusHealthData.reduce((sum, campus) => sum + campus.healthScore, 0) / campusHealthData.length);
  }, [campusHealthData]);

  // Navigation tabs
  const navigationTabs = [
    { id: 'overview', label: 'System Overview', icon: BarChart3 },
    { id: 'campuses', label: 'Campus Management', icon: Building2 },
    { id: 'monitoring', label: 'Health Monitoring', icon: Activity },
    { id: 'configuration', label: 'System Config', icon: Settings }
  ];

  if (!userCampusPermissions?.isSuperAdmin && !campusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Super admin permissions required to access system administration.</p>
        </Card>
      </div>
    );
  }

  if (isLoading && !systemMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Server className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">System Administration</h1>
                <p className="text-sm text-gray-500">Multi-campus management & monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <Refresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
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
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'overview' && (
          <SystemOverview 
            systemMetrics={systemMetrics}
            campusHealthData={campusHealthData}
            systemAlerts={systemAlerts}
            systemHealthScore={systemHealthScore}
          />
        )}
        
        {activeView === 'campuses' && (
          <CampusManagement />
        )}
        
        {activeView === 'monitoring' && (
          <HealthMonitoring 
            campusHealthData={campusHealthData}
            systemAlerts={systemAlerts}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        )}
        
        {activeView === 'configuration' && (
          <SystemConfiguration />
        )}
      </div>
    </div>
  );
};

/**
 * System Overview Component
 */
const SystemOverview = ({ systemMetrics, campusHealthData, systemAlerts, systemHealthScore }) => {
  if (!systemMetrics) return null;

  return (
    <div className="space-y-6">
      {/* System Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900">{systemHealthScore}%</p>
            </div>
            <div className={`p-3 rounded-full ${systemHealthScore >= 90 ? 'bg-green-100' : systemHealthScore >= 80 ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <Activity className={`h-6 w-6 ${systemHealthScore >= 90 ? 'text-green-600' : systemHealthScore >= 80 ? 'text-yellow-600' : 'text-red-600'}`} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campuses</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.activeCampuses}/{systemMetrics.totalCampuses}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600">{systemMetrics.activeUsers24h} active today</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.systemUptime}%</p>
              <p className="text-xs text-gray-500">Avg: {systemMetrics.avgResponseTime}ms</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Server className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Campus Status Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Campus Status Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campusHealthData.map((campus) => {
            const StatusIcon = campus.status === 'healthy' ? CheckCircle : AlertTriangle;
            return (
              <div key={campus.campusId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`h-5 w-5 ${campus.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{campus.displayName}</h4>
                      <p className="text-sm text-gray-500">{campus.campusName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{campus.healthScore}%</p>
                    <p className="text-xs text-gray-500">Health Score</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Users</p>
                    <p className="font-medium">{campus.activeUsers}/{campus.totalUsers}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Events</p>
                    <p className="font-medium">{campus.activeEvents}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Response</p>
                    <p className="font-medium">{campus.responseTime}ms</p>
                  </div>
                </div>

                {campus.alerts.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <p className="text-sm text-yellow-700">{campus.alerts[0].message}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent System Alerts */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent System Alerts</h3>
        <div className="space-y-4">
          {systemAlerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border">
              <div className={`p-1 rounded-full ${
                alert.level === 'warning' ? 'bg-yellow-100' : 
                alert.level === 'info' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                <AlertTriangle className={`h-4 w-4 ${
                  alert.level === 'warning' ? 'text-yellow-600' : 
                  alert.level === 'info' ? 'text-blue-600' : 'text-green-600'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{alert.title}</h4>
                <p className="text-sm text-gray-600">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                alert.status === 'active' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {alert.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

/**
 * Health Monitoring Component
 */
const HealthMonitoring = ({ campusHealthData, systemAlerts, getStatusColor, getStatusIcon }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Campus Health Monitoring</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          <span>Real-time monitoring</span>
        </div>
      </div>

      {/* Detailed Campus Health */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {campusHealthData.map((campus) => {
          const StatusIcon = getStatusIcon(campus.status);
          return (
            <Card key={campus.campusId} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <StatusIcon className={`h-6 w-6 ${getStatusColor(campus.status).split(' ')[0]}`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{campus.displayName}</h3>
                    <p className="text-sm text-gray-500">Campus ID: {campus.campusId}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campus.status)}`}>
                  {campus.status.charAt(0).toUpperCase() + campus.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Health Score:</span>
                    <span className="text-sm font-medium">{campus.healthScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Uptime:</span>
                    <span className="text-sm font-medium">{campus.uptime}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Response Time:</span>
                    <span className="text-sm font-medium">{campus.responseTime}ms</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Active Users:</span>
                    <span className="text-sm font-medium">{campus.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Active Events:</span>
                    <span className="text-sm font-medium">{campus.activeEvents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Activity Level:</span>
                    <span className="text-sm font-medium">{campus.recentActivity}</span>
                  </div>
                </div>
              </div>

              {/* Health Score Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Health Score</span>
                  <span className="font-medium">{campus.healthScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      campus.healthScore >= 90 ? 'bg-green-600' : 
                      campus.healthScore >= 80 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${campus.healthScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Alerts */}
              {campus.alerts.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Active Alerts</h4>
                  {campus.alerts.map((alert, index) => (
                    <div key={index} className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                      {alert.message}
                      <span className="text-xs text-yellow-600 ml-2">({alert.time})</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

/**
 * System Configuration Component
 */
const SystemConfiguration = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
      
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Global Settings</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Timezone
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>UTC</option>
                <option>Asia/Manila</option>
                <option>America/New_York</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Language
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>English</option>
                <option>Filipino</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Multi-Factor Authentication</label>
              <p className="text-xs text-gray-500">Require MFA for super admin accounts</p>
            </div>
            <input type="checkbox" checked className="rounded" readOnly />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Audit Logging</label>
              <p className="text-xs text-gray-500">Log all administrative actions</p>
            </div>
            <input type="checkbox" checked className="rounded" readOnly />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemAdministration;
