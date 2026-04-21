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
  Search
} from 'lucide-react'
import { Task } from '@/lib/types'
import { apiClient, mockTasks } from '@/lib/api'
import { toast } from 'sonner'

export default function TasksPage() {
  const { user, isOffline } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const
  })

  useEffect(() => {
    fetchTasks()
  }, [user, isOffline])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchTerm, statusFilter, priorityFilter])

  const fetchTasks = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      if (isOffline) {
        const userTasks = mockTasks.filter(task => 
          task.assigned_to === user.id || task.assigned_by === user.id
        )
        setTasks(userTasks as Task[])
      } else {
        const result = await apiClient.getMyTasks()

        if (result.success && result.data && Array.isArray(result.data)) {
          setTasks(result.data as Task[])
        } else {
          console.error('Error fetching tasks:', result.error)
          toast.error('Failed to load tasks')
          setTasks(mockTasks as Task[]) // Fallback to mock data
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to load tasks')
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

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter)
    }

    setFilteredTasks(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
  }

  const handleAcceptTask = async (taskId: string) => {
    try {
      if (isOffline) {
        toast.error('Cannot accept tasks in offline mode')
        return
      }

      const result = await apiClient.acceptTask(taskId)

      if (result.success) {
        toast.success('Task accepted successfully!')
        fetchTasks()
      } else {
        toast.error('Failed to accept task')
      }
    } catch (error) {
      toast.error('Failed to accept task')
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      if (isOffline) {
        toast.error('Cannot complete tasks in offline mode')
        return
      }

      const result = await apiClient.updateTaskStatus(taskId, 'completed')

      if (result.success) {
        toast.success('Task marked as complete!')
        fetchTasks()
      } else {
        toast.error('Failed to complete task')
      }
    } catch (error) {
      toast.error('Failed to complete task')
    }
  }

  const handleCreatePersonalTask = async () => {
    try {
      if (isOffline) {
        toast.error('Cannot create tasks in offline mode')
        return
      }

      const result = await apiClient.createTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        type: 'personal'
      })

      if (result.success) {
        toast.success('Personal task created!')
        setShowTaskModal(false)
        setNewTask({ title: '', description: '', priority: 'medium' })
        fetchTasks()
      } else {
        toast.error('Failed to create task')
      }
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-normal text-black font-['Reem_Kufi'] mb-2" style={{ fontSize: '40px' }}>
                My Tasks
              </h1>
              <p className="text-gray-600 font-['Work_Sans']">
                Manage all your assigned and personal tasks in one place.
              </p>
            </div>
            <Button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>

          {/* Filters */}
          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
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
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
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

          {/* Tasks Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black font-['Work_Sans']">
                Tasks ({filteredTasks.length})
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
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAccept={handleAcceptTask}
                    onComplete={handleCompleteTask}
                    onView={setSelectedTask}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-2 border-black">
                <CardContent className="text-center py-16">
                  <CheckSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-['Work_Sans'] text-lg mb-4">
                    {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                      ? 'No tasks match your filters' 
                      : 'No tasks found'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
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
          title="Create Personal Task"
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
                onClick={handleCreatePersonalTask}
                disabled={!newTask.title || !newTask.description}
              >
                Create Task
              </Button>
            </div>
          </div>
        </Modal>

        {/* Task Detail Modal */}
        {selectedTask && (
          <Modal
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            title="Task Details"
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
                  <span className="font-medium text-black font-['Work_Sans']">Status:</span>
                  <span className="ml-2 capitalize font-['Work_Sans']">{selectedTask.status.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Priority:</span>
                  <span className="ml-2 capitalize font-['Work_Sans']">{selectedTask.priority}</span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Type:</span>
                  <span className="ml-2 capitalize font-['Work_Sans']">{selectedTask.type}</span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Created:</span>
                  <span className="ml-2 font-['Work_Sans']">{new Date(selectedTask.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {selectedTask.revision_notes && (
                <div className="bg-black border-2 border-[#00A86B] rounded-md p-4">
                  <h4 className="text-sm font-medium text-[#00A86B] mb-2 font-['Work_Sans']">Revision Notes:</h4>
                  <p className="text-sm text-white font-['Work_Sans']">{selectedTask.revision_notes}</p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AppLayout>
    </ProtectedRoute>
  )
}