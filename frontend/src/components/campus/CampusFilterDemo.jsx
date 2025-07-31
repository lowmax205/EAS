import React, { useState } from 'react';
import { Building2, Users, Calendar } from 'lucide-react';
import Card from '../ui/Card';
import { CampusFilter, CampusMultiSelectFilter, CampusFilterIndicator } from '../ui/CampusFilter';
import { useCampus } from '../../contexts/CampusContext';

/**
 * CampusFilterDemo - Demonstration component showing all campus filter variants
 * This component showcases the different ways campus filtering can be implemented
 */
const CampusFilterDemo = () => {
  const [singleSelection, setSingleSelection] = useState("current");
  const [multiSelection, setMultiSelection] = useState([]);
  const [activeIndicator, setActiveIndicator] = useState("current");
  
  const { userCampusPermissions, availableCampuses } = useCampus();

  // Demo event data with campus assignments
  const demoEvents = [
    { id: 1, title: "Welcome Orientation", campusId: 1, campus: "Main Campus" },
    { id: 2, title: "Research Symposium", campusId: 2, campus: "North Campus" },
    { id: 3, title: "Sports Festival", campusId: 3, campus: "South Campus" },
    { id: 4, title: "Tech Conference", campusId: 1, campus: "Main Campus" },
    { id: 5, title: "Art Exhibition", campusId: 2, campus: "North Campus" },
  ];

  // Demo user data with campus assignments
  const demoUsers = [
    { id: 1, name: "John Doe", campusId: 1, campus: "Main Campus", role: "Student" },
    { id: 2, name: "Jane Smith", campusId: 2, campus: "North Campus", role: "Faculty" },
    { id: 3, name: "Mike Johnson", campusId: 3, campus: "South Campus", role: "Staff" },
    { id: 4, name: "Emily Davis", campusId: 1, campus: "Main Campus", role: "Admin" },
  ];

  // Filter demo data based on campus selection
  const getFilteredEvents = (selection) => {
    if (!selection || selection === "current") {
      return demoEvents.filter(event => event.campusId === 1); // Current campus simulation
    }
    if (selection === "all") {
      return demoEvents;
    }
    if (Array.isArray(selection)) {
      if (selection.length === 0) return [];
      return demoEvents.filter(event => 
        selection.map(id => parseInt(id)).includes(event.campusId)
      );
    }
    return demoEvents.filter(event => event.campusId === parseInt(selection));
  };

  const getFilteredUsers = (selection) => {
    if (!selection || selection === "current") {
      return demoUsers.filter(user => user.campusId === 1);
    }
    if (selection === "all") {
      return demoUsers;
    }
    if (Array.isArray(selection)) {
      if (selection.length === 0) return [];
      return demoUsers.filter(user => 
        selection.map(id => parseInt(id)).includes(user.campusId)
      );
    }
    return demoUsers.filter(user => user.campusId === parseInt(selection));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Campus Filter Components Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demonstration of campus filtering capabilities for multi-campus support
        </p>
      </div>

      {/* User Permission Info */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Current User Permissions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Can Switch Campuses:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                userCampusPermissions?.canSwitchCampuses 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {userCampusPermissions?.canSwitchCampuses ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Multi-Campus Access:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                userCampusPermissions?.canAccessMultipleCampuses 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {userCampusPermissions?.canAccessMultipleCampuses ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-medium">Super Admin:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                userCampusPermissions?.isSuperAdmin 
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {userCampusPermissions?.isSuperAdmin ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Single Campus Filter Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Single Campus Filter
            </h2>
            
            <div className="space-y-4">
              <CampusFilter
                selectedCampusIds={[singleSelection]}
                onCampusFilterChange={(selection) => {
                  setSingleSelection(Array.isArray(selection) ? selection[0] : selection);
                  setActiveIndicator(Array.isArray(selection) ? selection[0] : selection);
                }}
                showAllOption={userCampusPermissions?.isSuperAdmin}
                label="Event Campus Filter"
                placeholder="Select campus for events..."
              />
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Filtered Events ({getFilteredEvents(singleSelection).length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {getFilteredEvents(singleSelection).map(event => (
                    <div key={event.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{event.title}</span>
                      <span className="text-sm text-gray-500">({event.campus})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Multi-Select Campus Filter
            </h2>
            
            <div className="space-y-4">
              {userCampusPermissions?.canAccessMultipleCampuses ? (
                <>
                  <CampusMultiSelectFilter
                    selectedCampuses={multiSelection}
                    onSelectionChange={setMultiSelection}
                  />
                  
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Filtered Users ({getFilteredUsers(multiSelection).length})</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {getFilteredUsers(multiSelection).map(user => (
                        <div key={user.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{user.name}</span>
                          <span className="text-sm text-gray-500">({user.role} - {user.campus})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Multi-select campus filtering is only available for users with multi-campus access permissions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Campus Filter Indicators Demo */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Campus Filter Indicators</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Active Filter Indicators:</h3>
              <div className="flex flex-wrap gap-2">
                <CampusFilterIndicator
                  activeFilter={activeIndicator}
                  showClearButton={true}
                  onClear={() => {
                    setActiveIndicator("current");
                    setSingleSelection("current");
                  }}
                />
                
                {multiSelection.length > 0 && (
                  <CampusFilterIndicator
                    activeFilter={multiSelection}
                    showClearButton={true}
                    onClear={() => setMultiSelection([])}
                  />
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Sample Filter States:</h3>
              <div className="flex flex-wrap gap-2">
                <CampusFilterIndicator activeFilter="current" />
                <CampusFilterIndicator activeFilter="all" />
                <CampusFilterIndicator activeFilter="2" />
                <CampusFilterIndicator activeFilter={['1', '2']} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Compact Variants Demo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Compact Campus Filter</h2>
            <div className="space-y-4">
              <CampusFilter
                compact={true}
                selectedCampusIds={[singleSelection]}
                onCampusFilterChange={(selection) => {
                  setSingleSelection(Array.isArray(selection) ? selection[0] : selection);
                }}
                placeholder="Campus..."
              />
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Compact variant is ideal for toolbars and inline filtering
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Available Campuses</h2>
            <div className="space-y-2">
              {availableCampuses.map(campus => (
                <div key={campus.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: campus.theme.primary }}
                  />
                  <div>
                    <div className="font-medium">{campus.displayName}</div>
                    <div className="text-sm text-gray-500">{campus.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CampusFilterDemo;
