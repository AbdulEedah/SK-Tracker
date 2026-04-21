'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  Users, 
  UserPlus, 
  Settings, 
  Shield,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  Phone,
  Crown,
  User
} from 'lucide-react'
import { User as UserType } from '@/lib/types'

interface AdminUser extends UserType {
  last_login?: string
  login_count?: number
}
import { apiClient, mockUsers } from '@/lib/api'
import { toast } from 'sonner'

export default function AdminUsersPage() {
  const { user: currentUser, isOffline } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    role: 'member' as 'admin' | 'member'
  })

  // Enhanced mock users data with more details
  const mockUsers: AdminUser[] = [
    {
      id: 'admin1',
      email: 'admin@startupkano.com',
      full_name: 'Admin User',
      phone_number: '+234-800-123-4567',
      role: 'admin',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      last_login: '2024-04-20T08:30:00Z',
      login_count: 45
    },
    {
      id: 'user1',
      email: 'john@startupkano.com',
      full_name: 'John Doe',
      phone_number: '+234-800-234-5678',
      role: 'member',
      is_active: true,
      created_at: '2024-01-15T10:00:00Z',
      last_login: '2024-04-19T16:45:00Z',
      login_count: 23
    },
    {
      id: 'user2',
      email: 'jane@startupkano.com',
      full_name: 'Jane Smith',
      phone_number: '+234-800-345-6789',
      role: 'member',
      is_active: true,
      created_at: '2024-02-01T14:30:00Z',
      last_login: '2024-04-18T12:20:00Z',
      login_count: 18
    },
    {
      id: 'user3',
      email: 'mike@startupkano.com',
      full_name: 'Mike Johnson',
      phone_number: '+234-800-456-7890',
      role: 'member',
      is_active: false,
      created_at: '2024-02-15T09:15:00Z',
      last_login: '2024-04-10T14:30:00Z',
      login_count: 8
    },
    {
      id: 'user4',
      email: 'sarah@startupkano.com',
      full_name: 'Sarah Wilson',
      phone_number: '+234-800-567-8901',
      role: 'member',
      is_active: false,
      created_at: '2024-03-01T11:45:00Z',
      last_login: '2024-03-15T09:00:00Z',
      login_count: 3
    }
  ]

  useEffect(() => {
    fetchUsers()
  }, [currentUser, isOffline])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      
      if (isOffline) {
        setUsers(mockUsers as UserType[])
      } else {
        const result = await apiClient.getUsers()

        if (result.success && result.data && Array.isArray(result.data)) {
          setUsers(result.data as UserType[])
        } else {
          console.error('Error fetching users:', result.error)
          toast.error('Failed to load users')
          setUsers(mockUsers as UserType[]) // Fallback to mock data
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
      setUsers(mockUsers) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone_number && user.phone_number.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => user.is_active)
      } else {
        filtered = filtered.filter(user => !user.is_active)
      }
    }

    setFilteredUsers(filtered)
  }

  const handleCreateUser = async () => {
    try {
      if (isOffline) {
        toast.error('Cannot create users in offline mode')
        return
      }

      // In a real implementation, you would create the user via API
      // For now, we'll simulate user creation
      toast.success('User created successfully! (Simulated in offline mode)')
      toast.info('User will receive an email with login instructions')
      setShowUserModal(false)
      setNewUser({ email: '', full_name: '', phone_number: '', role: 'member' })
    } catch (error) {
      toast.error('Failed to create user')
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      if (isOffline) {
        toast.error('Cannot update users in offline mode')
        return
      }

      const result = await apiClient.updateUser(editingUser.id, {
        full_name: newUser.full_name,
        phone_number: newUser.phone_number,
        role: newUser.role
      })

      if (result.success) {
        toast.success('User updated successfully!')
        setShowEditModal(false)
        setEditingUser(null)
        fetchUsers()
      } else {
        toast.error('Failed to update user')
      }
    } catch (error) {
      toast.error('Failed to update user')
    }
  }

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isOffline) {
        toast.error('Cannot update user status in offline mode')
        return
      }

      const result = await apiClient.updateUserStatus(userId, status === 'active')

      if (result.success) {
        const statusText = status === 'suspended' ? 'suspended' : status === 'inactive' ? 'deactivated' : 'activated'
        toast.success(`User ${statusText} successfully!`)
        fetchUsers()
      } else {
        toast.error('Failed to update user status')
      }
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return

    try {
      if (isOffline) {
        toast.error('Cannot delete users in offline mode')
        return
      }

      const result = await apiClient.deleteUser(userId)

      if (result.success) {
        toast.success('User deleted successfully!')
        fetchUsers()
      } else {
        toast.error('Failed to delete user')
      }
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const openEditModal = (user: UserType) => {
    setEditingUser(user)
    setNewUser({
      email: user.email,
      full_name: user.full_name,
      phone_number: user.phone_number || '',
      role: user.role
    })
    setShowEditModal(true)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setRoleFilter('all')
    setStatusFilter('all')
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? CheckCircle : XCircle
  }

  const UserCard = ({ user }: { user: AdminUser }) => {
    const StatusIcon = getStatusIcon(user.is_active)
    
    return (
      <Card className="border-2 border-black hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#00A86B] rounded-full flex items-center justify-center border-2 border-black">
                {user.role === 'admin' ? (
                  <Crown className="h-6 w-6 text-black" />
                ) : (
                  <User className="h-6 w-6 text-black" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-black font-['Work_Sans']">
                  {user.full_name}
                </CardTitle>
                <p className="text-sm text-gray-600 font-['Work_Sans']">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border-2 border-black ${
                user.role === 'admin' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {user.role}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border-2 border-black ${getStatusColor(user.is_active)}`}>
                <StatusIcon className="h-3 w-3 inline mr-1" />
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="font-['Work_Sans']">{user.phone_number || 'Not provided'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-['Work_Sans']">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {user.last_login && (
              <div className="text-sm text-gray-600">
                <span className="font-['Work_Sans']">
                  Last login: {new Date(user.last_login).toLocaleDateString()} 
                  {user.login_count && ` (${user.login_count} logins)`}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(user)}
                  className="text-black hover:text-[#00A86B]"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(user)}
                  className="text-black hover:text-[#00A86B]"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="flex space-x-2">
                {user.is_active ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateUserStatus(user.id, false)}
                    className="text-red-600 hover:text-red-700 hover:border-red-600"
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Suspend
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateUserStatus(user.id, true)}
                    className="text-green-600 hover:text-green-700 hover:border-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Activate
                  </Button>
                )}
                {user.id !== currentUser?.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700 hover:border-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <ProtectedRoute adminOnly>
      <AppLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-normal text-black font-['Reem_Kufi'] mb-2" style={{ fontSize: '40px' }}>
                User Management
              </h1>
              <p className="text-gray-600 font-['Work_Sans']">
                Manage user accounts, roles, and permissions across the platform.
              </p>
            </div>
            <Button
              onClick={() => setShowUserModal(true)}
              className="flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Total Users</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-[#00A86B]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Active Users</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">
                      {users.filter(u => u.is_active).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Admins</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">
                      {users.filter(u => u.role === 'admin').length}
                    </p>
                  </div>
                  <Crown className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Suspended</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">
                      {users.filter(u => !u.is_active).length}
                    </p>
                  </div>
                  <Ban className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black placeholder-gray-500 focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                  />
                </div>
                
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="member">Members</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>

                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={clearFilters}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black font-['Work_Sans']">
                Users ({filteredUsers.length})
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-48 border-2 border-gray-300"></div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <Card className="border-2 border-black">
                <CardContent className="text-center py-16">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-['Work_Sans'] text-lg mb-4">
                    {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                      ? 'No users match your filters' 
                      : 'No users found'
                    }
                  </p>
                  {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
                    <Button onClick={() => setShowUserModal(true)}>
                      Add Your First User
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Create User Modal */}
        <Modal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          title="Add New User"
        >
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={newUser.full_name}
              onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter user's full name"
            />
            
            <Input
              label="Email Address"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter user's email"
            />
            
            <Input
              label="Phone Number"
              value={newUser.phone_number}
              onChange={(e) => setNewUser(prev => ({ ...prev, phone_number: e.target.value }))}
              placeholder="Enter user's phone number"
            />
            
            <div>
              <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                Role
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as any }))}
                className="block w-full px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-blue-700 font-['Work_Sans']">
                <strong>Note:</strong> The user will receive an email with login instructions and a temporary password.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowUserModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={!newUser.full_name || !newUser.email}
              >
                Create User
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit User"
        >
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={newUser.full_name}
              onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter user's full name"
            />
            
            <Input
              label="Email Address"
              type="email"
              value={newUser.email}
              disabled
              className="bg-gray-100"
            />
            
            <Input
              label="Phone Number"
              value={newUser.phone_number}
              onChange={(e) => setNewUser(prev => ({ ...prev, phone_number: e.target.value }))}
              placeholder="Enter user's phone number"
            />
            
            <div>
              <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                Role
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as any }))}
                className="block w-full px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={!newUser.full_name}
              >
                Update User
              </Button>
            </div>
          </div>
        </Modal>

        {/* User Details Modal */}
        {selectedUser && (
          <Modal
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            title="User Details"
            size="lg"
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[#00A86B] rounded-full flex items-center justify-center border-2 border-black">
                  {selectedUser.role === 'admin' ? (
                    <Crown className="h-8 w-8 text-black" />
                  ) : (
                    <User className="h-8 w-8 text-black" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-black font-['Work_Sans']">
                    {selectedUser.full_name}
                  </h3>
                  <p className="text-gray-600 font-['Work_Sans']">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border-2 border-black ${
                      selectedUser.role === 'admin' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {selectedUser.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border-2 border-black ${getStatusColor(selectedUser.is_active)}`}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-black mb-3 font-['Work_Sans']">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="font-['Work_Sans']">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="font-['Work_Sans']">{selectedUser.phone_number || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-black mb-3 font-['Work_Sans']">Account Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-['Work_Sans']">
                        Joined {new Date(selectedUser.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedUser.last_login && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        <span className="font-['Work_Sans']">
                          Last login {new Date(selectedUser.last_login).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedUser.login_count && (
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-['Work_Sans']">
                          {selectedUser.login_count} total logins
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setSelectedUser(null)
                    openEditModal(selectedUser)
                  }}
                >
                  Edit User
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AppLayout>
    </ProtectedRoute>
  )
}