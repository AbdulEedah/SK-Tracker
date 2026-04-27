'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface Report {
  id: string
  title: string
  content: string
  week_ending: string
  submitted_at: string
  user_id: string
  status: 'submitted' | 'reviewed' | 'approved'
  feedback?: string
  user?: {
    full_name: string
    email: string
  }
}

export default function AdminReportsPage() {
  const { user: currentUser, isOffline } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [filter, setFilter] = useState<'all' | 'submitted' | 'reviewed' | 'approved'>('all')

  // Mock data for offline mode
  const mockReports: Report[] = [
    {
      id: '1',
      title: 'Weekly Progress Report - Week 1',
      content: 'This week I focused on completing the user authentication system. I successfully implemented login/logout functionality and user registration. The main challenges were handling form validation and error states. Next week I plan to work on the dashboard components.',
      week_ending: '2024-01-07',
      submitted_at: '2024-01-07T18:00:00Z',
      user_id: 'user1',
      status: 'submitted',
      user: {
        full_name: 'John Doe',
        email: 'john@startupkano.com'
      }
    },
    {
      id: '2',
      title: 'Weekly Progress Report - Week 2',
      content: 'Completed the dashboard layout and implemented the task management system. Added filtering and search functionality. Encountered some issues with state management but resolved them using React Context. Planning to work on the admin panel next week.',
      week_ending: '2024-01-14',
      submitted_at: '2024-01-14T17:30:00Z',
      user_id: 'user2',
      status: 'reviewed',
      feedback: 'Great progress on the dashboard! The task management implementation looks solid.',
      user: {
        full_name: 'Jane Smith',
        email: 'jane@startupkano.com'
      }
    },
    {
      id: '3',
      title: 'Weekly Progress Report - Week 3',
      content: 'Worked on the reporting system and event management features. Implemented CRUD operations for events and added calendar integration. The reporting dashboard is now functional with export capabilities. Next week focusing on mobile responsiveness.',
      week_ending: '2024-01-21',
      submitted_at: '2024-01-21T16:45:00Z',
      user_id: 'user3',
      status: 'approved',
      feedback: 'Excellent work! The reporting system meets all requirements.',
      user: {
        full_name: 'Mike Johnson',
        email: 'mike@startupkano.com'
      }
    }
  ]

  useEffect(() => {
    fetchReports()
  }, [currentUser, isOffline])

  const fetchReports = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      
      if (isOffline) {
        setReports(mockReports)
      } else {
        const result = await apiClient.getReports()

        if (result.success && result.data && Array.isArray(result.data)) {
          setReports(result.data as Report[])
        } else {
          console.error('Error fetching reports:', result.error)
          toast.error('Failed to load reports')
          setReports(mockReports) // Fallback to mock data
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to load reports')
      setReports(mockReports) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (reportId: string, status: Report['status'], feedback?: string) => {
    try {
      if (isOffline) {
        toast.error('Cannot update reports in offline mode')
        return
      }

      const result = await apiClient.updateReportStatus(reportId, status, feedback)

      if (result.success) {
        toast.success(`Report ${status} successfully!`)
        fetchReports()
        setSelectedReport(null)
      } else {
        toast.error('Failed to update report status')
      }
    } catch (error) {
      toast.error('Failed to update report status')
    }
  }

  const filteredReports = reports.filter(report => 
    filter === 'all' || report.status === filter
  )

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-500'
      case 'reviewed': return 'bg-blue-500'
      case 'approved': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'submitted': return Clock
      case 'reviewed': return Eye
      case 'approved': return CheckCircle
      default: return AlertCircle
    }
  }

  return (
    <ProtectedRoute adminOnly>
      <AppLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="font-normal text-black font-['Reem_Kufi'] mb-2" style={{ fontSize: '40px' }}>
              Reports Management
            </h1>
            <p className="text-gray-600 font-['Work_Sans']">
              Review and manage weekly progress reports from team members.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Total Reports</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">{reports.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-[#00A86B]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Pending Review</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">
                      {reports.filter(r => r.status === 'submitted').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Under Review</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">
                      {reports.filter(r => r.status === 'reviewed').length}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">Approved</p>
                    <p className="text-3xl font-bold text-black font-['Reem_Kufi']">
                      {reports.filter(r => r.status === 'approved').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All Reports
            </Button>
            <Button
              variant={filter === 'submitted' ? 'primary' : 'outline'}
              onClick={() => setFilter('submitted')}
            >
              Pending Review
            </Button>
            <Button
              variant={filter === 'reviewed' ? 'primary' : 'outline'}
              onClick={() => setFilter('reviewed')}
            >
              Under Review
            </Button>
            <Button
              variant={filter === 'approved' ? 'primary' : 'outline'}
              onClick={() => setFilter('approved')}
            >
              Approved
            </Button>
          </div>

          {/* Reports List */}
          <div className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-32 border-2 border-gray-300"></div>
                  </div>
                ))}
              </div>
            ) : filteredReports.length > 0 ? (
              filteredReports.map(report => {
                const StatusIcon = getStatusIcon(report.status)
                return (
                  <Card key={report.id} className="border-2 border-black hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-semibold text-black font-['Work_Sans'] mb-2">
                            {report.title}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              <span className="font-['Work_Sans']">{report.user?.full_name}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span className="font-['Work_Sans']">
                                Week ending {new Date(report.week_ending).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span className="font-['Work_Sans']">
                                {new Date(report.submitted_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white border-2 border-black ${getStatusColor(report.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 font-['Work_Sans']">
                        {report.content}
                      </p>
                      {report.feedback && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                          <p className="text-sm text-blue-700 font-['Work_Sans']">
                            <strong>Feedback:</strong> {report.feedback}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                          className="text-black hover:text-[#00A86B]"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <div className="flex space-x-2">
                          {report.status === 'submitted' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const feedback = prompt('Enter feedback (optional):')
                                  handleUpdateStatus(report.id, 'reviewed', feedback || undefined)
                                }}
                              >
                                Mark as Reviewed
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const feedback = prompt('Enter approval feedback (optional):')
                                  handleUpdateStatus(report.id, 'approved', feedback || undefined)
                                }}
                              >
                                Approve
                              </Button>
                            </>
                          )}
                          {report.status === 'reviewed' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const feedback = prompt('Enter approval feedback (optional):')
                                handleUpdateStatus(report.id, 'approved', feedback || undefined)
                              }}
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card className="border-2 border-black">
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-['Work_Sans'] text-lg">
                    {filter === 'all' ? 'No reports found' : `No ${filter} reports found`}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Report Details Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-black">
              <div className="p-6 border-b-2 border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-black font-['Reem_Kufi'] mb-2">
                      {selectedReport.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="font-['Work_Sans']">
                        <strong>Submitted by:</strong> {selectedReport.user?.full_name}
                      </span>
                      <span className="font-['Work_Sans']">
                        <strong>Week ending:</strong> {new Date(selectedReport.week_ending).toLocaleDateString()}
                      </span>
                      <span className="font-['Work_Sans']">
                        <strong>Submitted:</strong> {new Date(selectedReport.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-500 hover:text-black"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-3 font-['Work_Sans']">Report Content</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap font-['Work_Sans']">
                      {selectedReport.content}
                    </p>
                  </div>
                </div>

                {selectedReport.feedback && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-black mb-3 font-['Work_Sans']">Feedback</h3>
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                      <p className="text-blue-700 font-['Work_Sans']">{selectedReport.feedback}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReport(null)}
                  >
                    Close
                  </Button>
                  {selectedReport.status === 'submitted' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const feedback = prompt('Enter feedback (optional):')
                          handleUpdateStatus(selectedReport.id, 'reviewed', feedback || undefined)
                        }}
                      >
                        Mark as Reviewed
                      </Button>
                      <Button
                        onClick={() => {
                          const feedback = prompt('Enter approval feedback (optional):')
                          handleUpdateStatus(selectedReport.id, 'approved', feedback || undefined)
                        }}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                  {selectedReport.status === 'reviewed' && (
                    <Button
                      onClick={() => {
                        const feedback = prompt('Enter approval feedback (optional):')
                        handleUpdateStatus(selectedReport.id, 'approved', feedback || undefined)
                      }}
                    >
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  )
}