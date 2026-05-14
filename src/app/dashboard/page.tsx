'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { TaskCard } from '@/components/dashboard/TaskCard'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Target,
  Plus,
  FileText,
  Calendar,
  Upload,
  X,
  Paperclip,
  CheckSquare
} from 'lucide-react'
import { Task } from '@/lib/types'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const
  })
  const [newReport, setNewReport] = useState({
    title: '',
    content: '',
    week_end: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showTasksModal, setShowTasksModal] = useState(false)
  const [showMeetingsModal, setShowMeetingsModal] = useState(false)
  const [showEventsModal, setShowEventsModal] = useState(false)
  const [showReportsListModal, setShowReportsListModal] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [meetings, setMeetings] = useState<any[]>([])
  const [meetingsLoading, setMeetingsLoading] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)

  // Redirect admin users to admin panel
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin')
      return
    }
  }, [user, router])

  useEffect(() => {
    fetchTasks()
  }, [user])

  const fetchTasks = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Fetch from API
      const result = await apiClient.getMyTasks()

      if (result.success && result.data && Array.isArray(result.data)) {
        setTasks(result.data)
      } else {
        const errorMessage = result.error?.message || result.error || 'Unknown error occurred'
        console.error('Error fetching tasks:', errorMessage)
        toast.error(`Failed to load tasks: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred'
      toast.error(`Failed to load tasks: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptTask = async (taskId: string) => {
    try {
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

  const handleSubmitReport = async () => {
    try {
      setUploading(true)
      
      let attachmentUrl = null

      // Upload file if selected
      if (selectedFile) {
        const uploadResult = await apiClient.uploadReportAttachment(selectedFile)
        
        if (uploadResult.success) {
          attachmentUrl = uploadResult.data.file_url
        } else {
          toast.error('Failed to upload attachment')
          return
        }
      }

      // Calculate week start from week end
      const weekEnd = new Date(newReport.week_end)
      const weekStart = new Date(weekEnd)
      weekStart.setDate(weekEnd.getDate() - 6)

      const result = await apiClient.createReport({
        title: newReport.title,
        content: newReport.content,
        week_start: weekStart.toISOString().split('T')[0],
        week_end: newReport.week_end,
        attachment_url: attachmentUrl
      })

      if (result.success) {
        toast.success('Weekly report submitted successfully!')
        toast.info('Your report has been sent to admin for review', {
          duration: 5000,
        })
        setShowReportModal(false)
        setNewReport({ title: '', content: '', week_end: '' })
        setSelectedFile(null)
      } else {
        toast.error('Failed to submit report')
      }
    } catch (error) {
      toast.error('Failed to submit report')
    } finally {
      setUploading(false)
    }
  }

  const fetchReports = async () => {
    if (!user) return

    try {
      setReportsLoading(true)
      const result = await apiClient.getMyReports()

      if (result.success && result.data) {
        // Handle nested response structure
        const responseData = result.data as any
        const reportsData = responseData.reports || responseData
        if (Array.isArray(reportsData)) {
          setReports(reportsData)
        } else {
          console.error('Unexpected reports data structure:', result.data)
          toast.error('Failed to load reports')
        }
      } else {
        console.error('Error fetching reports:', result.error)
        toast.error('Failed to load reports')
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setReportsLoading(false)
    }
  }

  const handleOpenReportsList = () => {
    setShowReportsListModal(true)
    fetchReports()
  }

  const fetchMeetings = async () => {
    if (!user) return

    try {
      setMeetingsLoading(true)
      const result = await apiClient.getMyMeetings()

      if (result.success && result.data && Array.isArray(result.data)) {
        setMeetings(result.data)
      } else {
        console.error('Error fetching meetings:', result.error)
        toast.error('Failed to load meetings')
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
      toast.error('Failed to load meetings')
    } finally {
      setMeetingsLoading(false)
    }
  }

  const handleOpenMeetings = () => {
    setShowMeetingsModal(true)
    fetchMeetings()
  }

  const fetchEvents = async () => {
    if (!user) return

    try {
      setEventsLoading(true)
      const result = await apiClient.getEvents()

      if (result.success && result.data && Array.isArray(result.data)) {
        setEvents(result.data)
      } else {
        console.error('Error fetching events:', result.error)
        toast.error('Failed to load events')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setEventsLoading(false)
    }
  }

  const handleOpenEvents = () => {
    setShowEventsModal(true)
    fetchEvents()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed')
      return
    }

    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    toast.success('PDF file selected successfully')
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
  }

  const getTaskStats = () => {
    const assignedTasks = tasks.filter(task => task.type === 'assigned' && task.assignee_id === user?.id)
    const personalTasks = tasks.filter(task => task.type === 'personal')
    
    return {
      active: tasks.filter(task => ['pending', 'accepted', 'in_progress'].includes(task.status)).length,
      pending: tasks.filter(task => task.status === 'pending').length,
      acknowledged: tasks.filter(task => task.status === 'acknowledged').length,
      total: tasks.length
    }
  }

  const stats = getTaskStats()
  const assignedTasks = tasks.filter(task => task.type === 'assigned' && task.assignee_id === user?.id)
  const personalTasks = tasks.filter(task => task.type === 'personal')

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-medium text-gray-800 font-display mb-2 text-2xl header-title">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 font-sans font-medium text-sm">
              Here's an overview of your tasks and progress.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Active Tasks"
              value={stats.active}
              icon={Clock}
              color="blue"
             
            />
            <StatsCard
              title="Pending Review"
              value={stats.pending}
              icon={AlertTriangle}
              color="yellow"
             
            />
            <StatsCard
              title="Acknowledged"
              value={stats.acknowledged}
              icon={CheckCircle}
              color="green"
              
            />
            <StatsCard
              title="Total Tasks"
              value={stats.total}
              icon={Target}
              color="purple"
              
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center justify-center h-12"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Personal Task
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowReportModal(true)}
              className="flex items-center justify-center h-12"
            >
              <FileText className="h-4 w-4 mr-2" />
              Submit Weekly Report
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowTasksModal(true)}
              className="flex items-center justify-center h-12"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              View All Tasks
            </Button>
            <Button
              variant="outline"
              onClick={handleOpenMeetings}
              className="flex items-center justify-center h-12"
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Meetings
            </Button>
          </div>

          {/* Additional Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={handleOpenEvents}
              className="flex items-center justify-center h-12"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Browse Events
            </Button>
            <Button
              variant="outline"
              onClick={handleOpenReportsList}
              className="flex items-center justify-center h-12"
            >
              <FileText className="h-4 w-4 mr-2" />
              View My Reports
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Assigned Tasks */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-['Work_Sans']">
                Assigned Tasks ({assignedTasks.length})
              </h2>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-white rounded-2xl h-32 border-none shadow-md"></div>
                    </div>
                  ))}
                </div>
              ) : assignedTasks.length > 0 ? (
                <div className="space-y-4">
                  {assignedTasks.map(task => (
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
                <Card>
                  <CardContent className="text-center py-12">
                    <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-['Work_Sans'] text-lg">No assigned tasks yet</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Personal Tasks */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 font-['Work_Sans']">
                Personal Tasks ({personalTasks.length})
              </h2>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-white rounded-2xl h-32 border-none shadow-md"></div>
                    </div>
                  ))}
                </div>
              ) : personalTasks.length > 0 ? (
                <div className="space-y-4">
                  {personalTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={handleCompleteTask}
                      onView={setSelectedTask}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Plus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4 font-['Work_Sans'] text-lg">No personal tasks yet</p>
                    <Button onClick={() => setShowTaskModal(true)}>
                      Create Your First Task
                    </Button>
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
          title="Create Personal Task"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2 font-['Work_Sans']">
                Task Title
              </Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
              />
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Work_Sans']">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                  rows={4}
                  className="block w-full px-4 py-3 border-none rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 font-['Work_Sans'] shadow-sm"
                />
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Work_Sans']">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="block w-full px-4 py-3 border-none rounded-xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 font-['Work_Sans'] shadow-sm"
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
                <h3 className="text-xl font-semibold text-gray-800 mb-3 font-['Work_Sans']">
                  {selectedTask.title}
                </h3>
                <p className="text-gray-600 font-['Work_Sans']">{selectedTask.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-800 font-['Work_Sans']">Status:</span>
                  <span className="ml-2 capitalize font-['Work_Sans']">{selectedTask.status.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-800 font-['Work_Sans']">Priority:</span>
                  <span className="ml-2 capitalize font-['Work_Sans']">{selectedTask.priority}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-800 font-['Work_Sans']">Type:</span>
                  <span className="ml-2 capitalize font-['Work_Sans']">{selectedTask.type}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-800 font-['Work_Sans']">Created:</span>
                  <span className="ml-2 font-['Work_Sans']">{new Date(selectedTask.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {selectedTask.revision_notes && (
                <div className="bg-red-50/50 border border-red-200/50 rounded-xl p-4 backdrop-blur-10">
                  <h4 className="text-sm font-medium text-red-700 mb-2 font-['Work_Sans']">Revision Notes:</h4>
                  <p className="text-sm text-red-600 font-['Work_Sans']">{selectedTask.revision_notes}</p>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Weekly Report Modal */}
        <Modal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Submit Weekly Report"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-title" className="block text-sm font-medium text-gray-700 mb-2 font-['Work_Sans']">
                Report Title
              </Label>
              <Input
                id="report-title"
                value={newReport.title}
                onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Weekly Progress Report - Week 1"
              />
            </div>
            
            <div>
              <Label htmlFor="week-end-date" className="block text-sm font-medium text-gray-700 mb-2 font-['Work_Sans']">
                Week Ending Date
              </Label>
              <Input
                id="week-end-date"
                type="date"
                value={newReport.week_end}
                onChange={(e) => setNewReport(prev => ({ ...prev, week_end: e.target.value }))}
              />
            </div>
            
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Work_Sans']">
                  Report Content
                </label>
                <textarea
                  value={newReport.content}
                  onChange={(e) => setNewReport(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Describe your progress this week, challenges faced, and plans for next week..."
                  rows={8}
                  className="block w-full px-4 py-3 border-none rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 font-['Work_Sans'] shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-1 font-['Work_Sans']">
                  Include: What you accomplished, challenges faced, lessons learned, and next week's goals.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-['Work_Sans']">
                  Attachment (Optional)
                </label>
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-white/30 rounded-2xl p-6 text-center hover:border-emerald-400 transition-colors duration-300 bg-white/10 backdrop-blur-10">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2 font-['Work_Sans']">
                      Upload a PDF file (max 10MB)
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="dashboard-file-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('dashboard-file-upload')?.click()}
                      type="button"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose PDF File
                    </Button>
                  </div>
                ) : (
                  <div className="border border-emerald-300/50 rounded-2xl p-4 bg-emerald-50/50 backdrop-blur-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Paperclip className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-800 font-['Work_Sans']">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500 font-['Work_Sans']">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeSelectedFile}
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1 font-['Work_Sans']">
                  Supported format: PDF only. Maximum file size: 10MB.
                </p>
              </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowReportModal(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReport}
                disabled={!newReport.title || !newReport.content || !newReport.week_end || uploading}
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </div>
          </div>
        </Modal>

        {/* All Tasks Modal */}
        <Modal
          isOpen={showTasksModal}
          onClose={() => setShowTasksModal(false)}
          title="All My Tasks"
          size="xl"
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600 font-['Work_Sans']">
              View and manage all your assigned and personal tasks in one place.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAccept={handleAcceptTask}
                    onComplete={handleCompleteTask}
                    onView={setSelectedTask}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-['Work_Sans']">No tasks found</p>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowTasksModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>

        {/* Meetings Modal */}
        <Modal
          isOpen={showMeetingsModal}
          onClose={() => setShowMeetingsModal(false)}
          title="My Meetings"
          size="xl"
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600 font-['Work_Sans']">
              View your upcoming and past meetings. Join virtual meetings directly from here.
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-blue-700 font-['Work_Sans']">
                <strong>Quick Access:</strong> This is a preview of your meetings. For full meeting management, use the dedicated Meetings page.
              </p>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {meetingsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-20 border-2 border-gray-300"></div>
                    </div>
                  ))}
                </div>
              ) : meetings.length > 0 ? (
                meetings.map(meeting => (
                  <Card key={meeting.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800 font-['Work_Sans']">{meeting.title}</h4>
                          <p className="text-sm text-gray-600 font-['Work_Sans']">
                            {new Date(meeting.start_date).toLocaleDateString()} at {new Date(meeting.start_date).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-500 font-['Work_Sans']">{meeting.location}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`/meetings`, '_blank')}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-['Work_Sans']">No meetings scheduled</p>
                  <Button 
                    className="mt-3" 
                    onClick={() => window.open(`/meetings`, '_blank')}
                  >
                    View All Meetings
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowMeetingsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>

        {/* Events Modal */}
        <Modal
          isOpen={showEventsModal}
          onClose={() => setShowEventsModal(false)}
          title="Upcoming Events"
          size="xl"
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600 font-['Work_Sans']">
              Discover workshops, competitions, and networking opportunities.
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-sm text-green-700 font-['Work_Sans']">
                <strong>Featured Events:</strong> Don't miss out on these exciting opportunities to learn and network!
              </p>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-20 border-2 border-gray-300"></div>
                    </div>
                  ))}
                </div>
              ) : events.length > 0 ? (
                events.map(event => (
                  <Card key={event.id} className="border-2 border-black">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-black font-['Work_Sans']">{event.title}</h4>
                          <p className="text-sm text-gray-600 font-['Work_Sans']">
                            {new Date(event.start_date).toLocaleDateString()} at {new Date(event.start_date).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-500 font-['Work_Sans']">{event.location}</p>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                            event.type === 'workshop' ? 'bg-blue-100 text-blue-800' :
                            event.type === 'competition' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </span>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => window.open(`/events`, '_blank')}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-['Work_Sans']">No events available</p>
                  <Button 
                    className="mt-3" 
                    onClick={() => window.open(`/events`, '_blank')}
                  >
                    View All Events
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowEventsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reports List Modal */}
        <Modal
          isOpen={showReportsListModal}
          onClose={() => setShowReportsListModal(false)}
          title="My Reports"
          size="xl"
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600 font-['Work_Sans']">
              View all your submitted weekly reports and their status.
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-yellow-700 font-['Work_Sans']">
                <strong>Tip:</strong> Regular report submission helps track your progress and achievements.
              </p>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reportsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-20 border-2 border-gray-300"></div>
                    </div>
                  ))}
                </div>
              ) : reports.length > 0 ? (
                reports.map(report => (
                  <Card key={report.id} className="border-2 border-black">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-black font-['Work_Sans']">{report.title}</h4>
                          <p className="text-sm text-gray-600 font-['Work_Sans']">
                            Submitted on {new Date(report.submitted_at).toLocaleDateString()}
                          </p>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                            report.status === 'approved' ? 'bg-green-100 text-green-800' :
                            report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`/reports`, '_blank')}
                        >
                          View Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-['Work_Sans']">No reports submitted yet</p>
                  <Button 
                    className="mt-3" 
                    onClick={() => {
                      setShowReportsListModal(false)
                      setShowReportModal(true)
                    }}
                  >
                    Submit Your First Report
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowReportsListModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </AppLayout>
    </ProtectedRoute>
  )
}