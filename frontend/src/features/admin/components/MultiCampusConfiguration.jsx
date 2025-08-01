/**
 * Multi-Campus Configuration Management
 * Story 1.7: Multi-Campus System Administration - Task 4
 * 
 * Super admin interface for:
 * - Campus-specific configuration management interface
 * - Configuration templates and inheritance system  
 * - Campus branding and theming customization tools
 * - Configuration versioning and rollback capabilities
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Copy, 
  Download, 
  Upload,
  Palette,
  Globe,
  Shield,
  Bell,
  Database,
  Zap,
  History,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useCampus } from '../../../contexts/CampusContext';
import { devError, devLog } from '../../../components/common/devLogger';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

/**
 * Multi-Campus Configuration Management Component
 */
const MultiCampusConfiguration = () => {
  const { user } = useAuth();
  const { 
    availableCampuses, 
    userCampusPermissions,
    isLoading: campusLoading
  } = useCampus();

  // State management
  const [selectedCampusId, setSelectedCampusId] = useState(1);
  const [activeTab, setActiveTab] = useState('general');
  const [configurations, setConfigurations] = useState({});
  const [configTemplates, setConfigTemplates] = useState([]);
  const [configHistory, setConfigHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Check permissions
  useEffect(() => {
    if (!campusLoading && (!userCampusPermissions?.isSuperAdmin)) {
      setError('Access denied. Super admin permissions required.');
      return;
    }
  }, [userCampusPermissions, campusLoading]);

  // Load configuration data
  useEffect(() => {
    const loadConfigurationData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mock campus configurations
        const mockConfigurations = {
          1: { // SNSU
            general: {
              campusName: 'Surigao del Norte State University',
              campusCode: 'SNSU',
              timezone: 'Asia/Manila',
              locale: 'en-PH',
              currency: 'PHP',
              dateFormat: 'MM/DD/YYYY',
              timeFormat: '12-hour'
            },
            branding: {
              primaryColor: '#22c55e',
              secondaryColor: '#166534',
              accentColor: '#dcfce7',
              logoUrl: '/assets/logos/snsu-logo.png',
              faviconUrl: '/assets/favicons/snsu-favicon.ico',
              customCSS: '',
              brandingMessage: 'Excellence in Education'
            },
            features: {
              multiCampusMode: false,
              campusSwitching: true,
              customBranding: true,
              certificateGeneration: true,
              realtimeNotifications: true,
              qrCodeGeneration: true,
              locationVerification: true,
              reportExports: true
            },
            limits: {
              maxUsers: 5000,
              maxEvents: 500,
              maxEventsPerMonth: 50,
              storageQuota: '10GB',
              apiRateLimit: 1000,
              attendanceHistoryRetention: 365
            },
            notifications: {
              emailNotifications: true,
              smsNotifications: false,
              pushNotifications: true,
              eventReminders: true,
              attendanceConfirmations: true,
              systemAlerts: true
            },
            security: {
              mfaRequired: false,
              passwordMinLength: 8,
              passwordComplexity: true,
              sessionTimeout: 480,
              ipWhitelist: [],
              auditLogging: true,
              dataRetentionDays: 2555
            }
          },
          2: { // USC
            general: {
              campusName: 'University of Southern California',
              campusCode: 'USC',
              timezone: 'America/Los_Angeles',
              locale: 'en-US',
              currency: 'USD',
              dateFormat: 'MM/DD/YYYY',
              timeFormat: '12-hour'
            },
            branding: {
              primaryColor: '#3b82f6',
              secondaryColor: '#1e40af',
              accentColor: '#dbeafe',
              logoUrl: '/assets/logos/usc-logo.png',
              faviconUrl: '/assets/favicons/usc-favicon.ico',
              customCSS: '',
              brandingMessage: 'Fight On!'
            },
            features: {
              multiCampusMode: true,
              campusSwitching: true,
              customBranding: true,
              certificateGeneration: true,
              realtimeNotifications: false,
              qrCodeGeneration: true,
              locationVerification: true,
              reportExports: true
            },
            limits: {
              maxUsers: 3000,
              maxEvents: 300,
              maxEventsPerMonth: 30,
              storageQuota: '5GB',
              apiRateLimit: 750,
              attendanceHistoryRetention: 730
            },
            notifications: {
              emailNotifications: true,
              smsNotifications: true,
              pushNotifications: false,
              eventReminders: true,
              attendanceConfirmations: true,
              systemAlerts: true
            },
            security: {
              mfaRequired: true,
              passwordMinLength: 10,
              passwordComplexity: true,
              sessionTimeout: 240,
              ipWhitelist: ['192.168.1.0/24'],
              auditLogging: true,
              dataRetentionDays: 2190
            }
          }
        };

        // Mock configuration templates
        const mockTemplates = [
          {
            id: 1,
            name: 'University Standard',
            description: 'Standard configuration for university campuses',
            category: 'Education',
            isDefault: true,
            createdAt: '2025-01-01T00:00:00Z',
            usageCount: 15,
            config: {
              features: {
                multiCampusMode: true,
                campusSwitching: true,
                customBranding: true,
                certificateGeneration: true,
                realtimeNotifications: true
              },
              limits: {
                maxUsers: 5000,
                maxEvents: 500,
                storageQuota: '10GB'
              },
              security: {
                mfaRequired: false,
                passwordMinLength: 8,
                sessionTimeout: 480
              }
            }
          },
          {
            id: 2,
            name: 'High Security Campus',
            description: 'Enhanced security configuration for sensitive campuses',
            category: 'Security',
            isDefault: false,
            createdAt: '2025-02-15T00:00:00Z',
            usageCount: 3,
            config: {
              security: {
                mfaRequired: true,
                passwordMinLength: 12,
                passwordComplexity: true,
                sessionTimeout: 120,
                auditLogging: true,
                dataRetentionDays: 2555
              },
              features: {
                certificateGeneration: true,
                locationVerification: true
              }
            }
          },
          {
            id: 3,
            name: 'Small Campus Starter',
            description: 'Basic configuration for small campus deployments',
            category: 'Basic',
            isDefault: false,
            createdAt: '2025-03-01T00:00:00Z',
            usageCount: 8,
            config: {
              limits: {
                maxUsers: 1000,
                maxEvents: 100,
                storageQuota: '2GB'
              },
              features: {
                multiCampusMode: false,
                realtimeNotifications: false
              }
            }
          }
        ];

        // Mock configuration history
        const mockHistory = [
          {
            id: 1,
            campusId: 1,
            configSection: 'branding',
            action: 'update',
            changes: {
              primaryColor: { from: '#10b981', to: '#22c55e' }
            },
            changedBy: 'Super Admin',
            timestamp: '2025-08-01T10:30:00Z',
            description: 'Updated primary brand color'
          },
          {
            id: 2,
            campusId: 2,
            configSection: 'security',
            action: 'update',
            changes: {
              mfaRequired: { from: false, to: true }
            },
            changedBy: 'Super Admin',
            timestamp: '2025-07-30T14:15:00Z',
            description: 'Enabled multi-factor authentication'
          }
        ];

        setConfigurations(mockConfigurations);
        setConfigTemplates(mockTemplates);
        setConfigHistory(mockHistory);

        devLog('[MultiCampusConfiguration] Configuration data loaded successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration data');
        devError('[MultiCampusConfiguration] Error loading configuration data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userCampusPermissions?.isSuperAdmin) {
      loadConfigurationData();
    }
  }, [userCampusPermissions?.isSuperAdmin]);

  // Get current campus configuration
  const currentConfig = useMemo(() => {
    return configurations[selectedCampusId] || {};
  }, [configurations, selectedCampusId]);

  // Configuration tabs
  const configTabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'limits', label: 'Limits', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  // Handle configuration change
  const handleConfigChange = (section, field, value) => {
    setConfigurations(prev => ({
      ...prev,
      [selectedCampusId]: {
        ...prev[selectedCampusId],
        [section]: {
          ...prev[selectedCampusId][section],
          [field]: value
        }
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Save configuration
  const handleSaveConfiguration = async () => {
    try {
      // Mock save operation
      const newHistoryEntry = {
        id: configHistory.length + 1,
        campusId: selectedCampusId,
        configSection: activeTab,
        action: 'update',
        changes: {},
        changedBy: user.name,
        timestamp: new Date().toISOString(),
        description: `Updated ${activeTab} configuration`
      };

      setConfigHistory(prev => [newHistoryEntry, ...prev]);
      setHasUnsavedChanges(false);
      
      alert('Configuration saved successfully');
    } catch (error) {
      devError('[MultiCampusConfiguration] Save error:', error);
      alert('Failed to save configuration');
    }
  };

  // Apply template
  const handleApplyTemplate = (template) => {
    const updatedConfig = { ...currentConfig };
    
    Object.keys(template.config).forEach(section => {
      if (updatedConfig[section]) {
        updatedConfig[section] = { ...updatedConfig[section], ...template.config[section] };
      } else {
        updatedConfig[section] = template.config[section];
      }
    });

    setConfigurations(prev => ({
      ...prev,
      [selectedCampusId]: updatedConfig
    }));
    setHasUnsavedChanges(true);
    setShowTemplateModal(false);
    setSelectedTemplate(null);
  };

  if (!userCampusPermissions?.isSuperAdmin && !campusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Super admin permissions required for configuration management.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Multi-Campus Configuration</h2>
          <p className="text-gray-600">Manage campus-specific settings and configurations</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => setShowTemplateModal(true)}>
            <Copy className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowHistoryModal(true)}>
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button 
            onClick={handleSaveConfiguration}
            disabled={!hasUnsavedChanges}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Campus Selector */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Select Campus</h3>
            <p className="text-sm text-gray-500">Choose a campus to configure</p>
          </div>
          <select
            value={selectedCampusId}
            onChange={(e) => setSelectedCampusId(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {availableCampuses.map(campus => (
              <option key={campus.id} value={campus.id}>{campus.displayName}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Configuration Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {configTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
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
          {activeTab === 'general' && (
            <GeneralConfiguration 
              config={currentConfig.general || {}}
              onChange={(field, value) => handleConfigChange('general', field, value)}
            />
          )}
          
          {activeTab === 'branding' && (
            <BrandingConfiguration 
              config={currentConfig.branding || {}}
              onChange={(field, value) => handleConfigChange('branding', field, value)}
            />
          )}
          
          {activeTab === 'features' && (
            <FeaturesConfiguration 
              config={currentConfig.features || {}}
              onChange={(field, value) => handleConfigChange('features', field, value)}
            />
          )}
          
          {activeTab === 'limits' && (
            <LimitsConfiguration 
              config={currentConfig.limits || {}}
              onChange={(field, value) => handleConfigChange('limits', field, value)}
            />
          )}
          
          {activeTab === 'notifications' && (
            <NotificationsConfiguration 
              config={currentConfig.notifications || {}}
              onChange={(field, value) => handleConfigChange('notifications', field, value)}
            />
          )}
          
          {activeTab === 'security' && (
            <SecurityConfiguration 
              config={currentConfig.security || {}}
              onChange={(field, value) => handleConfigChange('security', field, value)}
            />
          )}
        </div>
      </Card>

      {/* Templates Modal */}
      {showTemplateModal && (
        <ConfigTemplatesModal 
          templates={configTemplates}
          onApply={handleApplyTemplate}
          onClose={() => setShowTemplateModal(false)}
        />
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <ConfigHistoryModal 
          history={configHistory.filter(h => h.campusId === selectedCampusId)}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
};

/**
 * General Configuration Component
 */
const GeneralConfiguration = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campus Name
          </label>
          <input
            type="text"
            value={config.campusName || ''}
            onChange={(e) => onChange('campusName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campus Code
          </label>
          <input
            type="text"
            value={config.campusCode || ''}
            onChange={(e) => onChange('campusCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={config.timezone || ''}
            onChange={(e) => onChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="UTC">UTC</option>
            <option value="Asia/Manila">Asia/Manila</option>
            <option value="America/New_York">America/New_York</option>
            <option value="America/Los_Angeles">America/Los_Angeles</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Locale
          </label>
          <select
            value={config.locale || ''}
            onChange={(e) => onChange('locale', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="en-US">English (US)</option>
            <option value="en-PH">English (Philippines)</option>
            <option value="en-GB">English (UK)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

/**
 * Branding Configuration Component
 */
const BrandingConfiguration = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Branding & Theme</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={config.primaryColor || '#3b82f6'}
              onChange={(e) => onChange('primaryColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={config.primaryColor || ''}
              onChange={(e) => onChange('primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="#3b82f6"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={config.secondaryColor || '#1e40af'}
              onChange={(e) => onChange('secondaryColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={config.secondaryColor || ''}
              onChange={(e) => onChange('secondaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="#1e40af"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accent Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={config.accentColor || '#dbeafe'}
              onChange={(e) => onChange('accentColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={config.accentColor || ''}
              onChange={(e) => onChange('accentColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              placeholder="#dbeafe"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Branding Message
        </label>
        <input
          type="text"
          value={config.brandingMessage || ''}
          onChange={(e) => onChange('brandingMessage', e.target.value)}
          placeholder="Enter campus motto or tagline..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

/**
 * Features Configuration Component
 */
const FeaturesConfiguration = ({ config, onChange }) => {
  const features = [
    { key: 'multiCampusMode', label: 'Multi-Campus Mode', description: 'Enable multi-campus functionality' },
    { key: 'campusSwitching', label: 'Campus Switching', description: 'Allow users to switch between campuses' },
    { key: 'customBranding', label: 'Custom Branding', description: 'Enable custom campus branding' },
    { key: 'certificateGeneration', label: 'Certificate Generation', description: 'Generate attendance certificates' },
    { key: 'realtimeNotifications', label: 'Real-time Notifications', description: 'Enable live notifications' },
    { key: 'qrCodeGeneration', label: 'QR Code Generation', description: 'Generate QR codes for events' },
    { key: 'locationVerification', label: 'Location Verification', description: 'Verify user location for attendance' },
    { key: 'reportExports', label: 'Report Exports', description: 'Export reports in various formats' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Feature Settings</h3>
      
      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{feature.label}</h4>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
            <input
              type="checkbox"
              checked={config[feature.key] || false}
              onChange={(e) => onChange(feature.key, e.target.checked)}
              className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Limits Configuration Component
 */
const LimitsConfiguration = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Usage Limits</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Users
          </label>
          <input
            type="number"
            value={config.maxUsers || ''}
            onChange={(e) => onChange('maxUsers', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Events
          </label>
          <input
            type="number"
            value={config.maxEvents || ''}
            onChange={(e) => onChange('maxEvents', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Storage Quota
          </label>
          <input
            type="text"
            value={config.storageQuota || ''}
            onChange={(e) => onChange('storageQuota', e.target.value)}
            placeholder="e.g., 10GB"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Rate Limit (requests/hour)
          </label>
          <input
            type="number"
            value={config.apiRateLimit || ''}
            onChange={(e) => onChange('apiRateLimit', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Notifications Configuration Component
 */
const NotificationsConfiguration = ({ config, onChange }) => {
  const notifications = [
    { key: 'emailNotifications', label: 'Email Notifications', description: 'Send notifications via email' },
    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Send notifications via SMS' },
    { key: 'pushNotifications', label: 'Push Notifications', description: 'Send browser push notifications' },
    { key: 'eventReminders', label: 'Event Reminders', description: 'Send reminders for upcoming events' },
    { key: 'attendanceConfirmations', label: 'Attendance Confirmations', description: 'Confirm attendance submissions' },
    { key: 'systemAlerts', label: 'System Alerts', description: 'Send system status alerts' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
      
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.key} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{notification.label}</h4>
              <p className="text-sm text-gray-500">{notification.description}</p>
            </div>
            <input
              type="checkbox"
              checked={config[notification.key] || false}
              onChange={(e) => onChange(notification.key, e.target.checked)}
              className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Security Configuration Component
 */
const SecurityConfiguration = ({ config, onChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Multi-Factor Authentication</h4>
            <p className="text-sm text-gray-500">Require MFA for user login</p>
          </div>
          <input
            type="checkbox"
            checked={config.mfaRequired || false}
            onChange={(e) => onChange('mfaRequired', e.target.checked)}
            className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Password Length
            </label>
            <input
              type="number"
              min="6"
              max="32"
              value={config.passwordMinLength || 8}
              onChange={(e) => onChange('passwordMinLength', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              min="30"
              max="1440"
              value={config.sessionTimeout || 480}
              onChange={(e) => onChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Retention Period (days)
          </label>
          <input
            type="number"
            min="90"
            max="3650"
            value={config.dataRetentionDays || 2555}
            onChange={(e) => onChange('dataRetentionDays', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Configuration Templates Modal
 */
const ConfigTemplatesModal = ({ templates, onApply, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Configuration Templates</h3>
          <p className="text-sm text-gray-500">Apply pre-configured settings to your campus</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  {template.isDefault && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Used {template.usageCount} times
                  </span>
                  <Button
                    size="sm"
                    onClick={() => onApply(template)}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Configuration History Modal
 */
const ConfigHistoryModal = ({ history, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Configuration History</h3>
          <p className="text-sm text-gray-500">Recent configuration changes</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{entry.description}</h4>
                  <p className="text-sm text-gray-600">
                    Section: {entry.configSection} • Action: {entry.action}
                  </p>
                  <p className="text-xs text-gray-500">
                    By {entry.changedBy} • {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MultiCampusConfiguration;
