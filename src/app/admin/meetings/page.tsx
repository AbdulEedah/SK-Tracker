'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  Calendar, 
  Clock, 
  Users, 
  Video,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  UserCheck,
  AlertCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/useConfirm'

interface Meeting {
  id: string
  title: string
  description: string
  meeting_date: string
  meeting_time: string
  duration: number // in minutes
  location: string
  meeting_type: 'in-person' | 'virtual' | 'hybrid'
  meeting_link?: string
  max_attendees?: number
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  created_by: string
  created_at: string
  attendees?: MeetingAttendee[]
}

interface MeetingAttendee {
  id: string
  meeting_id: string
  user_id: string
  status: 'invited' | 'accepted' | 'declined' | 'attended'
  joined_at?: string
  user?: {
    full_name: string
    email: string
  }
}

export default function AdminMeetingsPage() {
  const { user: currentUser } = useAuth()
  const confirm = useConfirm()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [showMeetingLinkModal, setShowMeetingLinkModal] = useState(false)
  const [meetingLinkUrl, setMeetingLinkUrl] = useState('')
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    meeting_date: '',
    meeting_time: '',
    duration: '60',
    location: '',
    meeting_type: 'in-person' as 'in-person' | 'virtual' | 'hybrid',
    meeting_link: '',
    max_attendees: ''
  })

  useEffect(() => {
    fetchMeetings()
  }, [currentUser])

  const fetchMeetings = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      
      const result = await apiClient.getMeetings()

      if (result.success && result.data && Array.isArray(result.data)) {
        setMeetings(result.data as Meeting[])
      } else {
        console.error('Error fetching meetings:', result.error)
        toast.error('Failed to load meetings')
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
      toast.error('Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMeeting = async () => {
    try {
      const meetingData = {
        title: newMeeting.title,
        description: newMeeting.description,
        meeting_date: newMeeting.meeting_date,
        meeting_time: newMeeting.meeting_time,
        duration: parseInt(newMeeting.duration),
        location: newMeeting.location,
        meeting_type: newMeeting.meeting_type,
        meeting_link: newMeeting.meeting_link || null,
        max_attendees: newMeeting.max_attendees ? parseInt(newMeeting.max_attendees) : null,
        status: 'scheduled',
        created_by: currentUser!.id
      }

      const result = await apiClient.createMeeting(meetingData)

      if (result.success) {
        toast.success('Meeting created successfully!')
        setShowMeetingModal(false)
        resetForm()
        fetchMeetings()
      } else {
        toast.error('Failed to create meeting')
      }
    } catch (error) {
      toast.error('Failed to create meeting')
    }
  }

  const handleUpdateMeeting = async () => {
    if (!editingMeeting) return

    try {
      const updateData = {
        title: newMeeting.title,
        description: newMeeting.description,
        meeting_date: newMeeting.meeting_date,
        meeting_time: newMeeting.meeting_time,
        duration: parseInt(newMeeting.duration),
        location: newMeeting.location,
        meeting_type: newMeeting.meeting_type,
        meeting_link: newMeeting.meeting_link || null,
        max_attendees: newMeeting.max_attendees ? parseInt(newMeeting.max_attendees) : null
      }

      const result = await apiClient.updateMeeting(editingMeeting.id, updateData)

      if (result.success) {
        toast.success('Meeting updated successfully!')
        setShowMeetingModal(false)
        setEditingMeeting(null)
        fetchMeetings()
      } else {
        toast.error('Failed to update meeting')
      }
    } catch (error) {
      toast.error('Failed to update meeting')
    }
  }

  const handleDeleteMeeting = async (meetingId: string) => {
    const meetingToDelete = meetings.find(m => m.id === meetingId)
    const meetingTitle = meetingToDelete?.title || 'this meeting'
    
    confirm.confirm(
      async () => {
        try {
          const result = await apiClient.deleteMeeting(meetingId)

          if (result.success) {
            toast.success('Meeting deleted successfully!')
            fetchMeetings()
          } else {
            toast.error('Failed to delete meeting')
          }
        } catch (error) {
          toast.error('Failed to delete meeting')
          throw error
        }
      },
      {
        title: 'Delete Meeting',
        message: `Are you sure you want to delete "${meetingTitle}"? This action cannot be undone.`,
        confirmText: 'Delete Meeting',
        cancelText: 'Cancel',
        variant: 'danger'
      }
    )
  }

  const handleUpdateMeetingStatus = async (meetingId: string, status: Meeting['status']) => {
    try {
      const result = await apiClient.updateMeeting(meetingId, { status })

      if (result.success) {
        toast.success(`Meeting marked as ${status}!`)
        fetchMeetings()
      } else {
        toast.error('Failed to update meeting status')
      }
    } catch (error) {
      toast.error('Failed to update meeting status')
    }
  }

  const openEditModal = (meeting: Meeting) => {
    setEditingMeeting(meeting)
    setNewMeeting({
      title: meeting.title,
      description: meeting.description,
      meeting_date: meeting.meeting_date,
      meeting_time: meeting.meeting_time,
      duration: meeting.duration.toString(),
      location: meeting.location,
      meeting_type: meeting.meeting_type,
      meeting_link: meeting.meeting_link || '',
      max_attendees: meeting.max_attendees?.toString() || ''
    })
    setShowMeetingModal(true)
  }

  const resetForm = () => {
    setNewMeeting({
      title: '',
      description: '',
      meeting_date: '',
      meeting_time: '',
      duration: '60',
      location: '',
      meeting_type: 'in-person',
      meeting_link: '',
      max_attendees: ''
    })
  }

  const resetModal = () => {
    setShowMeetingModal(false)
    setEditingMeeting(null)
    resetForm()
  }

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500'
      case 'ongoing': return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getMeetingTypeIcon = (type: Meeting['meeting_type']) => {
    switch (type) {
      case 'virtual': return Video
      case 'in-person': return MapPin
      case 'hybrid': return Users
      default: return MapPin
    }
  }

  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled')
  const ongoingMeetings = meetings.filter(m => m.status === 'ongoing')
  const completedMeetings = meetings.filter(m => m.status === 'completed')
  const totalAttendees = meetings.reduce((sum, meeting) => sum + (meeting.attendees?.length || 0), 0)

  return (
    <ProtectedRoute adminOnly>
      <AppLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-normal text-black font-['Reem_Kufi'] mb-2" style={{ fontSize: '40px' }}>
                Meetings Management
              </h1>
              <p className="text-gray-600 font-['Work_Sans']">
                Schedule and manage team meetings, standups, and collaborative sessions.
              </p>
            </div>
            <Button
              onClick={() => setShowMeetingModal(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Total Meetings</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">{meetings.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-[#00A86B]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Scheduled</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">{scheduledMeetings.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Completed</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">{completedMeetings.length}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Total Attendees</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">{totalAttendees}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meetings List */}
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-40 border-2 border-gray-300"></div>
                  </div>
                ))}
              </div>
            ) : meetings.length > 0 ? (
              meetings.map(meeting => {
                const TypeIcon = getMeetingTypeIcon(meeting.meeting_type)
                return (
                  <Card key={meeting.id} className="border-2 border-black hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-semibold text-black font-['Work_Sans'] mb-2">
                            {meeting.title}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span className="font-['Work_Sans']">
                                {new Date(meeting.meeting_date).toLocaleDateString()} at {meeting.meeting_time}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span className="font-['Work_Sans']">{meeting.duration} minutes</span>
                            </div>
                            <div className="flex items-center">
                              <TypeIcon className="h-4 w-4 mr-1" />
                              <span className="font-['Work_Sans'] capitalize">{meeting.meeting_type}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span className="font-['Work_Sans']">
                                {meeting.attendees?.length || 0}
                                {meeting.max_attendees && ` / ${meeting.max_attendees}`} attendees
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white border-2 border-black ${getStatusColor(meeting.status)}`}>
                            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-['Work_Sans']">
                        {meeting.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedMeeting(meeting)}
                            className="text-black hover:text-[#00A86B]"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(meeting)}
                            className="text-black hover:text-[#00A86B]"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          {meeting.status === 'scheduled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateMeetingStatus(meeting.id, 'ongoing')}
                            >
                              Start Meeting
                            </Button>
                          )}
                          {meeting.status === 'ongoing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateMeetingStatus(meeting.id, 'completed')}
                            >
                              End Meeting
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteMeeting(meeting.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card className="border-2 border-black">
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-['Work_Sans'] text-lg">No meetings scheduled</p>
                  <p className="text-gray-400 font-['Work_Sans'] text-sm mt-2">
                    Schedule your first meeting to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Create/Edit Meeting Modal */}
        <Modal
          isOpen={showMeetingModal}
          onClose={resetModal}
          title={editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Meeting Title"
              value={newMeeting.title}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter meeting title"
            />
            
            <div>
              <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                Description
              </label>
              <textarea
                value={newMeeting.description}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter meeting description"
                rows={3}
                className="block w-full px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black placeholder-gray-500 focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Meeting Date"
                type="date"
                value={newMeeting.meeting_date}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, meeting_date: e.target.value }))}
              />
              <Input
                label="Meeting Time"
                type="time"
                value={newMeeting.meeting_time}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, meeting_time: e.target.value }))}
              />
              <Input
                label="Duration (minutes)"
                type="number"
                value={newMeeting.duration}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                Meeting Type
              </label>
              <select
                value={newMeeting.meeting_type}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, meeting_type: e.target.value as any }))}
                className="block w-full px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
              >
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <Input
              label="Location"
              value={newMeeting.location}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
              placeholder={newMeeting.meeting_type === 'virtual' ? 'Virtual Meeting Room' : 'Enter meeting location'}
            />

            {(newMeeting.meeting_type === 'virtual' || newMeeting.meeting_type === 'hybrid') && (
              <Input
                label="Meeting Link"
                value={newMeeting.meeting_link}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, meeting_link: e.target.value }))}
                placeholder="https://meet.google.com/abc-defg-hij"
              />
            )}

            <Input
              label="Max Attendees (Optional)"
              type="number"
              value={newMeeting.max_attendees}
              onChange={(e) => setNewMeeting(prev => ({ ...prev, max_attendees: e.target.value }))}
              placeholder="Leave empty for unlimited"
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={resetModal}
              >
                Cancel
              </Button>
              <Button
                onClick={editingMeeting ? handleUpdateMeeting : handleCreateMeeting}
                disabled={!newMeeting.title || !newMeeting.description || !newMeeting.meeting_date || !newMeeting.location}
              >
                {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Meeting Details Modal */}
        {selectedMeeting && (
          <Modal
            isOpen={!!selectedMeeting}
            onClose={() => setSelectedMeeting(null)}
            title="Meeting Details"
            size="lg"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-3 font-['Work_Sans']">
                  {selectedMeeting.title}
                </h3>
                <p className="text-gray-600 font-['Work_Sans']">{selectedMeeting.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Date & Time:</span>
                  <span className="ml-2 font-['Work_Sans']">
                    {new Date(selectedMeeting.meeting_date).toLocaleDateString()} at {selectedMeeting.meeting_time}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Duration:</span>
                  <span className="ml-2 font-['Work_Sans']">{selectedMeeting.duration} minutes</span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Type:</span>
                  <span className="ml-2 capitalize font-['Work_Sans']">{selectedMeeting.meeting_type}</span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Location:</span>
                  <span className="ml-2 font-['Work_Sans']">{selectedMeeting.location}</span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Status:</span>
                  <span className="ml-2 capitalize font-['Work_Sans']">{selectedMeeting.status}</span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Attendees:</span>
                  <span className="ml-2 font-['Work_Sans']">
                    {selectedMeeting.attendees?.length || 0}
                    {selectedMeeting.max_attendees && ` / ${selectedMeeting.max_attendees}`}
                  </span>
                </div>
              </div>

              {selectedMeeting.meeting_link && (
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Meeting Link:</span>
                  <button 
                    onClick={() => {
                      setMeetingLinkUrl(selectedMeeting.meeting_link!)
                      setShowMeetingLinkModal(true)
                    }}
                    className="ml-2 text-[#00A86B] hover:underline font-['Work_Sans']"
                  >
                    {selectedMeeting.meeting_link}
                  </button>
                </div>
              )}

              {selectedMeeting.attendees && selectedMeeting.attendees.length > 0 && (
                <div>
                  <h4 className="font-medium text-black mb-3 font-['Work_Sans']">Attendees</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedMeeting.attendees.map(attendee => (
                      <div key={attendee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <span className="font-['Work_Sans']">{attendee.user?.full_name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 font-['Work_Sans']">{attendee.user?.email}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            attendee.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            attendee.status === 'declined' ? 'bg-red-100 text-red-800' :
                            attendee.status === 'attended' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {attendee.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMeeting(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setSelectedMeeting(null)
                    openEditModal(selectedMeeting)
                  }}
                >
                  Edit Meeting
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Meeting Link Modal */}
        {showMeetingLinkModal && (
          <Modal
            isOpen={showMeetingLinkModal}
            onClose={() => {
              setShowMeetingLinkModal(false)
              setMeetingLinkUrl('')
            }}
            title="Join Meeting"
          >
            <div className="space-y-4">
              <div className="text-center">
                <Video className="h-16 w-16 text-[#00A86B] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2 font-['Work_Sans']">
                  Ready to Join Meeting
                </h3>
                <p className="text-gray-600 font-['Work_Sans'] mb-4">
                  Click the link below to join the meeting in your default browser or meeting application.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 mb-4">
                  <p className="text-sm text-gray-700 font-['Work_Sans'] break-all">
                    {meetingLinkUrl}
                  </p>
                </div>
              </div>
              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMeetingLinkModal(false)
                    setMeetingLinkUrl('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(meetingLinkUrl)
                    toast.success('Meeting link copied to clipboard!')
                    window.location.href = meetingLinkUrl
                  }}
                  className="flex items-center"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
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