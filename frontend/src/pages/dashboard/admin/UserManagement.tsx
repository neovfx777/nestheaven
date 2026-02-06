import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, Plus, Edit, Trash2, Search, 
  Mail, Phone, Calendar, User
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import { usersApi } from '../../../api/users';
import { useAuthStore } from '../../../stores/authStore';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
}

interface CreateUserForm {
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface UserManagementProps {
  /**
   * Mode:
   * - "users": faqat oddiy foydalanuvchilar (USER, SELLER)
   * - "admins": faqat admin rollar (ADMIN, MANAGER_ADMIN, OWNER_ADMIN)
   */
  mode?: 'users' | 'admins';
}

export function UserManagement({ mode = 'users' }: UserManagementProps) {
  const { token } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchBy, setSearchBy] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    email: '',
    password: '',
    role: 'USER',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const queryClient = useQueryClient();

  // Build query parameters
  const buildQueryParams = () => {
    const params: Record<string, string> = {};
    
    // Add mode parameter to filter users on backend
    if (mode === 'admins') {
      params.mode = 'admins';
    } else {
      params.mode = 'users';
    }
    
    if (roleFilter !== 'all') {
      params.role = roleFilter;
    }
    
    if (searchTerm.trim()) {
      params.searchTerm = searchTerm;
      params.searchBy = searchBy;
    }
    
    return params;
  };

