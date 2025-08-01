/**
 * Campus Management Interface
 * Story 1.6: Campus-Specific Reporting & Analytics - Task 3
 * 
 * Super admin interface for campus CRUD operations and configuration management
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Settings,
  Users,
  Activity,
  Globe,
  Eye,
  EyeOff,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useCampus } from '../../contexts/CampusContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { devLog, devError } from '../common/devLogger';

/**
 * Campus Management Component - Super Admin Only
 */
const CampusManagement = () => {
  const { 
    availableCampuses, 
    userCampusPermissions,
    refreshCampusData
  } = useCampus();

  const [campuses, setCampuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCampus, setEditingCampus] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    code: '',
    domain: '',
    description: '',
    isActive: true,
    theme: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#10B981'
    },
    settings: {
      allowSelfRegistration: true,
      requireEmailVerification: true,
      maxEventsPerMonth: 50,
      enableNotifications: true
    }
  });

  // Load campus data
  useEffect(() => {
    const loadCampusData = async () => {
      setIsLoading(true);
      try {
        // Add mock statistics to campus data
        const campusesWithStats = await Promise.all(
          availableCampuses.map(async (campus) => {
            // Mock statistics - in production, fetch from API
            const stats = await generateCampusStats(campus.id);
            return {
              ...campus,
              stats
            };
          })
        );
        
        setCampuses(campusesWithStats);
        devLog("[CampusManagement] Campus data loaded:", campusesWithStats.length);
      } catch (error) {
        devError("[CampusManagement] Error loading campus data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (availableCampuses.length > 0) {
      loadCampusData();
    }
  }, [availableCampuses]);

  // Generate mock campus statistics
  const generateCampusStats = async (campusId) => {
    // Mock data - in production, fetch from analytics API
    return {
      totalUsers: Math.floor(Math.random() * 500) + 100,
      totalEvents: Math.floor(Math.random() * 50) + 10,
      totalAttendance: Math.floor(Math.random() * 2000) + 500,
      activeUsers: Math.floor(Math.random() * 200) + 50,
      attendanceRate: Math.floor(Math.random() * 30) + 70, // 70-100%
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle campus creation
  const handleCreateCampus = async () => {
    try {
      devLog("[CampusManagement] Creating new campus:", formData);
      
      // Mock API call - in production, call actual API
      const newCampus = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        stats: await generateCampusStats(Date.now())
      };

      setCampuses(prev => [...prev, newCampus]);
      setShowCreateForm(false);
      resetForm();
      
      // Refresh campus context
      if (refreshCampusData) {
        await refreshCampusData();
      }

      devLog("[CampusManagement] Campus created successfully:", newCampus.id);
    } catch (error) {
      devError("[CampusManagement] Error creating campus:", error);
    }
  };

  // Handle campus update
  const handleUpdateCampus = async () => {
    try {
      devLog("[CampusManagement] Updating campus:", editingCampus.id);
      
      setCampuses(prev => 
        prev.map(campus => 
          campus.id === editingCampus.id 
            ? { ...campus, ...formData, updatedAt: new Date().toISOString() }
            : campus
        )
      );

      setEditingCampus(null);
      resetForm();

      // Refresh campus context
      if (refreshCampusData) {
        await refreshCampusData();
      }

      devLog("[CampusManagement] Campus updated successfully");
    } catch (error) {
      devError("[CampusManagement] Error updating campus:", error);
    }
  };

  // Handle campus deletion
  const handleDeleteCampus = async (campusId, campusName) => {
    if (window.confirm(`Are you sure you want to delete ${campusName}? This action cannot be undone.`)) {
      try {
        devLog("[CampusManagement] Deleting campus:", campusId);
        
        setCampuses(prev => prev.filter(campus => campus.id !== campusId));

        // Refresh campus context
        if (refreshCampusData) {
          await refreshCampusData();
        }

        devLog("[CampusManagement] Campus deleted successfully");
      } catch (error) {
        devError("[CampusManagement] Error deleting campus:", error);
      }
    }
  };

  // Handle campus status toggle
  const handleToggleCampusStatus = async (campusId) => {
    try {
      setCampuses(prev => 
        prev.map(campus => 
          campus.id === campusId 
            ? { ...campus, isActive: !campus.isActive, updatedAt: new Date().toISOString() }
            : campus
        )
      );

      devLog("[CampusManagement] Campus status toggled:", campusId);
    } catch (error) {
      devError("[CampusManagement] Error toggling campus status:", error);
    }
  };

  // Start editing campus
  const startEditing = (campus) => {
    setEditingCampus(campus);
    setFormData({
      displayName: campus.displayName,
      code: campus.code,
      domain: campus.domain || '',
      description: campus.description || '',
      isActive: campus.isActive,
      theme: campus.theme || formData.theme,
      settings: campus.settings || formData.settings
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      displayName: '',
      code: '',
      domain: '',
      description: '',
      isActive: true,
      theme: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981'
      },
      settings: {
        allowSelfRegistration: true,
        requireEmailVerification: true,
        maxEventsPerMonth: 50,
        enableNotifications: true
      }
    });
  };

  // Check if user has permission
  if (!userCampusPermissions.isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <div className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Campus management requires super administrator permissions.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Campus Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage campus entities, settings, and configurations
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Campus
        </Button>
      </div>

      {/* Campus Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campuses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{campuses.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Campuses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {campuses.filter(c => c.isActive).length}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {campuses.reduce((sum, campus) => sum + (campus.stats?.totalUsers || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {campuses.reduce((sum, campus) => sum + (campus.stats?.totalEvents || 0), 0)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Campus List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {campuses.map((campus) => (
          <Card key={campus.id}>
            <div className="p-6">
              {/* Campus Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: campus.theme?.primary || '#3B82F6' }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {campus.displayName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {campus.code}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleCampusStatus(campus.id)}
                    className="p-1"
                  >
                    {campus.isActive ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(campus)}
                    className="p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCampus(campus.id, campus.displayName)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Campus Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {campus.stats?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Users</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {campus.stats?.totalEvents || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Events</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {campus.stats?.totalAttendance || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Attendance</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {campus.stats?.attendanceRate || 0}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Rate</p>
                </div>
              </div>

              {/* Campus Status */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  campus.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {campus.isActive ? 'Active' : 'Inactive'}
                </span>
                
                {campus.stats?.lastActivity && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Last activity: {new Date(campus.stats.lastActivity).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Campus Description */}
              {campus.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  {campus.description}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Campus Modal */}
      {(showCreateForm || editingCampus) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingCampus ? 'Edit Campus' : 'Create New Campus'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCampus(null);
                    resetForm();
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Campus Name *
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="e.g., North Campus"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Campus Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="e.g., NC"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., northcampus.example.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Campus description..."
                  />
                </div>

                {/* Theme Colors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme Colors
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Primary</label>
                      <input
                        type="color"
                        value={formData.theme.primary}
                        onChange={(e) => handleInputChange('theme.primary', e.target.value)}
                        className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Secondary</label>
                      <input
                        type="color"
                        value={formData.theme.secondary}
                        onChange={(e) => handleInputChange('theme.secondary', e.target.value)}
                        className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Accent</label>
                      <input
                        type="color"
                        value={formData.theme.accent}
                        onChange={(e) => handleInputChange('theme.accent', e.target.value)}
                        className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Campus Settings
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Campus is active</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.settings.allowSelfRegistration}
                        onChange={(e) => handleInputChange('settings.allowSelfRegistration', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Allow self registration</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.settings.requireEmailVerification}
                        onChange={(e) => handleInputChange('settings.requireEmailVerification', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Require email verification</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.settings.enableNotifications}
                        onChange={(e) => handleInputChange('settings.enableNotifications', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Enable notifications</span>
                    </label>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Max Events Per Month
                    </label>
                    <input
                      type="number"
                      value={formData.settings.maxEventsPerMonth}
                      onChange={(e) => handleInputChange('settings.maxEventsPerMonth', parseInt(e.target.value))}
                      className="w-32 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      min="1"
                      max="500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingCampus(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingCampus ? handleUpdateCampus : handleCreateCampus}
                    disabled={!formData.displayName || !formData.code}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingCampus ? 'Update Campus' : 'Create Campus'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CampusManagement;
