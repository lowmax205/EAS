import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";
import { useCampus } from "../../contexts/CampusContext";
import { useApi } from "../../hooks/useApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FilterComponent from "../../components/common/FilterComponent";
import useFilters from "../../components/common/useFilters";
import {
  User,
  Edit,
  Trash2,
  Plus,
  Mail,
  Shield,
  Calendar,
  X,
} from "lucide-react";
import mockUsersData from "../../data/mockUsers.json";
import {
  createUserFilterConfig,
  userFilterFunction,
} from "../../components/common/filterConfigs";
import { DEPARTMENTS } from "../../components/common/constants/index";
import { devError, devLog } from "../../components/common/devLogger";
import useScrollLock from "../../components/common/useScrollLock";
import { usePagination } from "../../components/common";
import Pagination from "../../components/ui/Pagination";

const UserManagement = () => {
  const { user: _user } = useAuth();
  const { auth: _auth, loading: _loading, error: _error } = useApi();
  
  // Campus context for multi-campus filtering
  const campusContext = useCampus();
  const { currentCampus, userCampusPermissions, isLoading: campusLoading } = campusContext;

  const [usersList, setUsersList] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Enable scroll lock when any modal is open
  useScrollLock(showCreateModal || showEditModal);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
    role: "student",
    department: "",
    course: "",
    status: "active",
  });

  // Memoize the filter configuration to prevent infinite re-renders
  const filterConfig = useMemo(() => {
    const options = {};
    
    // Add campus filtering if user can access multiple campuses
    if (!campusLoading && userCampusPermissions?.canSwitchCampuses) {
      options.includeCampusFilter = true;
      
      // Use multi-select for admin users, single-select for others
      if (userCampusPermissions.canAccessMultipleCampuses) {
        options.campusFilterType = 'multi';
        options.showAllCampusesOption = userCampusPermissions.isSuperAdmin;
      } else {
        options.campusFilterType = 'single';
        options.showAllCampusesOption = false;
      }
    }
    
    return createUserFilterConfig(usersList, options);
  }, [usersList, campusLoading, userCampusPermissions]);


  // Use the custom filter hook with centralized filter configuration
  const {
    searchTerm,
    setSearchTerm,
    filters,
    filteredData: filteredUsers,
    handleFilterChange,
    clearAllFilters,
  } = useFilters(filterConfig, usersList, userFilterFunction);

  // Centralized pagination for users (default: 10 items per page)
  const {
    paginatedData: paginatedUsers,
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    onPageChange,
    onItemsPerPageChange,
    resetPagination,
  } = usePagination(filteredUsers, 10);

  // Reset pagination when filtered data changes
  useEffect(() => {
    resetPagination();
  }, [filteredUsers.length, resetPagination]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Use mock users data from JSON file
      const usersData = mockUsersData.users.map((userData) => ({
        ...userData,
        // Ensure compatibility with existing component structure
        status: userData.isActive ? "active" : "inactive",
      }));
      setUsersList(usersData);
    } catch (error) {
      devError("[UserManagement] Error loading users:", error);
    }
  };

  const handleCreateUser = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.password) {
        alert("Please fill in all required fields");
        return;
      }

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      // Mock API call - replace with actual implementation
      const newUser = {
        id: usersList.length + 1,
        ...formData,
        // Remove confirmPassword from the user object before saving
        confirmPassword: undefined,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setUsersList([...usersList, newUser]);
      setShowCreateModal(false);
      resetForm();
      devLog("[UserManagement] User created successfully:", newUser);
      alert("User created successfully!");
    } catch (error) {
      devError("[UserManagement] Error creating user:", error);
      alert("Failed to create user");
    }
  };

  const handleEditUser = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.email) {
        alert("Please fill in all required fields");
        return;
      }

      // Check if password fields are filled and match (only if a new password is being set)
      if (formData.password && formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      // Prepare update data, remove password fields if empty
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
        delete updateData.confirmPassword;
      } else {
        delete updateData.confirmPassword; // Remove confirmPassword before saving
      }

      // Mock API call - replace with actual implementation
      const updatedUsers = usersList.map((u) =>
        u.id === selectedUser.id ? { ...u, ...updateData } : u
      );

      setUsersList(updatedUsers);
      setShowEditModal(false);
      setSelectedUser(null);
      resetForm();
      devLog("[UserManagement] User updated successfully:", selectedUser.id);
      alert("User updated successfully!");
    } catch (error) {
      devError("[UserManagement] Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // Mock API call - replace with actual implementation
        const updatedUsers = usersList.filter((u) => u.id !== userId);
        setUsersList(updatedUsers);
        devLog("[UserManagement] User deleted successfully:", userId);
        alert("User deleted successfully!");
      } catch (error) {
        devError("[UserManagement] Error deleting user:", error);
        alert("Failed to delete user");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      studentId: "",
      password: "",
      confirmPassword: "",
      role: "student",
      department: "",
      course: "",
      status: "active",
    });
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      password: "",
      confirmPassword: "",
      role: user.role,
      department: user.department,
      course: user.course,
      status: user.status,
    });
    setShowEditModal(true);
  };

  const getRoleColor = (role) => {
    const roleColors = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      organizer:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      student:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      faculty:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      staff:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    return (
      roleColors[role] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    );
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      inactive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    return (
      statusColors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    );
  };

  // Helper function to shorten department names by extracting acronym
  const getShortenedDepartment = (department) => {
    if (!department) return "";

    // Extract acronym from parentheses (e.g., "College of Technology (COT)" -> "COT")
    const acronymMatch = department.match(/\(([^)]+)\)/);
    if (acronymMatch) {
      return acronymMatch[1];
    }

    // If no acronym found, return the full department name
    return department;
  };

  // Extra security check - only admins should access this component
  if (_user?.role !== "admin") {
    devError(
      "Security violation: Non-admin user attempted to access UserManagement"
    );
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
        <div className="flex items-center space-x-3">
          <div className="text-red-500 text-2xl">⚠️</div>
          <div>
            <h3 className="font-medium text-red-800 dark:text-red-300">
              Access Violation Detected
            </h3>
            <p className="text-red-600 dark:text-red-400 text-sm">
              You do not have the required permissions to access User
              Management.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="bg-theme shadow-theme-md rounded-lg mb-6">
        <div className="px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-theme mb-2">
                User Management
              </h1>
              <p className="text-theme opacity-70">
                Create, edit, and manage user accounts and permissions
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={16} className="mr-2" />
              Create User
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6">
        {/* Reusable Filter Component */}
        <FilterComponent
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Search users by name, email, or student ID..."
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearAllFilters}
          variant="dropdown"
          showActiveFilters={true}
          showResultsCount={true}
          totalResults={usersList.length}
          filteredResults={filteredUsers.length}
        />
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <Card className="text-center py-12">
          <User className="w-16 h-16 text-theme opacity-50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-theme mb-2">
            No Users Found
          </h3>
          <p className="text-theme opacity-70 mb-4">
            {searchTerm ||
            filters.role?.value !== "" ||
            filters.status?.value !== "" ||
            filters.department?.value !== ""
              ? "Try adjusting your search or filter criteria to find users."
              : "No users have been created yet."}
          </p>
          <Button onClick={clearAllFilters}>Clear Filters</Button>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <User size={20} className="text-gray-600 dark:text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.studentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{getShortenedDepartment(user.department)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>{user.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                          <Edit size={14} />
                        </Button>
                        {user.id !== user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredUsers.length}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
              itemsPerPageOptions={[10, 20, 30, 50]}
            />
          </div>
        </Card>
      )}

      {/* Create/Edit User Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {showCreateModal ? "Create New User" : "Edit User"}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {showCreateModal
                      ? "Add a new user to the system with role and permissions"
                      : "Update user information and role assignments"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedUser(null);
                  resetForm();
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showCreateModal ? handleCreateUser() : handleEditUser();
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) =>
                        setFormData({ ...formData, studentId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter student ID"
                    />
                  </div>

                  {showCreateModal && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter password"
                        required
                      />
                    </div>
                  )}

                  {showCreateModal && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="student">Student</option>
                      <option value="organizer">Organizer</option>
                      <option value="admin">Admin</option>
                      <option value="faculty">Faculty</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-eas-light-primary focus:border-eas-light-primary dark:focus:ring-eas-dark-primary dark:focus:border-eas-dark-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setSelectedUser(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {showCreateModal ? "Create User" : "Update User"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
