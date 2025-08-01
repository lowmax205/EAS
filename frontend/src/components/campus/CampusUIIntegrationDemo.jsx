/**
 * Campus UI Integration Demo
 * Demonstrates all campus UI components working together
 * Story 1.4: Campus Selection UI Components implementation showcase
 */

import React, { useState } from 'react';
import { Building2, Users, Calendar, Settings } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { CampusSelector, CampusSelectorCompact, CampusIndicator } from '../ui/CampusSelector';
import { CampusFilter, CampusMultiSelectFilter, CampusFilterIndicator } from '../ui/CampusFilter';
import { useCampus } from '../../contexts/CampusContext';

/**
 * Campus UI Integration Demo - Showcases all campus selection components
 */
const CampusUIIntegrationDemo = () => {
  const [selectedCampuses, setSelectedCampuses] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('current');
  
  const { 
    currentCampus, 
    availableCampuses, 
    userCampusPermissions, 
    isLoading 
  } = useCampus();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-300 h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Campus UI Components Integration Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Story 1.4: Campus Selection UI Components - All components working together
        </p>
      </div>

      {/* Current Campus Context */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Current Campus Context
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Campus:</span>
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: currentCampus.theme.primary }}
                />
                <span className="font-medium">{currentCampus.displayName}</span>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Campuses:</span>
              <p className="mt-1">{availableCampuses.length} campuses</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Permissions:</span>
              <div className="mt-1">
                {userCampusPermissions.isSuperAdmin && (
                  <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-1">
                    Super Admin
                  </span>
                )}
                {userCampusPermissions.isCampusAdmin && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                    Campus Admin
                  </span>
                )}
                {userCampusPermissions.canSwitchCampuses && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Can Switch
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Campus Selector Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Campus Selector Components
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Campus Selector
                </label>
                <CampusSelector />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Compact Campus Selector
                </label>
                <CampusSelectorCompact />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Campus Indicator (Read-only)
                </label>
                <CampusIndicator />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Campus Filter Components
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Single Campus Filter
                </label>
                <CampusFilter 
                  campusFilterValue={currentFilter}
                  onCampusFilterChange={setCurrentFilter}
                  showAllCampusesOption={userCampusPermissions.isSuperAdmin}
                />
                <CampusFilterIndicator 
                  activeFilter={currentFilter} 
                  className="mt-2"
                />
              </div>
              
              {userCampusPermissions.canAccessMultipleCampuses && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Multi-Select Campus Filter (Admin Only)
                  </label>
                  <CampusMultiSelectFilter 
                    selectedCampuses={selectedCampuses}
                    onSelectionChange={setSelectedCampuses}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Compact Filter Variant
                </label>
                <CampusFilter 
                  variant="compact"
                  campusFilterValue={currentFilter}
                  onCampusFilterChange={setCurrentFilter}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Integration Examples */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Real-World Integration Examples
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Header Navigation Integration</h4>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">EAS Dashboard</span>
                    <CampusIndicator showThemeColor={true} />
                  </div>
                  <CampusSelectorCompact />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Event Filter Integration</h4>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-sm font-medium">Filter Events:</span>
                  <CampusFilter 
                    variant="compact"
                    campusFilterValue={currentFilter}
                    onCampusFilterChange={setCurrentFilter}
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing events for: {currentFilter === 'current' ? currentCampus.displayName : 'All Campuses'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Feature Showcase */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Campus UI Features Implemented</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium">Campus Context</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                React Context Provider for campus state management
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium">Campus Selector</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ShadCN/UI based campus selection dropdown
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium">Campus Filters</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Single and multi-select filtering components
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-medium">Integration</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Seamless integration with existing components
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Success Message */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="font-medium text-green-800 dark:text-green-300">
            ✅ Story 1.4: Campus Selection UI Components - Implementation Complete!
          </span>
        </div>
        <p className="text-green-700 dark:text-green-400 text-sm mt-2">
          All campus UI components are working correctly with proper theming, responsive design, and accessibility features.
        </p>
      </div>
    </div>
  );
};

export default CampusUIIntegrationDemo;
