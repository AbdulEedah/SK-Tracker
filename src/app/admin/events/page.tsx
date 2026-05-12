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
  MapPin, 
  Users, 
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  AlertCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/useConfirm'

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  event_time: string
  location: string
  max_participants?: number
  registration_deadline: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_by: string
  created_at: string
  registrations?: EventRegistration[]
}

interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  registered_at: string
  status: 'registered' | 'attended' | 'cancelled'
  user?: {
    full_name: string
    email: string
  }
}

export default function AdminEventsPage() {
  const { user: currentUser } = useAuth()
  const confirm = useConfirm()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    max_participants: '',
    registration_deadline: ''
  })



  useEffect(() => {
    fetchEvents()
  }, [currentUser])

  const fetchEvents = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      
      const result = await apiClient.getEvents()

      if (result.success && result.data && Array.isArray(result.data)) {
        setEvents(result.data as Event[])
      } else {
        console.error('Error fetching events:', result.error)
        toast.error('Failed to load events')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        event_date: newEvent.event_date,
        event_time: newEvent.event_time,
        location: newEvent.location,
        max_participants: newEvent.max_participants ? parseInt(newEvent.max_participants) : null,
        registration_deadline: newEvent.registration_deadline,
        status: 'upcoming',
        created_by: currentUser!.id
      }

      const result = await apiClient.createEvent(eventData)

      if (result.success) {
        toast.success('Event created successfully!')
        setShowEventModal(false)
        setNewEvent({
          title: '',
          description: '',
          event_date: '',
          event_time: '',
          location: '',
          max_participants: '',
          registration_deadline: ''
        })
        fetchEvents()
      } else {
        toast.error('Failed to create event')
      }
    } catch (error) {
      toast.error('Failed to create event')
    }
  }

  const handleUpdateEvent = async () => {
    if (!editingEvent) return

    try {
      const updateData = {
        title: newEvent.title,
        description: newEvent.description,
        event_date: newEvent.event_date,
        event_time: newEvent.event_time,
        location: newEvent.location,
        max_participants: newEvent.max_participants ? parseInt(newEvent.max_participants) : null,
        registration_deadline: newEvent.registration_deadline
      }

      const result = await apiClient.updateEvent(editingEvent.id, updateData)

      if (result.success) {
        toast.success('Event updated successfully!')
        setShowEventModal(false)
        setEditingEvent(null)
        fetchEvents()
      } else {
        toast.error('Failed to update event')
      }
    } catch (error) {
      toast.error('Failed to update event')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId)
    const eventTitle = eventToDelete?.title || 'this event'
    
    confirm.confirm(
      async () => {
        try {
          const result = await apiClient.deleteEvent(eventId)

          if (result.success) {
            toast.success('Event deleted successfully!')
            fetchEvents()
          } else {
            toast.error('Failed to delete event')
          }
        } catch (error) {
          toast.error('Failed to delete event')
          throw error
        }
      },
      {
        title: 'Delete Event',
        message: `Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`,
        confirmText: 'Delete Event',
        cancelText: 'Cancel',
        variant: 'danger'
      }
    )
  }

  const handleUpdateEventStatus = async (eventId: string, status: Event['status']) => {
    try {
      const result = await apiClient.updateEvent(eventId, { status })

      if (result.success) {
        toast.success(`Event marked as ${status}!`)
        fetchEvents()
      } else {
        toast.error('Failed to update event status')
      }
    } catch (error) {
      toast.error('Failed to update event status')
    }
  }

  const openEditModal = (event: Event) => {
    setEditingEvent(event)
    setNewEvent({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      event_time: event.event_time,
      location: event.location,
      max_participants: event.max_participants?.toString() || '',
      registration_deadline: event.registration_deadline
    })
    setShowEventModal(true)
  }

  const resetModal = () => {
    setShowEventModal(false)
    setEditingEvent(null)
    setNewEvent({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      max_participants: '',
      registration_deadline: ''
    })
  }

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500'
      case 'ongoing': return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const upcomingEvents = events.filter(e => e.status === 'upcoming')
  const ongoingEvents = events.filter(e => e.status === 'ongoing')
  const completedEvents = events.filter(e => e.status === 'completed')
  const totalRegistrations = events.reduce((sum, event) => sum + (event.registrations?.length || 0), 0)

  return (
    <ProtectedRoute adminOnly>
      <AppLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-normal text-black font-['Reem_Kufi'] mb-2" style={{ fontSize: '40px' }}>
                Events Management
              </h1>
              <p className="text-gray-600 font-['Work_Sans']">
                Create and manage events, workshops, and networking sessions.
              </p>
            </div>
            <Button
              onClick={() => setShowEventModal(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Total Events</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">{events.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-[#00A86B]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Upcoming</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">{upcomingEvents.length}</p>
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
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">{completedEvents.length}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Total Registrations</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">{totalRegistrations}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-40 border-2 border-gray-300"></div>
                  </div>
                ))}
              </div>
            ) : events.length > 0 ? (
              events.map(event => (
                <Card key={event.id} className="border-2 border-black hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-semibold text-black font-['Work_Sans'] mb-2">
                          {event.title}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="font-['Work_Sans']">
                              {new Date(event.event_date).toLocaleDateString()} at {event.event_time}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="font-['Work_Sans']">{event.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span className="font-['Work_Sans']">
                              {event.registrations?.length || 0}
                              {event.max_participants && ` / ${event.max_participants}`} registered
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white border-2 border-black ${getStatusColor(event.status)}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-['Work_Sans']">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEvent(event)}
                          className="text-black hover:text-[#00A86B]"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(event)}
                          className="text-black hover:text-[#00A86B]"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        {event.status === 'upcoming' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateEventStatus(event.id, 'ongoing')}
                          >
                            Mark as Ongoing
                          </Button>
                        )}
                        {event.status === 'ongoing' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateEventStatus(event.id, 'completed')}
                          >
                            Mark as Completed
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-2 border-black">
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-['Work_Sans'] text-lg">No events found</p>
                  <p className="text-gray-400 font-['Work_Sans'] text-sm mt-2">
                    Create your first event to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Create/Edit Event Modal */}
        <Modal
          isOpen={showEventModal}
          onClose={resetModal}
          title={editingEvent ? 'Edit Event' : 'Create New Event'}
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
            />
            
            <div>
              <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                Description
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter event description"
                rows={4}
                className="block w-full px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black placeholder-gray-500 focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Event Date"
                type="date"
                value={newEvent.event_date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, event_date: e.target.value }))}
              />
              <Input
                label="Event Time"
                type="time"
                value={newEvent.event_time}
                onChange={(e) => setNewEvent(prev => ({ ...prev, event_time: e.target.value }))}
              />
            </div>

            <Input
              label="Location"
              value={newEvent.location}
              onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter event location"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Participants (Optional)"
                type="number"
                value={newEvent.max_participants}
                onChange={(e) => setNewEvent(prev => ({ ...prev, max_participants: e.target.value }))}
                placeholder="Leave empty for unlimited"
              />
              <Input
                label="Registration Deadline"
                type="date"
                value={newEvent.registration_deadline}
                onChange={(e) => setNewEvent(prev => ({ ...prev, registration_deadline: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={resetModal}
              >
                Cancel
              </Button>
              <Button
                onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                disabled={!newEvent.title || !newEvent.description || !newEvent.event_date || !newEvent.location}
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Event Details Modal */}
        {selectedEvent && (
          <Modal
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
            title="Event Details"
            size="lg"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-3 font-['Work_Sans']">
                  {selectedEvent.title}
                </h3>
                <p className="text-gray-600 font-['Work_Sans']">{selectedEvent.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Date & Time:</span>
                  <span className="ml-2 font-['Work_Sans']">
                    {new Date(selectedEvent.event_date).toLocaleDateString()} at {selectedEvent.event_time}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Location:</span>
                  <span className="ml-2 font-['Work_Sans']">{selectedEvent.location}</span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Status:</span>
                  <span className="ml-2 capitalize font-['Work_Sans']">{selectedEvent.status}</span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Registrations:</span>
                  <span className="ml-2 font-['Work_Sans']">
                    {selectedEvent.registrations?.length || 0}
                    {selectedEvent.max_participants && ` / ${selectedEvent.max_participants}`}
                  </span>
                </div>
              </div>

              {selectedEvent.registrations && selectedEvent.registrations.length > 0 && (
                <div>
                  <h4 className="font-medium text-black mb-3 font-['Work_Sans']">Registered Participants</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedEvent.registrations.map(registration => (
                      <div key={registration.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <span className="font-['Work_Sans']">{registration.user?.full_name}</span>
                        <span className="text-sm text-gray-500 font-['Work_Sans']">{registration.user?.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setSelectedEvent(null)
                    openEditModal(selectedEvent)
                  }}
                >
                  Edit Event
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