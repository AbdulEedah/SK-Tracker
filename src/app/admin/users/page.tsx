'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PdfIndicator } from '@/components/ui/PdfIndicator'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { 
  Users, 
  Plus, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  User as UserIcon
} from 'lucide-react'
import { User } from '@/lib/types'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/useConfirm'

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const confirm = useConfirm()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showUserModal, setShowUserModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    role: 'member' as const
  })

  useEffect(() => {
    fetchUsers()
  }, [currentUser])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      
      const result = await apiClient.getAdminUsers()

      if (result.success && result.data && Array.isArray(result.data)) {
        setUsers(result.data as User[])
      } else {
        console.error('Error fetching users:', result.error)
        toast.error('Failed to load users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
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
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter(user => user.is_active === isActive)
    }

    setFilteredUsers(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setRoleFilter('all')
    setStatusFilter('all')
  }

  const handleCreateUser = async () => {
    try {
      const result = await apiClient.signUp(newUser.email, 'temporary123', newUser.full_name)

      if (result.success) {
        toast.success('User created successfully!')
        toast.info('User will receive an email with login instructions')
        setShowUserModal(false)
        setNewUser({ email: '', full_name: '', role: 'member' })
        fetchUsers()
      } else {
        toast.error('Failed to create user')
      }
    } catch (error) {
      toast.error('Failed to create user')
    }
  }

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const result = await apiClient.updateUserStatus(userId, isActive)

      if (result.success) {
        toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully!`)
        fetchUsers()
      } else {
        toast.error('Failed to update user status')
      }
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      const result = await apiClient.updateUserRole(userId, role)

      if (result.success) {
        toast.success('User role updated successfully!')
        fetchUsers()
      } else {
        toast.error('Failed to update user role')
      }
    } catch (error) {
      toast.error('Failed to update user role')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId)
    const userName = userToDelete?.full_name || userToDelete?.email || 'this user'
    
    confirm.confirm(
      async () => {
        try {
          const result = await apiClient.deleteUser(userId)

          if (result.success) {
            toast.success('User deleted successfully!')
            fetchUsers()
          } else {
            toast.error('Failed to delete user')
          }
        } catch (error) {
          toast.error('Failed to delete user')
          throw error
        }
      },
      {
        title: 'Delete User',
        message: `Are you sure you want to delete ${userName}? This action cannot be undone.`,
        confirmText: 'Delete User',
        cancelText: 'Cancel',
        variant: 'danger'
      }
    )
  }

  const handleRoleChange = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin'
    const userToUpdate = users.find(u => u.id === userId)
    const userName = userToUpdate?.full_name || userToUpdate?.email || 'this user'
    
    confirm.confirm(
      async () => {
        await handleUpdateUserRole(userId, newRole)
      },
      {
        title: 'Change User Role',
        message: `Change ${userName}'s role from ${currentRole} to ${newRole}?`,
        confirmText: 'Change Role',
        cancelText: 'Cancel',
        variant: 'warning'
      }
    )
  }

  const UserCard = ({ user }: { user: User }) => (
    <Card className="border-2 border-black hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-black font-['Work_Sans'] mb-2">
              {user.full_name}
            </CardTitle>
            <p className="text-gray-600 text-sm font-['Work_Sans']">{user.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border-2 border-black ${
                user.role === 'admin' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-[#00A86B] text-black'
              }`}>
                {user.role === 'admin' ? (
                  <>
                    <Shield className="h-3 w-3 inline mr-1" />
                    Admin
                  </>
                ) : (
                  <>
                    <UserIcon className="h-3 w-3 inline mr-1" />
                    Member
                  </>
                )}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border-2 border-black ${
                user.is_active 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-xs text-gray-500 font-['Work_Sans']">
            Joined: {new Date(user.created_at).toLocaleDateString()}
          </div>
          
          {/* PDF Upload Indicator */}
          <div className="flex items-center">
            <PdfIndicator userId={user.id} size="sm" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedUser(user)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            <div className="flex space-x-1">
              {user.id !== currentUser?.id && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleUpdateUserStatus(user.id, !user.is_active)}
                    className={user.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRoleChange(user.id, user.role)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ProtectedRoute adminOnly>
      <AppLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-medium text-black font-display mb-2 text-2xl page-title">
                User Management
              </h1>
              <p className="text-gray-600 font-sans font-medium text-sm">
                Manage user accounts, roles, and permissions.
              </p>
            </div>
            <Button
              onClick={() => setShowUserModal(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Search and Filters */}
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
                  <option value="inactive">Inactive</option>
                </select>

                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={clearFilters}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
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

        {/* Add User Modal */}
        <Modal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          title="Add New User"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-full-name" className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                Full Name
              </Label>
              <Input
                id="user-full-name"
                value={newUser.full_name}
                onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter user's full name"
              />
            </div>
            
            <div>
              <Label htmlFor="user-email" className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                Email Address
              </Label>
              <Input
                id="user-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter user's email"
              />
            </div>
            
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

        {/* User Details Modal */}
        {selectedUser && (
          <Modal
            isOpen={!!selectedUser}
            onClose={() => setSelectedUser(null)}
            title="User Details"
            size="lg"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-3 font-['Work_Sans']">
                  {selectedUser.full_name}
                </h3>
                <p className="text-gray-600 font-['Work_Sans']">{selectedUser.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Role:</span>
                  <span className="ml-2 capitalize font-['Work_Sans']">{selectedUser.role}</span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Status:</span>
                  <span className="ml-2 font-['Work_Sans']">
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Documents:</span>
                  <div className="ml-2">
                    <PdfIndicator userId={selectedUser.id} size="sm" />
                  </div>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Joined:</span>
                  <span className="ml-2 font-['Work_Sans']">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Last Updated:</span>
                  <span className="ml-2 font-['Work_Sans']">
                    {new Date(selectedUser.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </Button>
                {selectedUser.id !== currentUser?.id && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleRoleChange(selectedUser.id, selectedUser.role)
                        setSelectedUser(null)
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Change Role
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleUpdateUserStatus(selectedUser.id, !selectedUser.is_active)
                        setSelectedUser(null)
                      }}
                      className={selectedUser.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {selectedUser.is_active ? (
                        <>
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirm.isOpen}
          onClose={confirm.handleCancel}
          onConfirm={confirm.handleConfirm}
          title={confirm.title}
          message={confirm.message}
          confirmText={confirm.confirmText}
          cancelText={confirm.cancelText}
          variant={confirm.variant}
          loading={confirm.loading}
        />
      </AppLayout>
    </ProtectedRoute>
  )
}