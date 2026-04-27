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
  Video,
  MapPin,
  Search,
  Eye,
  ExternalLink
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface Meeting {
  id: string
  title: string
  description: string
  meeting_date: string
  meeting_time: string
  duration: number
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

export default function MeetingsPage() {
  const { user, isOffline } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)

  // Mock meetings data for offline mode
  const mockMeetings: Meeting[] = [
    {
      id: '1',
      title: 'Weekly Team Standup',
      description: 'Weekly progress review and planning session for all team members.',
      meeting_date: '2024-04-22',
      meeting_time: '09:00',
      duration: 60,
      location: 'Conference Room A',
      meeting_type: 'in-person',
      max_attendees: 15,
      status: 'scheduled',
      created_by: 'admin1',
      created_at: '2024-01-20T10:00:00Z',
      attendees: [
        {
          id: '1',
          meeting_id: '1',
          user_id: 'user1',
          status: 'accepted',
          user: { full_name: 'John Doe', email: 'john@startupkano.com' }
        }
      ]
    },
    {
      id: '2',
      title: 'Project Kickoff Meeting',
      description: 'Initial meeting for the new innovation project with stakeholders.',
      meeting_date: '2024-04-25',
      meeting_time: '14:00',
      duration: 120,
      location: 'Virtual Meeting Room',
      meeting_type: 'virtual',
      meeting_link: 'https://meet.google.com/abc-defg-hij',
      max_attendees: 8,
      status: 'scheduled',
      created_by: 'admin1',
      created_at: '2024-01-25T15:00:00Z',
      attendees: []
    },
    {
      id: '3',
      title: 'Monthly Review',
      description: 'Monthly performance and goals review session.',
      meeting_date: '2024-04-18',
      meeting_time: '10:30',
      duration: 90,
      location: 'Main Hall',
      meeting_type: 'in-person',
      status: 'completed',
      created_by: 'admin1',
      created_at: '2024-01-15T12:00:00Z',
      attendees: []
    }
  ]

  useEffect(() => {
    fetchMeetings()
  }, [user, isOffline])

  const fetchMeetings = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      if (isOffline) {
        setMeetings(mockMeetings)
      } else {
        const result = await apiClient.getMyMeetings()

        if (result.success && result.data && Array.isArray(result.data)) {
          setMeetings(result.data as Meeting[])
        } else {
          console.error('Error fetching meetings:', result.error)
          toast.error('Failed to load meetings')
          setMeetings(mockMeetings) // Fallback to mock data
        }
      }
    } catch (error) {
      console.error('Error fetching meetings:', error)
      toast.error('Failed to load meetings')
      setMeetings(mockMeetings) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const handleJoinMeeting = (meeting: Meeting) => {
    if (meeting.meeting_type === 'virtual' && meeting.meeting_link) {
      window.open(meeting.meeting_link, '_blank')
      toast.success('Opening meeting link...')
    } else {
      toast.info(`Meeting location: ${meeting.location}`)
    }
  }

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const upcomingMeetings = filteredMeetings.filter(m => m.status === 'scheduled')
  const pastMeetings = filteredMeetings.filter(m => m.status === 'completed')

  const MeetingCard = ({ meeting }: { meeting: Meeting }) => (
    <Card className="border-2 border-black hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-black font-['Work_Sans'] mb-2">
              {meeting.title}
            </CardTitle>
            <p className="text-gray-600 text-sm font-['Work_Sans'] line-clamp-2">
              {meeting.description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {meeting.meeting_type === 'virtual' ? (
              <Video className="h-5 w-5 text-[#00A86B]" />
            ) : meeting.meeting_type === 'hybrid' ? (
              <Users className="h-5 w-5 text-[#00A86B]" />
            ) : (
              <MapPin className="h-5 w-5 text-[#00A86B]" />
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 border-black ${
              meeting.status === 'scheduled' 
                ? 'bg-[#00A86B] text-black' 
                : 'bg-gray-200 text-black'
            }`}>
              {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-['Work_Sans']">{new Date(meeting.meeting_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="font-['Work_Sans']">{meeting.meeting_time} ({meeting.duration}min)</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-sm">
            {meeting.meeting_type === 'virtual' ? (
              <Video className="h-4 w-4 text-gray-400" />
            ) : (
              <MapPin className="h-4 w-4 text-gray-400" />
            )}
            <span className="font-['Work_Sans'] capitalize">{meeting.meeting_type} - {meeting.location}</span>
          </div>

          <div className="flex items-center space-x-1 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="font-['Work_Sans']">
              {meeting.attendees?.length || 0}
              {meeting.max_attendees && ` / ${meeting.max_attendees}`} attendees
            </span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedMeeting(meeting)}
              className="text-black hover:text-[#00A86B]"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            {meeting.status === 'scheduled' && (
              <Button 
                size="sm"
                onClick={() => handleJoinMeeting(meeting)}
                className="flex items-center"
              >
                {meeting.meeting_type === 'virtual' ? (
                  <>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Join Meeting
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-1" />
                    View Location
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="font-normal text-black font-['Reem_Kufi'] mb-2" style={{ fontSize: '40px' }}>
              My Meetings
            </h1>
            <p className="text-gray-600 font-['Work_Sans']">
              View your scheduled meetings and join virtual sessions.
            </p>
          </div>

          {/* Search */}
          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black placeholder-gray-500 focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                />
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Meetings */}
          <div>
            <h2 className="text-2xl font-semibold text-black mb-6 font-['Work_Sans']">
              Upcoming Meetings ({upcomingMeetings.length})
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-48 border-2 border-gray-300"></div>
                  </div>
                ))}
              </div>
            ) : upcomingMeetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingMeetings.map(meeting => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            ) : (
              <Card className="border-2 border-black">
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-['Work_Sans'] text-lg">
                    {searchTerm ? 'No meetings match your search' : 'No upcoming meetings'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Past Meetings */}
          {pastMeetings.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold text-black mb-6 font-['Work_Sans']">
                Past Meetings ({pastMeetings.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastMeetings.map(meeting => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            </div>
          )}
        </div>

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
                  <a 
                    href={selectedMeeting.meeting_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-[#00A86B] hover:underline font-['Work_Sans'] flex items-center"
                  >
                    {selectedMeeting.meeting_link}
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
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
                {selectedMeeting.status === 'scheduled' && (
                  <Button
                    onClick={() => {
                      handleJoinMeeting(selectedMeeting)
                      setSelectedMeeting(null)
                    }}
                    className="flex items-center"
                  >
                    {selectedMeeting.meeting_type === 'virtual' ? (
                      <>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Join Meeting
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-1" />
                        View Location
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Modal>
        )}
      </AppLayout>
    </ProtectedRoute>
  )
}