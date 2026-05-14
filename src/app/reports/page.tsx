'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { 
  FileText, 
  Plus, 
  Calendar, 
  Download,
  Search,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
  Upload,
  X,
  Paperclip,
  Trash2
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface Report {
  id: string
  title: string
  content: string
  week_start: string
  week_end: string
  submitted_at: string
  user_id: string
  status: 'submitted' | 'reviewed' | 'approved'
  admin_feedback?: string
  attachment_url?: string
  attachment_name?: string
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [newReport, setNewReport] = useState({
    title: '',
    content: '',
    week_end: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchReports()
    // Set default week ending to current Sunday
    const today = new Date()
    const sunday = new Date(today)
    sunday.setDate(today.getDate() + (7 - today.getDay()) % 7)
    
    // Calculate week start (Monday)
    const monday = new Date(sunday)
    monday.setDate(sunday.getDate() - 6)
    
    setNewReport(prev => ({
      ...prev,
      week_end: sunday.toISOString().split('T')[0],
      title: `Weekly Progress Report - Week ${getWeekNumber(sunday)}`
    }))
  }, [user])

  const getWeekNumber = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 1)
    const diff = date.getTime() - start.getTime()
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
  }

  const fetchReports = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const result = await apiClient.getMyReports()

      if (result.success && result.data) {
        // Handle nested response structure
        const responseData = result.data as any
        const reportsData = responseData.reports || responseData
        if (Array.isArray(reportsData)) {
          setReports(reportsData as Report[])
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
      setLoading(false)
    }
  }

  const handleSubmitReport = async () => {
    try {
      setUploading(true)
      
      let attachmentUrl = null
      let attachmentName = null

      // Upload file if selected
      if (selectedFile) {
        const uploadResult = await apiClient.uploadReportAttachment(selectedFile)
        
        if (uploadResult.success) {
          attachmentUrl = uploadResult.data.file_url
          attachmentName = selectedFile.name
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
        resetForm()
        fetchReports()
      } else {
        toast.error('Failed to submit report')
      }
    } catch (error) {
      toast.error('Failed to submit report')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteReport = async () => {
    if (!reportToDelete) return

    try {
      setDeleting(true)
      
      const result = await apiClient.deleteReport(reportToDelete.id)

      if (result.success) {
        toast.success('Report deleted successfully!')
        setShowDeleteModal(false)
        setReportToDelete(null)
        fetchReports()
      } else {
        toast.error('Failed to delete report')
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      toast.error('Failed to delete report')
    } finally {
      setDeleting(false)
    }
  }

  const confirmDeleteReport = (report: Report) => {
    setReportToDelete(report)
    setShowDeleteModal(true)
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

  const resetForm = () => {
    const today = new Date()
    const sunday = new Date(today)
    sunday.setDate(today.getDate() + (7 - today.getDay()) % 7)
    setNewReport({
      title: `Weekly Progress Report - Week ${getWeekNumber(sunday)}`,
      content: '',
      week_end: sunday.toISOString().split('T')[0]
    })
    setSelectedFile(null)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterPeriod('all')
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterPeriod === 'all') return matchesSearch
    
    const reportDate = new Date(report.week_end)
    const now = new Date()
    
    switch (filterPeriod) {
      case 'thisMonth':
        return matchesSearch && reportDate.getMonth() === now.getMonth()
      case 'lastMonth':
        return matchesSearch && reportDate.getMonth() === now.getMonth() - 1
      case 'thisQuarter':
        const currentQuarter = Math.floor(now.getMonth() / 3)
        const reportQuarter = Math.floor(reportDate.getMonth() / 3)
        return matchesSearch && reportQuarter === currentQuarter
      default:
        return matchesSearch
    }
  })

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-500 text-white'
      case 'reviewed': return 'bg-blue-500 text-white'
      case 'approved': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const ReportCard = ({ report }: { report: Report }) => (
    <Card className="border-2 border-black hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-black font-['Work_Sans'] mb-2">
              {report.title}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span className="font-['Work_Sans']">
                  Week ending {new Date(report.week_end).toLocaleDateString()}
                </span>
              </div>
              {report.attachment_name && (
                <div className="flex items-center space-x-1">
                  <Paperclip className="h-4 w-4" />
                  <span className="font-['Work_Sans'] text-[#00A86B]">PDF</span>
                </div>
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium border-2 border-black ${getStatusColor(report.status)}`}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 text-sm font-['Work_Sans'] line-clamp-3">
              {report.content}
            </p>
          </div>

          {report.admin_feedback && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
              <p className="text-sm text-blue-700 font-['Work_Sans']">
                <strong>Feedback:</strong> {report.admin_feedback}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedReport(report)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Full Report
            </Button>
            <div className="flex items-center space-x-2">
              {report.attachment_url && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open(report.attachment_url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              )}
              {/* Only show delete button for user's own reports that are still in submitted status */}
              {report.user_id === user?.id && report.status === 'submitted' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => confirmDeleteReport(report)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
              <div className="text-xs text-gray-500 font-['Work_Sans']">
                {new Date(report.submitted_at).toLocaleDateString()}
              </div>
            </div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-normal text-black font-['Reem_Kufi'] mb-2" style={{ fontSize: '40px' }}>
                My Weekly Reports
              </h1>
              <p className="text-gray-600 font-['Work_Sans']">
                Track your progress and share accomplishments with your team.
              </p>
            </div>
            <Button
              onClick={() => setShowReportModal(true)}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Submit Report
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="border-2 border-black">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black placeholder-gray-500 focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                  />
                </div>
                
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
                >
                  <option value="all">All Time</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisQuarter">This Quarter</option>
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

          {/* Reports Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black font-['Work_Sans']">
                Your Reports ({filteredReports.length})
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-64 border-2 border-gray-300"></div>
                  </div>
                ))}
              </div>
            ) : filteredReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map(report => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            ) : (
              <Card className="border-2 border-black">
                <CardContent className="text-center py-16">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-['Work_Sans'] text-lg mb-4">
                    {searchTerm || filterPeriod !== 'all' 
                      ? 'No reports match your filters' 
                      : 'No reports submitted yet'
                    }
                  </p>
                  {!searchTerm && filterPeriod === 'all' && (
                    <Button onClick={() => setShowReportModal(true)}>
                      Submit Your First Report
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Submit Report Modal */}
        <Modal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          title="Submit Weekly Report"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-title" className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
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
              <Label htmlFor="week-end-date" className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
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
              <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                Report Content
              </label>
              <textarea
                value={newReport.content}
                onChange={(e) => setNewReport(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Describe your progress this week, challenges faced, and plans for next week..."
                rows={8}
                className="block w-full px-4 py-3 border-2 border-black rounded-md bg-[#F5F5F5] text-black placeholder-gray-500 focus:outline-none focus:border-[#00A86B] transition-colors duration-200 font-['Work_Sans']"
              />
              <p className="text-xs text-gray-500 mt-1 font-['Work_Sans']">
                Include: What you accomplished, challenges faced, lessons learned, and next week's goals.
              </p>
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-black mb-2 font-['Work_Sans']">
                Attachment (Optional)
              </label>
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#00A86B] transition-colors duration-200">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2 font-['Work_Sans']">
                    Upload a PDF file (max 10MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    type="button"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose PDF File
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-[#00A86B] rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Paperclip className="h-5 w-5 text-[#00A86B]" />
                      <div>
                        <p className="text-sm font-medium text-black font-['Work_Sans']">
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

        {/* View Report Modal */}
        {selectedReport && (
          <Modal
            isOpen={!!selectedReport}
            onClose={() => setSelectedReport(null)}
            title="Report Details"
            size="lg"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-3 font-['Work_Sans']">
                  {selectedReport.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span className="font-['Work_Sans']">
                    Week ending: {new Date(selectedReport.week_end).toLocaleDateString()}
                  </span>
                  <span className="font-['Work_Sans']">
                    Submitted: {new Date(selectedReport.submitted_at).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border-2 border-black ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-black mb-3 font-['Work_Sans']">Report Content</h4>
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap font-['Work_Sans']">
                    {selectedReport.content}
                  </p>
                </div>
              </div>

              {selectedReport.admin_feedback && (
                <div>
                  <h4 className="font-medium text-black mb-3 font-['Work_Sans']">Admin Feedback</h4>
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <p className="text-blue-700 font-['Work_Sans']">{selectedReport.admin_feedback}</p>
                  </div>
                </div>
              )}

              {selectedReport.attachment_url && (
                <div>
                  <h4 className="font-medium text-black mb-3 font-['Work_Sans']">Attachment</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Paperclip className="h-5 w-5 text-[#00A86B]" />
                        <div>
                          <p className="text-sm font-medium text-black font-['Work_Sans']">
                            {selectedReport.attachment_name}
                          </p>
                          <p className="text-xs text-gray-500 font-['Work_Sans']">
                            PDF Document
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedReport.attachment_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedReport(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Report"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-black font-['Work_Sans'] mb-2">
                  Are you sure you want to delete this report?
                </h3>
                <p className="text-gray-600 font-['Work_Sans'] mb-4">
                  This action cannot be undone. The report "{reportToDelete?.title}" will be permanently deleted.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                  <p className="text-sm text-yellow-700 font-['Work_Sans']">
                    <strong>Note:</strong> You can only delete reports that are still in "submitted" status. 
                    Reports that have been reviewed or approved cannot be deleted.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteReport}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <Trash2 className="h-4 w-4 mr-2 animate-pulse" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </AppLayout>
    </ProtectedRoute>
  )
}