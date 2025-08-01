/**
 * Campus Admin Interface
 * Story 1.6: Campus-Specific Reporting & Analytics - Task 4
 * 
 * Campus-scoped admin interface for managing users and events within a specific campus
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  CheckCircle,
  XCircle,
  Activity,
  Filter,
  Download,
  Search
} from 'lucide-react';
import { useCampus } from '../../contexts/CampusContext';
import { useAuth } from '../auth/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { CampusIndicator } from '../ui/CampusSelector';
import { devLog, devError } from '../common/devLogger';

/**
 * Campus Admin Dashboard - For campus administrators to manage their campus
 */
const CampusAdminDashboard = () => {
  const { user } = useAuth();
  const { 
    currentCampus, 
    userCampusPermissions,
    isLoading: campusLoading 
  } = useCampus();

  const [activeTab, setActiveTab] = useState('overview');
  const [campusUsers, setCampusUsers] = useState([]);
  const [campusEvents, setCampusEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // all, active, inactive
  const [eventFilter, setEventFilter] = useState('all'); // all, upcoming, past

  // Load campus data
  useEffect(() => {
    const loadCampusAdminData = async () => {
      if (campusLoading || !currentCampus) return;

      setIsLoading(true);
      try {
        // Load mock data and filter by campus
        const [mockUsers, mockEvents] = await Promise.all([
          import('../../data/mockUsers.json'),
          import('../../data/mockEvents.json')
        ]);

        const users = mockUsers.default.users || mockUsers.users || [];
        const events = mockEvents.default.events || mockEvents.events || [];

        // Filter data to current campus only
        const filteredUsers = users.filter(user => user.campusId === currentCampus.id);
        const filteredEvents = events.filter(event => event.campusId === currentCampus.id);

        setCampusUsers(filteredUsers);
        setCampusEvents(filteredEvents);

        devLog("[CampusAdminDashboard] Campus admin data loaded:", {
          campusId: currentCampus.id,
          users: filteredUsers.length,
          events: filteredEvents.length
        });
      } catch (error) {
        devError("[CampusAdminDashboard] Error loading campus admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampusAdminData();
  }, [campusLoading, currentCampus]);

  // Filter users based on search and filter
  const filteredUsers = useMemo(() => {
    return campusUsers.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = userFilter === 'all' ||
        (userFilter === 'active' && user.isActive) ||
        (userFilter === 'inactive' && !user.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [campusUsers, searchTerm, userFilter]);

  // Filter events based on filter
  const filteredEvents = useMemo(() => {
    const currentDate = new Date();
    
    return campusEvents.filter(event => {
      if (eventFilter === 'all') return true;
      if (eventFilter === 'upcoming') {
        return new Date(event.date) >= currentDate;
      }
      if (eventFilter === 'past') {
        return new Date(event.date) < currentDate;
      }
      return true;
    });
  }, [campusEvents, eventFilter]);

  // Calculate campus metrics
  const campusMetrics = useMemo(() => {
    const currentDate = new Date();
    const activeUsers = campusUsers.filter(user => user.isActive).length;
    const upcomingEvents = campusEvents.filter(event => new Date(event.date) >= currentDate).length;
    const pastEvents = campusEvents.filter(event => new Date(event.date) < currentDate).length;
    
    return {
      totalUsers: campusUsers.length,
      activeUsers,
      inactiveUsers: campusUsers.length - activeUsers,
      totalEvents: campusEvents.length,
      upcomingEvents,
      pastEvents,
      studentCount: campusUsers.filter(user => user.role === 'student').length,
      organizerCount: campusUsers.filter(user => user.role === 'organizer').length
    };
  }, [campusUsers, campusEvents]);

  // Handle user status toggle
  const handleToggleUserStatus = async (userId) => {
    try {
      setCampusUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isActive: !user.isActive, updatedAt: new Date().toISOString() }
            : user
        )
      );

      devLog("[CampusAdminDashboard] User status toggled:", userId);
    } catch (error) {
      devError("[CampusAdminDashboard] Error toggling user status:", error);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      try {
        setCampusEvents(prev => prev.filter(event => event.id !== eventId));
        devLog("[CampusAdminDashboard] Event deleted:", eventId);
      } catch (error) {
        devError("[CampusAdminDashboard] Error deleting event:", error);
      }
    }
  };

  // Check permissions
  if (!userCampusPermissions.isCampusAdmin && !userCampusPermissions.isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Campus administration requires campus admin or super admin permissions.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (campusLoading || isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Campus Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Campus Administration
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <CampusIndicator showThemeColor={true} />
            <span className="text-gray-600 dark:text-gray-400">
              Manage users and events for {currentCampus.displayName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              // Export campus report
              devLog("[CampusAdminDashboard] Exporting campus report");
            }}
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Campus Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{campusMetrics.totalUsers}</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {campusMetrics.activeUsers} active
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{campusMetrics.totalEvents}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {campusMetrics.upcomingEvents} upcoming
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{campusMetrics.studentCount}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Registered</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Organizers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{campusMetrics.organizerCount}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active staff</p>
              </div>
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'events', label: 'Event Management', icon: Calendar }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {campusUsers.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{user.role} • {user.email}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {filteredEvents.filter(event => new Date(event.date) >= new Date()).slice(0, 5).map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(event.date).toLocaleDateString()} • {event.category}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {event.currentAttendees || 0}/{event.maxAttendees || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Management Controls */}
          <Card>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
                    />
                  </div>
                  
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>

                <Button className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add User
                </Button>
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Campus Users ({filteredUsers.length})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : user.role === 'organizer'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleUserStatus(user.id)}
                            >
                              {user.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
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

      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Event Management Controls */}
          <Card>
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <select
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Events</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past Events</option>
                  </select>
                </div>

                <Button className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Create Event
                </Button>
              </div>
            </div>
          </Card>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {event.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      📅 {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      📍 {event.location}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      👥 {event.currentAttendees || 0}/{event.maxAttendees || 0} attendees
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : event.status === 'cancelled'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {event.status || 'scheduled'}
                    </span>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(event.date) >= new Date() ? 'Upcoming' : 'Past'}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusAdminDashboard;
