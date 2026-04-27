'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { TaskCard } from '@/components/dashboard/TaskCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  CheckSquare, 
  Plus,
  Filter,
  Search,
  Users,
  Eye,
  Check,
  X
} from 'lucide-react'
import { Task, User } from '@/lib/types'
import { apiClient, mockTasks, mockUsers } from '@/lib/api'
import { toast } from 'sonner'

export default function AdminTasksPage() {
  const { user: currentUser, isOffline } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    assigned_to: ''
  })

  useEffect(() => {
    fetchData()
  }, [currentUser, isOffline])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchTerm, statusFilter, userFilter])

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

  const filterTasks = () => {
    let filtered = tasks

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(task => task.assigned_to === userFilter)
    }

    setFilteredTasks(filtered)
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
        assigned_to: newTask.assigned_to,
        type: 'assigned'
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

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.full_name || 'Unknown User'
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setUserFilter('all')
  }

  return (
    <ProtectedRoute adminOnly>
      <AppLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-normal text-black font-['Reem_Kufi'] mb-2" style={{ fontSize: '40px' }}>
                Manage Tasks
              </h1>
              <p className="text-gray-600 font-['Work_Sans']">
                Create, assign, and manage all tasks across your organization.
              </p>
            </div>
            <Button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Task
            </Button>
          </div>

          {/* Filters */}
          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black placeholder-gray-500 focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="revision_requested">Revision Requested</option>
                </select>

                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                >
                  <option value="all">All Users</option>
                  {users.filter(u => u.role === 'member').map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>

                <Button variant="outline" onClick={clearFilters} className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black font-['Work_Sans']">
                All Tasks ({filteredTasks.length})
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
            ) : filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map(task => (
                  <Card key={task.id} className="border-2 border-black hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <TaskCard
                        task={task}
                        onView={setSelectedTask}
                        showActions={false}
                      />
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm mb-3">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-['Work_Sans']">Assigned to: {getUserName(task.assigned_to)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTask(task)}
                            className="text-black hover:text-[#00A86B]"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          {task.status === 'completed' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcknowledgeTask(task.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Acknowledge
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-black">
                <CardContent className="text-center py-16">
                  <CheckSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-['Work_Sans'] text-lg mb-4">
                    {searchTerm || statusFilter !== 'all' || userFilter !== 'all' 
                      ? 'No tasks match your filters' 
                      : 'No tasks found'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && userFilter === 'all' && (
                    <Button onClick={() => setShowTaskModal(true)}>
                      Create Your First Task
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
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
                  <span className="font-medium text-black font-['Work_Sans']">Status:</span>
                  <span className="ml-2 capitalize font-['Work_Sans']">{selectedTask.status.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Created:</span>
                  <span className="ml-2 font-['Work_Sans']">{new Date(selectedTask.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {selectedTask.revision_notes && (
                <div className="bg-black border-2 border-[#00A86B] rounded-md p-4">
                  <h4 className="text-sm font-medium text-[#00A86B] mb-2 font-['Work_Sans']">Previous Revision Notes:</h4>
                  <p className="text-sm text-white font-['Work_Sans']">{selectedTask.revision_notes}</p>
                </div>
              )}

              {selectedTask.status === 'completed' && (
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
              )}
            </div>
          </Modal>
        )}
      </AppLayout>
    </ProtectedRoute>
  )
}