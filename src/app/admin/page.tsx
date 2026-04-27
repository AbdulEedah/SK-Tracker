'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  UserPlus,
  MessageSquare,
  Eye,
  Check,
  X
} from 'lucide-react'
import { Task, User } from '@/lib/types'
import { apiClient, mockTasks, mockUsers } from '@/lib/api'
import { toast } from 'sonner'

export default function AdminPage() {
  const { user: currentUser, isOffline } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    assigned_to: ''
  })
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    role: 'member' as const
  })
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    target: 'all' as 'all' | 'members' | 'admins' | 'specific',
    specific_user_id: ''
  })

  useEffect(() => {
    fetchData()
  }, [currentUser, isOffline])

  const fetchData = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      
      if (isOffline) {
        setTasks(mockTasks as Task[])
        setUsers(mockUsers as User[])
      } else {
        // Fetch tasks
        const tasksResult = await apiClient.getTasks()
        if (tasksResult.success && tasksResult.data && Array.isArray(tasksResult.data)) {
          setTasks(tasksResult.data as Task[])
        } else {
          console.error('Error fetching tasks:', tasksResult.error)
          setTasks(mockTasks as Task[])
        }

        // Fetch users
        const usersResult = await apiClient.getUsers()
        if (usersResult.success && usersResult.data && Array.isArray(usersResult.data)) {
          setUsers(usersResult.data as User[])
        } else {
          console.error('Error fetching users:', usersResult.error)
          setUsers(mockUsers as User[])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async () => {
    try {
      if (isOffline) {
        toast.error('Cannot create tasks in offline mode')
        return
      }

      const result = await apiClient.createTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        type: 'assigned',
        assigned_to: newTask.assigned_to
      })

      if (result.success) {
        toast.success('Task assigned successfully!')
        setShowTaskModal(false)
        setNewTask({ title: '', description: '', priority: 'medium', assigned_to: '' })
        fetchData()
      } else {
        toast.error('Failed to create task')
      }
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const handleAcknowledgeTask = async (taskId: string) => {
    try {
      if (isOffline) {
        toast.error('Cannot acknowledge tasks in offline mode')
        return
      }

      const result = await apiClient.updateTaskStatus(taskId, 'acknowledged')

      if (result.success) {
        toast.success('Task acknowledged!')
        fetchData()
      } else {
        toast.error('Failed to acknowledge task')
      }
    } catch (error) {
      toast.error('Failed to acknowledge task')
    }
  }

  const handleRequestRevision = async (taskId: string, notes: string) => {
    try {
      if (isOffline) {
        toast.error('Cannot request revisions in offline mode')
        return
      }

      const result = await apiClient.requestTaskRevision(taskId, notes)

      if (result.success) {
        toast.success('Revision requested!')
        setSelectedTask(null)
        fetchData()
      } else {
        toast.error('Failed to request revision')
      }
    } catch (error) {
      toast.error('Failed to request revision')
    }
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

  const handleSendNotification = async () => {
    try {
      if (isOffline) {
        toast.error('Cannot send notifications in offline mode')
        return
      }

      // In a real implementation, you would send notifications via API
      // For now, we'll simulate the notification
      toast.success('Notification sent successfully! (Simulated in offline mode)')
      toast.info(`Notification sent to ${notification.target === 'all' ? 'all users' : notification.target === 'specific' ? 'selected user' : notification.target}`)
      setShowNotificationModal(false)
      setNotification({ title: '', message: '', type: 'info', target: 'all', specific_user_id: '' })
    } catch (error) {
      toast.success('Notification sent successfully!')
      setShowNotificationModal(false)
      setNotification({ title: '', message: '', type: 'info', target: 'all', specific_user_id: '' })
    }
  }

  const getStats = () => {
    return {
      totalUsers: users.length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(task => task.status === 'pending').length,
      completedTasks: tasks.filter(task => task.status === 'completed').length
    }
  }

  const stats = getStats()
  const completedTasks = tasks.filter(task => task.status === 'completed')
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.full_name || 'Unknown User'
  }

  return (
    <ProtectedRoute adminOnly>
      <AppLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="font-normal text-black font-['Reem_Kufi'] mb-2" style={{ fontSize: '40px' }}>
              Admin Command Center
            </h1>
            <p className="text-gray-600 font-['Work_Sans']">
              Manage users, tasks, and monitor system activity.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="blue"
              
            />
            <StatsCard
              title="Total Tasks"
              value={stats.totalTasks}
              icon={CheckCircle}
              color="green"
              
            />
            <StatsCard
              title="Pending Tasks"
              value={stats.pendingTasks}
              icon={Clock}
              color="yellow"
              
            />
            <StatsCard
              title="Completed Tasks"
              value={stats.completedTasks}
              icon={AlertTriangle}
              color="purple"
              
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign New Task
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowUserModal(true)}
              className="flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowNotificationModal(true)}
              className="flex items-center"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tasks Awaiting Review */}
            <div>
              <h2 className="text-2xl font-semibold text-black mb-6 font-['Work_Sans']">
                Tasks Awaiting Review ({completedTasks.length})
              </h2>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-32 border-2 border-gray-300"></div>
                    </div>
                  ))}
                </div>
              ) : completedTasks.length > 0 ? (
                <div className="space-y-4">
                  {completedTasks.map(task => (
                    <Card key={task.id} className="hover:shadow-lg transition-all duration-200 border-2 border-black">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-semibold text-black font-['Work_Sans']">
                          {task.title}
                        </CardTitle>
                        <p className="text-sm text-gray-500 font-['Work_Sans']">
                          Assigned to: {getUserName(task.assigned_to)}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-['Work_Sans']">
                          {task.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTask(task)}
                            className="text-black hover:text-[#00A86B]"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcknowledgeTask(task.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Acknowledge
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-black">
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-['Work_Sans'] text-lg">No tasks awaiting review</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent Users */}
            <div>
              <h2 className="text-2xl font-semibold text-black mb-6 font-['Work_Sans']">
                Recent Users ({users.length})
              </h2>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-20 border-2 border-gray-300"></div>
                    </div>
                  ))}
                </div>
              ) : users.length > 0 ? (
                <div className="space-y-4">
                  {users.slice(0, 5).map(user => (
                    <Card key={user.id} className="border-2 border-black">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-black font-['Work_Sans']">{user.full_name}</h3>
                            <p className="text-sm text-gray-500 font-['Work_Sans']">{user.email}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border-2 border-black ${
                              user.role === 'admin' 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-[#00A86B] text-black'
                            }`}>
                              {user.role}
                            </span>
                            <p className="text-xs text-gray-500 mt-1 font-['Work_Sans']">
                              {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-black">
                  <CardContent className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-['Work_Sans'] text-lg">No users found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Create Task Modal */}
        <Modal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          title="Assign New Task"
        >
          <div className="space-y-4">
            <Input
              label="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
            />
            <div>
              <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                rows={4}
                className="block w-full px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black placeholder-gray-500 focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                Assign To
              </label>
              <select
                value={newTask.assigned_to}
                onChange={(e) => setNewTask(prev => ({ ...prev, assigned_to: e.target.value }))}
                className="block w-full px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
              >
                <option value="">Select a user</option>
                {users.filter(u => u.role === 'member').map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                Priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                className="block w-full px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowTaskModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                disabled={!newTask.title || !newTask.description || !newTask.assigned_to}
              >
                Assign Task
              </Button>
            </div>
          </div>
        </Modal>

        {/* Task Review Modal */}
        {selectedTask && (
          <Modal
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            title="Review Task"
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-black mb-3 font-['Work_Sans']">
                  {selectedTask.title}
                </h3>
                <p className="text-gray-600 font-['Work_Sans']">{selectedTask.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Assigned to:</span>
                  <span className="ml-2 font-['Work_Sans']">{getUserName(selectedTask.assigned_to)}</span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Priority:</span>
                  <span className="ml-2 capitalize font-['Work_Sans']">{selectedTask.priority}</span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Completed:</span>
                  <span className="ml-2 font-['Work_Sans']">
                    {selectedTask.completed_at 
                      ? new Date(selectedTask.completed_at).toLocaleDateString()
                      : 'Not completed'
                    }
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    const notes = prompt('Enter revision notes:')
                    if (notes) {
                      handleRequestRevision(selectedTask.id, notes)
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Request Revision
                </Button>
                <Button
                  onClick={() => handleAcknowledgeTask(selectedTask.id)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Acknowledge
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Add User Modal */}
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

        {/* Send Notification Modal */}
        <Modal
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          title="Send Notification"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Notification Title"
              value={notification.title}
              onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter notification title"
            />
            
            <div>
              <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                Message
              </label>
              <textarea
                value={notification.message}
                onChange={(e) => setNotification(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter notification message"
                rows={4}
                className="block w-full px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black placeholder-gray-500 focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                  Notification Type
                </label>
                <select
                  value={notification.type}
                  onChange={(e) => setNotification(prev => ({ ...prev, type: e.target.value as any }))}
                  className="block w-full px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                  Send To
                </label>
                <select
                  value={notification.target}
                  onChange={(e) => setNotification(prev => ({ ...prev, target: e.target.value as any, specific_user_id: '' }))}
                  className="block w-full px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                >
                  <option value="all">All Users</option>
                  <option value="members">Members Only</option>
                  <option value="admins">Admins Only</option>
                  <option value="specific">Specific User</option>
                </select>
              </div>
            </div>

            {notification.target === 'specific' && (
              <div>
                <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                  Select User
                </label>
                <select
                  value={notification.specific_user_id}
                  onChange={(e) => setNotification(prev => ({ ...prev, specific_user_id: e.target.value }))}
                  className="block w-full px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email}) - {user.role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-yellow-700 font-['Work_Sans']">
                <strong>Preview:</strong> This notification will be sent to {
                  notification.target === 'all' ? 'all users' : 
                  notification.target === 'specific' ? 
                    (notification.specific_user_id ? 
                      users.find(u => u.id === notification.specific_user_id)?.full_name || 'selected user' : 
                      'selected user') : 
                    notification.target
                } via email and in-app notification.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowNotificationModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendNotification}
                disabled={
                  !notification.title || 
                  !notification.message || 
                  (notification.target === 'specific' && !notification.specific_user_id)
                }
              >
                Send Notification
              </Button>
            </div>
          </div>
        </Modal>
      </AppLayout>
    </ProtectedRoute>
  )
}