import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  BarChart3, 
  Users, 
  Calendar,
  MapPin,
  Palette,
  Shield,
  Globe,
  Save,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { useCampus } from '../../contexts/CampusContext';
import { useScrollLock } from '../../components/common/useScrollLock';
import { useModal } from '../../components/forms/ModalContext';
import { devError, devLog } from '../../components/common/devLogger';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { CampusSelector } from '../../components/ui/CampusSelector';

/**
 * CampusManagement - Super admin interface for managing campuses
 * Features: Campus CRUD operations, Configuration management, Analytics dashboard
 * Permissions: Super admin only
 */
const CampusManagement = () => {
  const { user } = useAuth();
  const { 
    currentCampus, 
    availableCampuses, 
    userCampusPermissions,
    switchCampus,
    getCampusById,
    isLoading: campusLoading
  } = useCampus();

  // State management
  const [selectedCampusId, setSelectedCampusId] = useState(currentCampus?.id || 1);
  const [activeTab, setActiveTab] = useState('overview');
  const [campusList, setCampusList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState(null);

  // Enable scroll lock when modals are open
  useScrollLock(showCreateModal || showEditModal || showDeleteModal);

  // Check permissions - only super admins can access this component
  useEffect(() => {
    if (!campusLoading && (!userCampusPermissions?.isSuperAdmin)) {
      setError('Access denied. Super admin permissions required.');
      return;
    }
  }, [userCampusPermissions, campusLoading]);

  // Load campuses data
  useEffect(() => {
    const loadCampusData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // In a real implementation, this would fetch from API
        // For now, using mock data with extended campus information
        const mockCampusData = [
          {
            id: 1,
            name: 'SNSU',
            displayName: 'Surigao del Norte State University',
            slug: 'snsu',
            status: 'active',
            totalUsers: 2450,
            totalEvents: 156,
            activeEvents: 12,
            totalAttendance: 18750,
            averageAttendance: 78.5,
            theme: {
              primary: '#22c55e',
              secondary: '#166534',
              accent: '#dcfce7'
            },
            features: {
              multiCampusMode: false,
              campusSwitching: true,
              customBranding: true,
              certificateGeneration: true,
              realtimeNotifications: true
            },
            configuration: {
              timezone: 'Asia/Manila',
              locale: 'en-PH',
              maxUsers: 5000,
              maxEvents: 500,
              storageQuota: '10GB'
            },
            contact: {
              address: 'Surigao City, Surigao del Norte, Philippines',
              phone: '+63 86 826 1252',
              email: 'info@snsu.edu.ph',
              website: 'https://snsu.edu.ph'
            },
            createdAt: '2020-01-15T00:00:00Z',
            updatedAt: '2024-07-31T12:00:00Z'
          },
          {
            id: 2,
            name: 'USC',
            displayName: 'University of Southern California',
            slug: 'usc',
            status: 'active',
            totalUsers: 1200,
            totalEvents: 89,
            activeEvents: 8,
            totalAttendance: 7890,
            averageAttendance: 82.1,
            theme: {
              primary: '#3b82f6',
              secondary: '#1e40af',
              accent: '#dbeafe'
            },
            features: {
              multiCampusMode: true,
              campusSwitching: true,
              customBranding: true,
              certificateGeneration: true,
              realtimeNotifications: false
            },
            configuration: {
              timezone: 'America/Los_Angeles',
              locale: 'en-US',
              maxUsers: 3000,
              maxEvents: 300,
              storageQuota: '5GB'
            },
            contact: {
              address: 'Los Angeles, CA, United States',
              phone: '+1 (213) 740-2311',
              email: 'info@usc.edu',
              website: 'https://usc.edu'
            },
            createdAt: '2021-03-10T00:00:00Z',
            updatedAt: '2024-07-30T15:30:00Z'
          },
          {
            id: 3,
            name: 'Stanford',
            displayName: 'Stanford University',
            slug: 'stanford',
            status: 'active',
            totalUsers: 980,
            totalEvents: 67,
            activeEvents: 5,
            totalAttendance: 5670,
            averageAttendance: 75.8,
            theme: {
              primary: '#dc2626',
              secondary: '#991b1b',
              accent: '#fecaca'
            },
            features: {
              multiCampusMode: true,
              campusSwitching: true,
              customBranding: true,
              certificateGeneration: false,
              realtimeNotifications: true
            },
            configuration: {
              timezone: 'America/Los_Angeles',
              locale: 'en-US',
              maxUsers: 2500,
              maxEvents: 250,
              storageQuota: '8GB'
            },
            contact: {
              address: 'Stanford, CA, United States',
              phone: '+1 (650) 723-2300',
              email: 'info@stanford.edu',
              website: 'https://stanford.edu'
            },
            createdAt: '2021-08-20T00:00:00Z',
            updatedAt: '2024-07-29T09:15:00Z'
          }
        ];

        setCampusList(mockCampusData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load campus data');
        devError('[CampusManagement] Error loading campus data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userCampusPermissions?.isSuperAdmin) {
      loadCampusData();
    }
  }, [userCampusPermissions?.isSuperAdmin]);

  // Get selected campus data
  const selectedCampusData = useMemo(() => {
    return campusList.find(campus => campus.id === selectedCampusId) || campusList[0];
  }, [campusList, selectedCampusId]);

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'configuration', label: 'Configuration', icon: Settings },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'theme', label: 'Theme & Branding', icon: Palette }
  ];

  // Render error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // Render loading state
  if (isLoading || campusLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Campus Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage campus settings, users, and analytics across all campuses
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Campus
            </Button>
          </div>
        </div>
      </div>

      {/* Campus Selector & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select Campus
            </h3>
            <CampusSelector
              value={selectedCampusId}
              onCampusChange={setSelectedCampusId}
              showSearch={true}
              disabled={false}
            />
          </div>
        </Card>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedCampusData?.totalUsers?.toLocaleString() || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Events
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedCampusData?.activeEvents || 0}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Attendance Rate
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedCampusData?.averageAttendance?.toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <CampusOverviewTab campusData={selectedCampusData} />
        )}
        {activeTab === 'configuration' && (
          <CampusConfigurationTab 
            campusData={selectedCampusData}
            onUpdate={(updatedData) => {
              setCampusList(prev => 
                prev.map(campus => 
                  campus.id === updatedData.id ? { ...campus, ...updatedData } : campus
                )
              );
            }}
          />
        )}
        {activeTab === 'users' && (
          <CampusUsersTab campusData={selectedCampusData} />
        )}
        {activeTab === 'events' && (
          <CampusEventsTab campusData={selectedCampusData} />
        )}
        {activeTab === 'theme' && (
          <CampusThemeTab 
            campusData={selectedCampusData}
            onUpdate={(updatedData) => {
              setCampusList(prev => 
                prev.map(campus => 
                  campus.id === updatedData.id ? { ...campus, ...updatedData } : campus
                )
              );
            }}
          />
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CampusCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={(newCampus) => {
            setCampusList(prev => [...prev, { ...newCampus, id: Date.now() }]);
            setShowCreateModal(false);
          }}
        />
      )}

      {showEditModal && selectedCampus && (
        <CampusEditModal
          isOpen={showEditModal}
          campusData={selectedCampus}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCampus(null);
          }}
          onSave={(updatedCampus) => {
            setCampusList(prev => 
              prev.map(campus => 
                campus.id === updatedCampus.id ? updatedCampus : campus
              )
            );
            setShowEditModal(false);
            setSelectedCampus(null);
          }}
        />
      )}

      {showDeleteModal && selectedCampus && (
        <CampusDeleteModal
          isOpen={showDeleteModal}
          campusData={selectedCampus}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedCampus(null);
          }}
          onConfirm={() => {
            setCampusList(prev => 
              prev.filter(campus => campus.id !== selectedCampus.id)
            );
            setShowDeleteModal(false);
            setSelectedCampus(null);
          }}
        />
      )}
    </div>
  );
};

/**
 * Campus Overview Tab - Displays campus statistics and analytics
 */
const CampusOverviewTab = ({ campusData }) => {
  if (!campusData) {
    return <div>No campus data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Campus Information Card */}
      <Card>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${campusData.theme.primary}20` }}
              >
                <Building2 
                  className="w-6 h-6" 
                  style={{ color: campusData.theme.primary }}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {campusData.displayName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {campusData.slug} • {campusData.status}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campusData.totalUsers?.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campusData.totalEvents}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Events</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campusData.activeEvents}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {campusData.averageAttendance?.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                <p className="text-gray-900 dark:text-white">{campusData.contact?.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Website</p>
                <a 
                  href={campusData.contact?.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800"
                >
                  {campusData.contact?.website}
                </a>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Features Status */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Features Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(campusData.features || {}).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  enabled 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Campus Configuration Tab - Manage campus settings
 */
const CampusConfigurationTab = ({ campusData, onUpdate }) => {
  const [config, setConfig] = useState(campusData?.configuration || {});
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate({ ...campusData, configuration: config });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Campus Configuration
            </h3>
            {hasChanges && (
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={config.timezone || ''}
                onChange={(e) => handleConfigChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Asia/Manila">Asia/Manila</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Locale
              </label>
              <select
                value={config.locale || ''}
                onChange={(e) => handleConfigChange('locale', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="en-US">English (US)</option>
                <option value="en-PH">English (Philippines)</option>
                <option value="en-GB">English (UK)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Users
              </label>
              <input
                type="number"
                value={config.maxUsers || ''}
                onChange={(e) => handleConfigChange('maxUsers', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Events
              </label>
              <input
                type="number"
                value={config.maxEvents || ''}
                onChange={(e) => handleConfigChange('maxEvents', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Storage Quota
              </label>
              <input
                type="text"
                value={config.storageQuota || ''}
                onChange={(e) => handleConfigChange('storageQuota', e.target.value)}
                placeholder="e.g., 10GB"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Campus Users Tab - View campus user statistics
 */
const CampusUsersTab = ({ campusData }) => {
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Statistics
          </h3>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Campus user management interface will be implemented here.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Campus Events Tab - View campus event statistics
 */
const CampusEventsTab = ({ campusData }) => {
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Event Statistics
          </h3>
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Campus event management interface will be implemented here.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Campus Theme Tab - Manage campus branding and theming
 */
const CampusThemeTab = ({ campusData, onUpdate }) => {
  const [theme, setTheme] = useState(campusData?.theme || {});
  const [hasChanges, setHasChanges] = useState(false);

  const handleThemeChange = (key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate({ ...campusData, theme });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Campus Theme & Branding
            </h3>
            {hasChanges && (
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.primary || '#22c55e'}
                  onChange={(e) => handleThemeChange('primary', e.target.value)}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.primary || '#22c55e'}
                  onChange={(e) => handleThemeChange('primary', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.secondary || '#166534'}
                  onChange={(e) => handleThemeChange('secondary', e.target.value)}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.secondary || '#166534'}
                  onChange={(e) => handleThemeChange('secondary', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.accent || '#dcfce7'}
                  onChange={(e) => handleThemeChange('accent', e.target.value)}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={theme.accent || '#dcfce7'}
                  onChange={(e) => handleThemeChange('accent', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Preview</h4>
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-semibold" style={{ color: theme.primary }}>
                  {campusData?.displayName}
                </p>
                <p className="text-sm" style={{ color: theme.secondary }}>
                  Campus Theme Preview
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Campus Create Modal - For creating new campuses
 */
const CampusCreateModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    slug: '',
    status: 'active'
  });

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create New Campus
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Campus Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create Campus
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Campus Edit Modal - For editing existing campuses
 */
const CampusEditModal = ({ isOpen, campusData, onClose, onSave }) => {
  const [formData, setFormData] = useState(campusData || {});

  useScrollLock(isOpen);

  useEffect(() => {
    if (campusData) {
      setFormData(campusData);
    }
  }, [campusData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Campus
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Campus Delete Modal - For deleting campuses
 */
const CampusDeleteModal = ({ isOpen, campusData, onClose, onConfirm }) => {
  useScrollLock(isOpen);

  if (!isOpen || !campusData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Campus
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This action cannot be undone
              </p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete <strong>{campusData.displayName}</strong>? 
            This will permanently remove all campus data, users, and events.
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              Delete Campus
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusManagement;