  // Fetch users with search
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['admin-users', mode, roleFilter, searchTerm, searchBy],
    queryFn: async () => {
      try {
        const queryParams = buildQueryParams();
        console.log('🚀 Frontend calling API with params:', queryParams);
        const result = await usersApi.getAdminUsers(queryParams);
        console.log('📥 Frontend received result:', result);
        console.log('📥 Response structure check:', {
          hasUsers: !!result?.users,
          usersLength: result?.users?.length || 0,
          hasTotal: !!result?.total,
          total: result?.total
        });
        // Ensure we always return a valid response structure
        return result || {
          users: [],
          total: 0,
          filters: { role: null, searchTerm: null, searchBy: 'all' },
          search: { term: null, by: 'all', performed: false }
        };
      } catch (error) {
        console.error('❌ Failed to fetch users:', error);
        // Return a default response structure on error
        return {
          users: [],
          total: 0,
          filters: { role: null, searchTerm: null, searchBy: 'all' },
          search: { term: null, by: 'all', performed: false }
        };
      }
    },
    enabled: false, // manual refetch control
  });

  const users = usersData?.users || [];
  const totalUsers = usersData?.total || 0;
  const searchInfo = usersData?.search || { term: null, by: 'all', performed: false };

  // Mode bo'yicha ko'rinadigan userlar
  const visibleUsers = useMemo(() => {
    if (mode === 'admins') {
      return users.filter((u) =>
        ['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN'].includes(u.role)
      );
    }
    // default: faqat USER va SELLER
    return users.filter((u) => ['USER', 'SELLER'].includes(u.role));
  }, [users, mode]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserForm) => {
      return usersApi.createAdminUser(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsCreateModalOpen(false);
      setCreateForm({
        email: '',
        password: '',
        role: 'USER',
        firstName: '',
        lastName: '',
        phone: ''
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }: Partial<User> & { id: string }) => {
      return usersApi.updateAdminUser(id, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUser(null);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return usersApi.deleteAdminUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const handleSearch = () => {
    // Set the actual search term from the input
    setSearchTerm(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setSearchBy('all');
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(createForm);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate(editingUser);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(id);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER_ADMIN': return 'bg-purple-100 text-purple-800';
      case 'MANAGER_ADMIN': return 'bg-blue-100 text-blue-800';
      case 'ADMIN': return 'bg-green-100 text-green-800';
      case 'SELLER': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER_ADMIN': return 'Owner Admin';
      case 'MANAGER_ADMIN': return 'Manager Admin';
      case 'ADMIN': return 'Admin';
      case 'SELLER': return 'Seller';
      default: return 'User';
    }
  };

  // Initial load - fetch all users
  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [token]);

  // Refetch when searchTerm or roleFilter changes
  useEffect(() => {
    if (token) {
      refetch();
    }
  }, [searchTerm, roleFilter, token]);

  if (isLoading && !usersData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'admins' ? 'Admin Management' : 'User Management'}
          </h1>
          <p className="text-gray-600">
            {mode === 'admins'
              ? 'Manage admin roles (ADMIN, MANAGER_ADMIN, OWNER_ADMIN)'
              : 'Manage regular users and sellers'}
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 w-full min-w-[400px]"
                  />
                </div>
              </div>
              <Select
                value={searchBy}
                onChange={(value) => setSearchBy(value)}
                options={[
                  { value: 'all', label: 'Search in All Fields' },
                  { value: 'name', label: 'Search by Name' },
                  { value: 'email', label: 'Search by Email' },
                  { value: 'phone', label: 'Search by Phone' }
                ]}
                className="w-56"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={roleFilter}
                onChange={(value) => setRoleFilter(value)}
                options={
                  mode === 'admins'
                    ? [
                        { value: 'all', label: 'All Admin Roles' },
                        { value: 'ADMIN', label: 'Admins' },
                        { value: 'MANAGER_ADMIN', label: 'Managers' },
                        { value: 'OWNER_ADMIN', label: 'Owners' },
                      ]
                    : [
                        { value: 'all', label: 'All Roles' },
                        { value: 'USER', label: 'Users' },
                        { value: 'SELLER', label: 'Sellers' },
                      ]
                }
                className="w-40"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleSearch}
                  disabled={!searchInput.trim() || isRefetching}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isRefetching ? 'Searching...' : 'Search'}
                </Button>
                {(searchInput || searchTerm) && (
                  <Button 
                    variant="outline"
                    onClick={handleClearSearch}
                    disabled={isRefetching}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Search info */}
          {searchInfo.performed && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Search Results:</span> Found {totalUsers} user{totalUsers !== 1 ? 's' : ''}
                  {searchInfo.term && (
                    <> for "<span className="font-semibold">{searchInfo.term}</span>" in {searchInfo.by === 'all' ? 'all fields' : searchInfo.by}</>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearSearch}
                  className="mt-2 sm:mt-0 text-blue-600 hover:text-blue-800"
                >
                  Clear Search
                </Button>
              </div>
            </div>
          )}
          
          {/* Error display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <div className="text-sm text-red-800">
                <span className="font-medium">Error:</span> {error.message}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2 mb-4 sm:mb-0">
              <Users className="w-5 h-5" />
              {mode === 'admins' ? 'Admins' : 'Users'} ({visibleUsers.length})
            </CardTitle>
            <div className="text-sm text-gray-500">
              Showing {visibleUsers.length}{' '}
              {mode === 'admins' ? 'admin(s)' : 'user(s)'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isRefetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-gray-600">Loading users...</span>
            </div>
          ) : visibleUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchInfo.performed ? 'No users found' : 'No users yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchInfo.performed 
                  ? 'Try adjusting your search criteria or clear the search to see all users.'
                  : 'Add your first user by clicking the "Add User" button above.'
                }
              </p>
              {searchInfo.performed && (
                <Button onClick={handleClearSearch} variant="outline">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Contact</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user: User) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user.email
                              }
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Create New User</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Select
              value={createForm.role}
              onChange={(value) => setCreateForm({...createForm, role: value})}
              options={[
                { value: 'USER', label: 'User' },
                { value: 'SELLER', label: 'Seller' },
                { value: 'ADMIN', label: 'Admin' },
                { value: 'MANAGER_ADMIN', label: 'Manager Admin' }
              ]}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <Input
              value={createForm.firstName}
              onChange={(e) => setCreateForm({...createForm, firstName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <Input
              value={createForm.lastName}
              onChange={(e) => setCreateForm({...createForm, lastName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <Input
              value={createForm.phone}
              onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </div>
          </form>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Edit User</h2>
          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={editingUser.email}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <Select
                value={editingUser.role}
                onChange={(value) => setEditingUser({...editingUser, role: value})}
                options={[
                  { value: 'USER', label: 'User' },
                  { value: 'SELLER', label: 'Seller' },
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'MANAGER_ADMIN', label: 'Manager Admin' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <Input
                value={editingUser.firstName || ''}
                onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <Input
                value={editingUser.lastName || ''}
                onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input
                value={editingUser.phone || ''}
                onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
            </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}