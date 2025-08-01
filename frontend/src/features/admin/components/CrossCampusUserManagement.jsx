/**
 * Cross-Campus User Management Interface
 * Story 1.7: Multi-Campus System Administration - Task 2
 * 
 * Super admin interface for:
 * - Cross-campus user management with campus assignment and transfer capabilities  
 * - Campus transfer workflow with role preservation
 * - Cross-campus user search and filtering functionality
 * - User campus history tracking and audit trail
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  ArrowRight, 
  Download, 
  Upload,
  History,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Shield,
  User,
  Mail,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useCampus } from '../../../contexts/CampusContext';
import { devError, devLog } from '../../../components/common/devLogger';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { CampusSelector } from '../../../components/ui/CampusSelector';

/**
 * Cross-Campus User Management Component
 */
const CrossCampusUserManagement = () => {
  const { user } = useAuth();
  const { 
    availableCampuses, 
    userCampusPermissions,
    isLoading: campusLoading
  } = useCampus();

  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampusFilter, setSelectedCampusFilter] = useState('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transfer management
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferConfig, setTransferConfig] = useState({
    targetCampusId: null,
    preserveRole: true,
    preserveEventHistory: true,
    transferReason: '',
    notifyUser: true
  });
  const [transferHistory, setTransferHistory] = useState([]);

  // Check permissions
  useEffect(() => {
    if (!campusLoading && (!userCampusPermissions?.isSuperAdmin)) {
      setError('Access denied. Super admin permissions required.');
      return;
    }
  }, [userCampusPermissions, campusLoading]);

  // Load users data
  useEffect(() => {
    const loadUsersData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mock cross-campus users data
        const mockUsers = [
          {
            id: 1,
            studentNumber: 'SNSU-2021-001',
            firstName: 'Juan',
            lastName: 'Dela Cruz',
            email: 'juan.delacruz@snsu.edu.ph',
            role: 'student',
            campusId: 1,
            campusName: 'SNSU',
            status: 'active',
            createdAt: '2021-08-15T00:00:00Z',
            lastLoginAt: '2025-08-01T08:30:00Z',
            program: 'Computer Science',
            yearLevel: 4,
            eventsAttended: 45,
            transferHistory: []
          },
          {
            id: 2,
            studentNumber: 'USC-2020-156',
            firstName: 'Maria',
            lastName: 'Santos',
            email: 'maria.santos@usc.edu',
            role: 'organizer',
            campusId: 2,
            campusName: 'USC',
            status: 'active',
            createdAt: '2020-09-10T00:00:00Z',
            lastLoginAt: '2025-07-31T16:45:00Z',
            department: 'Student Affairs',
            eventsOrganized: 23,
            transferHistory: [
              {
                id: 1,
                fromCampusId: 1,
                toCampusId: 2,
                transferDate: '2023-01-15T00:00:00Z',
                reason: 'Career advancement opportunity',
                approvedBy: 'Super Admin',
                status: 'completed'
              }
            ]
          },
          {
            id: 3,
            studentNumber: 'STAN-2019-089',
            firstName: 'Robert',
            lastName: 'Johnson',
            email: 'robert.johnson@stanford.edu',
            role: 'campus_admin',
            campusId: 3,
            campusName: 'Stanford',
            status: 'active',
            createdAt: '2019-09-01T00:00:00Z',
            lastLoginAt: '2025-08-01T09:15:00Z',
            department: 'Administration',
            managedEvents: 67,
            transferHistory: []
          },
          {
            id: 4,
            studentNumber: 'MIT-2022-234',
            firstName: 'Emily',
            lastName: 'Chen',
            email: 'emily.chen@mit.edu',
            role: 'student',
            campusId: 4,
            campusName: 'MIT',
            status: 'active',
            createdAt: '2022-08-20T00:00:00Z',
            lastLoginAt: '2025-07-30T14:20:00Z',
            program: 'Electrical Engineering',
            yearLevel: 3,
            eventsAttended: 28,
            transferHistory: []
          },
          {
            id: 5,
            studentNumber: 'SNSU-2020-445',
            firstName: 'Carlos',
            lastName: 'Rodriguez',
            email: 'carlos.rodriguez@snsu.edu.ph',
            role: 'organizer',
            campusId: 1,
            campusName: 'SNSU',
            status: 'inactive',
            createdAt: '2020-08-15T00:00:00Z',
            lastLoginAt: '2025-07-15T11:30:00Z',
            department: 'Engineering',
            eventsOrganized: 12,
            transferHistory: []
          }
        ];

        // Mock transfer history
        const mockTransferHistory = [
          {
            id: 1,
            userId: 2,
            userName: 'Maria Santos',
            fromCampusId: 1,
            fromCampusName: 'SNSU',
            toCampusId: 2,
            toCampusName: 'USC',
            transferDate: '2023-01-15T00:00:00Z',
            reason: 'Career advancement opportunity',
            approvedBy: 'Super Admin',
            requestedBy: 'Maria Santos',
            status: 'completed',
            preservedRole: true,
            preservedEventHistory: true
          },
          {
            id: 2,
            userId: 6,
            userName: 'David Wilson',
            fromCampusId: 3,
            fromCampusName: 'Stanford',
            toCampusId: 1,
            toCampusName: 'SNSU',
            transferDate: '2024-03-10T00:00:00Z',
            reason: 'Relocation',
            approvedBy: 'Super Admin',
            requestedBy: 'David Wilson',
            status: 'completed',
            preservedRole: true,
            preservedEventHistory: false
          }
        ];

        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        setTransferHistory(mockTransferHistory);

        devLog('[CrossCampusUserManagement] Users data loaded successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users data');
        devError('[CrossCampusUserManagement] Error loading users data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userCampusPermissions?.isSuperAdmin) {
      loadUsersData();
    }
  }, [userCampusPermissions?.isSuperAdmin]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.studentNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Campus filter
    if (selectedCampusFilter !== 'all') {
      filtered = filtered.filter(user => user.campusId === parseInt(selectedCampusFilter));
    }

    // Role filter
    if (selectedRoleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRoleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, selectedCampusFilter, selectedRoleFilter]);

  // Handle user selection
  const handleUserSelection = (userId, isSelected) => {
    if (isSelected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Handle bulk transfer
  const handleBulkTransfer = () => {
    if (selectedUsers.length === 0) {
      alert('Please select users to transfer');
      return;
    }
    setShowTransferModal(true);
  };

  // Execute transfer
  const executeTransfer = async () => {
    try {
      // Mock transfer execution
      const newTransfer = {
        id: transferHistory.length + 1,
        userIds: selectedUsers,
        targetCampusId: transferConfig.targetCampusId,
        transferDate: new Date().toISOString(),
        reason: transferConfig.transferReason,
        approvedBy: user.name,
        status: 'pending',
        preservedRole: transferConfig.preserveRole,
        preservedEventHistory: transferConfig.preserveEventHistory
      };

      setTransferHistory(prev => [newTransfer, ...prev]);
      setSelectedUsers([]);
      setShowTransferModal(false);
      setTransferConfig({
        targetCampusId: null,
        preserveRole: true,
        preserveEventHistory: true,
        transferReason: '',
        notifyUser: true
      });

      alert('User transfer initiated successfully');
    } catch (error) {
      devError('[CrossCampusUserManagement] Transfer error:', error);
      alert('Transfer failed. Please try again.');
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'campus_admin': return 'bg-blue-100 text-blue-800';
      case 'organizer': return 'bg-green-100 text-green-800';
      case 'student': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!userCampusPermissions?.isSuperAdmin && !campusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center max-w-md">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Super admin permissions required for cross-campus user management.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cross-Campus User Management</h2>
          <p className="text-gray-600">Manage users across all campuses and handle transfers</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Campus Filter */}
          <select
            value={selectedCampusFilter}
            onChange={(e) => setSelectedCampusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Campuses</option>
            {availableCampuses.map(campus => (
              <option key={campus.id} value={campus.id}>{campus.displayName}</option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="organizer">Organizers</option>
            <option value="campus_admin">Campus Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>

          {/* Bulk Actions */}
          <Button
            onClick={handleBulkTransfer}
            disabled={selectedUsers.length === 0}
            className="flex items-center space-x-2"
          >
            <ArrowRight className="h-4 w-4" />
            <span>Transfer Selected ({selectedUsers.length})</span>
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Users ({filteredUsers.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.studentNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{user.campusName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.lastLoginAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <History className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transfer History */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transfer History</h3>
        <div className="space-y-4">
          {transferHistory.slice(0, 5).map((transfer) => (
            <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transfer.userName}</p>
                  <p className="text-sm text-gray-500">
                    {transfer.fromCampusName} → {transfer.toCampusName}
                  </p>
                  <p className="text-xs text-gray-400">{transfer.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(transfer.status)}`}>
                  {transfer.status.toUpperCase()}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(transfer.transferDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Users</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Campus
                </label>
                <select
                  value={transferConfig.targetCampusId || ''}
                  onChange={(e) => setTransferConfig(prev => ({ ...prev, targetCampusId: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select campus...</option>
                  {availableCampuses.map(campus => (
                    <option key={campus.id} value={campus.id}>{campus.displayName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Reason
                </label>
                <textarea
                  value={transferConfig.transferReason}
                  onChange={(e) => setTransferConfig(prev => ({ ...prev, transferReason: e.target.value }))}
                  placeholder="Enter reason for transfer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={transferConfig.preserveRole}
                    onChange={(e) => setTransferConfig(prev => ({ ...prev, preserveRole: e.target.checked }))}
                    className="rounded mr-2"
                  />
                  <label className="text-sm text-gray-700">Preserve user role</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={transferConfig.preserveEventHistory}
                    onChange={(e) => setTransferConfig(prev => ({ ...prev, preserveEventHistory: e.target.checked }))}
                    className="rounded mr-2"
                  />
                  <label className="text-sm text-gray-700">Preserve event history</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={transferConfig.notifyUser}
                    onChange={(e) => setTransferConfig(prev => ({ ...prev, notifyUser: e.target.checked }))}
                    className="rounded mr-2"
                  />
                  <label className="text-sm text-gray-700">Notify user by email</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowTransferModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={executeTransfer}
                disabled={!transferConfig.targetCampusId || !transferConfig.transferReason}
              >
                Transfer Users
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrossCampusUserManagement;
