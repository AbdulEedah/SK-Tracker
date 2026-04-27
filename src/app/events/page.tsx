'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  Search,
  Star,
  Eye,
  UserPlus,
  CheckCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

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
  type?: string
  featured?: boolean
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

export default function EventsPage() {
  const { user, isOffline } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [registrationEvent, setRegistrationEvent] = useState<Event | null>(null)

  // Mock events data for offline mode
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Innovation Workshop: AI in Business',
      description: 'Learn how to integrate AI solutions into your business processes and discover the latest trends in artificial intelligence for startups.',
      event_date: '2024-04-28',
      event_time: '10:00',
      location: 'Innovation Lab - Room 301',
      max_participants: 25,
      registration_deadline: '2024-04-26',
      status: 'upcoming',
      created_by: 'admin1',
      created_at: '2024-01-15T10:00:00Z',
      type: 'workshop',
      featured: true,
      registrations: [
        {
          id: '1',
          event_id: '1',
          user_id: 'user1',
          registered_at: '2024-01-20T09:00:00Z',
          status: 'registered',
          user: { full_name: 'John Doe', email: 'john@startupkano.com' }
        }
      ]
    },
    {
      id: '2',
      title: 'Startup Pitch Competition',
      description: 'Present your startup idea to a panel of investors and mentors. Win prizes and get funding opportunities.',
      event_date: '2024-05-05',
      event_time: '14:00',
      location: 'Main Auditorium',
      max_participants: 100,
      registration_deadline: '2024-05-01',
      status: 'upcoming',
      created_by: 'admin1',
      created_at: '2024-01-20T15:00:00Z',
      type: 'competition',
      featured: true,
      registrations: []
    },
    {
      id: '3',
      title: 'Networking Mixer',
      description: 'Connect with fellow entrepreneurs and industry professionals in a relaxed environment.',
      event_date: '2024-04-30',
      event_time: '18:00',
      location: 'Rooftop Terrace',
      max_participants: 50,
      registration_deadline: '2024-04-28',
      status: 'upcoming',
      created_by: 'admin1',
      created_at: '2024-01-25T12:00:00Z',
      type: 'networking',
      featured: false,
      registrations: []
    }
  ]

  useEffect(() => {
    fetchEvents()
  }, [user, isOffline])

  const fetchEvents = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      if (isOffline) {
        setEvents(mockEvents)
      } else {
        const result = await apiClient.getEvents()

        if (result.success && result.data && Array.isArray(result.data)) {
          setEvents(result.data as Event[])
        } else {
          console.error('Error fetching events:', result.error)
          toast.error('Failed to load events')
          setEvents(mockEvents) // Fallback to mock data
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
      setEvents(mockEvents) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterForEvent = async (event: Event) => {
    try {
      if (isOffline) {
        toast.success('Registration successful! (Offline mode - data not saved)')
        setShowRegistrationModal(false)
        setRegistrationEvent(null)
        return
      }

      const result = await apiClient.registerForEvent(event.id)

      if (result.success) {
        toast.success('Successfully registered for the event!')
        toast.info('You will receive a confirmation email shortly', {
          duration: 5000,
        })
        setShowRegistrationModal(false)
        setRegistrationEvent(null)
        fetchEvents()
      } else {
        toast.error('Failed to register for event')
      }
    } catch (error) {
      toast.error('Failed to register for event')
    }
  }

  const isUserRegistered = (event: Event) => {
    return event.registrations?.some(reg => reg.user_id === user?.id && reg.status === 'registered')
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || event.type === filterType
    return matchesSearch && matchesType
  })

  const upcomingEvents = filteredEvents.filter(e => e.status === 'upcoming')
  const pastEvents = filteredEvents.filter(e => e.status === 'completed')
  const featuredEvents = upcomingEvents.filter(e => e.featured)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workshop':
        return 'bg-blue-500 text-white'
      case 'competition':
        return 'bg-red-500 text-white'
      case 'networking':
        return 'bg-purple-500 text-white'
      case 'seminar':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const EventCard = ({ event, featured = false }: { event: Event, featured?: boolean }) => {
    const registrationCount = event.registrations?.length || 0
    const isRegistered = isUserRegistered(event)
    const isFull = event.max_participants ? registrationCount >= event.max_participants : false
    const isDeadlinePassed = new Date(event.registration_deadline) < new Date()

    return (
      <Card className={`border-2 border-black hover:shadow-lg transition-all duration-200 ${featured ? 'ring-2 ring-[#00A86B]' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {featured && <Star className="h-4 w-4 text-[#00A86B] fill-current" />}
                {event.type && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border-2 border-black ${getTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                )}
                {isRegistered && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                    Registered
                  </span>
                )}
              </div>
              <CardTitle className="text-xl font-semibold text-black font-['Work_Sans'] mb-2">
                {event.title}
              </CardTitle>
              <p className="text-gray-600 text-sm font-['Work_Sans'] line-clamp-2">
                {event.description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-['Work_Sans']">{new Date(event.event_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="font-['Work_Sans']">{event.event_time}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="font-['Work_Sans']">{event.location}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="font-['Work_Sans']">
                  {registrationCount}
                  {event.max_participants && `/${event.max_participants}`} registered
                </span>
              </div>
              {event.max_participants && (
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#00A86B] h-2 rounded-full" 
                    style={{ width: `${Math.min((registrationCount / event.max_participants) * 100, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedEvent(event)}
                className="text-black hover:text-[#00A86B]"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              {event.status === 'upcoming' && !isRegistered && !isFull && !isDeadlinePassed && (
                <Button 
                  size="sm"
                  onClick={() => {
                    setRegistrationEvent(event)
                    setShowRegistrationModal(true)
                  }}
                  className="flex items-center"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Register
                </Button>
              )}
              {isRegistered && (
                <span className="text-sm text-green-600 font-medium font-['Work_Sans'] flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Registered
                </span>
              )}
              {isFull && !isRegistered && (
                <span className="text-sm text-red-600 font-medium font-['Work_Sans']">
                  Fully Booked
                </span>
              )}
              {isDeadlinePassed && !isRegistered && (
                <span className="text-sm text-gray-500 font-medium font-['Work_Sans']">
                  Registration Closed
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="font-normal text-black font-['Reem_Kufi'] mb-2" style={{ fontSize: '40px' }}>
              Events
            </h1>
            <p className="text-gray-600 font-['Work_Sans']">
              Discover workshops, competitions, and networking opportunities.
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black placeholder-gray-500 focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                  />
                </div>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                >
                  <option value="all">All Types</option>
                  <option value="workshop">Workshops</option>
                  <option value="competition">Competitions</option>
                  <option value="networking">Networking</option>
                  <option value="seminar">Seminars</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Featured Events */}
          {featuredEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-black mb-6 font-['Work_Sans'] flex items-center">
                <Star className="h-6 w-6 text-[#00A86B] mr-2 fill-current" />
                Featured Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredEvents.map(event => (
                  <EventCard key={event.id} event={event} featured={true} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          <div>
            <h2 className="text-2xl font-semibold text-black mb-6 font-['Work_Sans']">
              Upcoming Events ({upcomingEvents.length})
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-64 border-2 border-gray-300"></div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card className="border-2 border-black">
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-['Work_Sans'] text-lg">
                    {searchTerm || filterType !== 'all' ? 'No events match your search' : 'No upcoming events'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-black mb-6 font-['Work_Sans']">
                Past Events ({pastEvents.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>

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
                  <span className="font-medium text-black font-['Work_Sans']">Registration Deadline:</span>
                  <span className="ml-2 font-['Work_Sans']">
                    {new Date(selectedEvent.registration_deadline).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-black font-['Work_Sans']">Capacity:</span>
                  <span className="ml-2 font-['Work_Sans']">
                    {selectedEvent.registrations?.length || 0}
                    {selectedEvent.max_participants && ` / ${selectedEvent.max_participants}`} registered
                  </span>
                </div>
              </div>

              {selectedEvent.registrations && selectedEvent.registrations.length > 0 && (
                <div>
                  <h4 className="font-medium text-black mb-3 font-['Work_Sans']">Registered Participants</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedEvent.registrations.slice(0, 5).map(registration => (
                      <div key={registration.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <span className="font-['Work_Sans']">{registration.user?.full_name}</span>
                        <span className="text-sm text-gray-500 font-['Work_Sans']">
                          {new Date(registration.registered_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {selectedEvent.registrations.length > 5 && (
                      <p className="text-sm text-gray-500 text-center font-['Work_Sans']">
                        And {selectedEvent.registrations.length - 5} more participants...
                      </p>
                    )}
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
                {selectedEvent.status === 'upcoming' && 
                 !isUserRegistered(selectedEvent) && 
                 new Date(selectedEvent.registration_deadline) > new Date() &&
                 (!selectedEvent.max_participants || (selectedEvent.registrations?.length || 0) < selectedEvent.max_participants) && (
                  <Button
                    onClick={() => {
                      setSelectedEvent(null)
                      setRegistrationEvent(selectedEvent)
                      setShowRegistrationModal(true)
                    }}
                    className="flex items-center"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Register for Event
                  </Button>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* Registration Confirmation Modal */}
        {registrationEvent && (
          <Modal
            isOpen={showRegistrationModal}
            onClose={() => {
              setShowRegistrationModal(false)
              setRegistrationEvent(null)
            }}
            title="Confirm Registration"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-black mb-2 font-['Work_Sans']">
                  {registrationEvent.title}
                </h3>
                <p className="text-gray-600 text-sm font-['Work_Sans']">
                  {new Date(registrationEvent.event_date).toLocaleDateString()} at {registrationEvent.event_time}
                </p>
                <p className="text-gray-600 text-sm font-['Work_Sans']">
                  Location: {registrationEvent.location}
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-sm text-blue-700 font-['Work_Sans']">
                  <strong>Registration Details:</strong>
                </p>
                <ul className="text-sm text-blue-600 mt-2 space-y-1 font-['Work_Sans']">
                  <li>• You will receive a confirmation email after registration</li>
                  <li>• Please arrive 15 minutes before the event starts</li>
                  <li>• Bring a valid ID for check-in</li>
                  <li>• Registration deadline: {new Date(registrationEvent.registration_deadline).toLocaleDateString()}</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRegistrationModal(false)
                    setRegistrationEvent(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleRegisterForEvent(registrationEvent)}
                  className="flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm Registration
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AppLayout>
    </ProtectedRoute>
  )
}