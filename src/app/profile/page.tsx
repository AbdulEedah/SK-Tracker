'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { FileUpload } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  User, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Calendar,
  Mail,
  Shield,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'
import { triggerUserFilesUpdate } from '@/components/ui/PdfIndicator'
import { useConfirm } from '@/hooks/useConfirm'

export default function ProfilePage() {
  const { user } = useAuth()
  const confirm = useConfirm()
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserFiles()
    }
  }, [user])

  const fetchUserFiles = async () => {
    try {
      setIsLoading(true)
      // Since there's no direct endpoint for user files, we'll store uploaded files in localStorage
      // and also try to fetch from a potential backend endpoint
      const storedFiles = localStorage.getItem(`user_files_${user?.id}`)
      if (storedFiles) {
        const parsedFiles = JSON.parse(storedFiles)
        setUploadedFiles(parsedFiles)
      }
    } catch (error) {
      console.error('Error fetching user files:', error)
      toast.error('Failed to load your files')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    try {
      const response = await apiClient.uploadFile(file, 'profile', false)
      if (response.success) {
        // Create a file record for local storage
        const fileRecord: FileUpload = {
          id: response.data.id || Date.now().toString(),
          filename: response.data.filename || file.name,
          original_name: file.name,
          mime_type: file.type,
          size: file.size,
          url: response.data.url || '',
          category: 'profile',
          is_public: false,
          uploaded_by: user?.id || '',
          created_at: new Date().toISOString()
        }

        // Store in localStorage for persistence
        const existingFiles = localStorage.getItem(`user_files_${user?.id}`)
        const files = existingFiles ? JSON.parse(existingFiles) : []
        files.push(fileRecord)
        localStorage.setItem(`user_files_${user?.id}`, JSON.stringify(files))

        toast.success('PDF uploaded successfully!')
        triggerUserFilesUpdate() // Trigger update for PDF indicators
        fetchUserFiles() // Refresh the file list
        // Clear the input
        event.target.value = ''
      } else {
        toast.error(response.error?.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileDelete = async (fileId: string) => {
    const fileToDelete = uploadedFiles.find(f => f.id === fileId)
    const fileName = fileToDelete?.name || 'this file'
    
    confirm.confirm(
      async () => {
        try {
          // Remove from localStorage
          const existingFiles = localStorage.getItem(`user_files_${user?.id}`)
          if (existingFiles) {
            const files = JSON.parse(existingFiles)
            const updatedFiles = files.filter((file: FileUpload) => file.id !== fileId)
            localStorage.setItem(`user_files_${user?.id}`, JSON.stringify(updatedFiles))
          }

          // Also try to delete from backend if the endpoint exists
          try {
            await apiClient.deleteFile(fileId)
          } catch (backendError) {
            // Backend deletion failed, but local deletion succeeded
            console.warn('Backend file deletion failed:', backendError)
          }

          toast.success('File deleted successfully')
          triggerUserFilesUpdate() // Trigger update for PDF indicators
          fetchUserFiles() // Refresh the file list
        } catch (error) {
          console.error('Delete error:', error)
          toast.error('Failed to delete file')
          throw error
        }
      },
      {
        title: 'Delete File',
        message: `Are you sure you want to delete "${fileName}"? This action cannot be undone.`,
        confirmText: 'Delete File',
        cancelText: 'Cancel',
        variant: 'danger'
      }
    )
  }

  const handleFileDownload = async (fileId: string, filename: string) => {
    try {
      const apiBaseURL = process.env.NEXT_PUBLIC_API_URL || 'https://startup-baas.onrender.com/api/v1'
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const response = await fetch(`${apiBaseURL}/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        toast.error('Failed to download file')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-['Work_Sans']">My Profile</h1>
          <p className="text-gray-600 mt-2 font-['Work_Sans']">
            Manage your account information and uploaded documents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-['Work_Sans']">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 font-['Work_Sans']">
                    {user.full_name}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600 font-['Work_Sans']">{user.email}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Shield className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600 font-['Work_Sans'] capitalize">{user.role}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Activity className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600 font-['Work_Sans']">
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600 font-['Work_Sans']">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File Upload and Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-['Work_Sans']">
                  <FileText className="h-5 w-5 mr-2" />
                  My Documents (PDF Files)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Upload Section */}
                <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-sm font-medium text-gray-700 font-['Work_Sans']">
                        Upload a PDF document
                      </span>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </Label>
                    <p className="text-xs text-gray-500 mt-1 font-['Work_Sans']">
                      PDF files only, max 10MB
                    </p>
                    {isUploading && (
                      <p className="text-sm text-emerald-600 mt-2 font-['Work_Sans']">
                        Uploading...
                      </p>
                    )}
                  </div>
                </div>

                {/* Files List */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900 font-['Work_Sans']">
                    Uploaded Documents ({uploadedFiles.length})
                  </h4>
                  
                  {isLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 font-['Work_Sans']">Loading your files...</p>
                    </div>
                  ) : uploadedFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 font-['Work_Sans']">No PDF files uploaded yet</p>
                      <p className="text-sm text-gray-400 font-['Work_Sans']">
                        Upload your first document using the form above
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-red-500" />
                            <div>
                              <p className="font-medium text-gray-900 font-['Work_Sans']">
                                {file.original_name}
                              </p>
                              <p className="text-sm text-gray-500 font-['Work_Sans']">
                                {formatFileSize(file.size)} • Uploaded {new Date(file.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFileDownload(file.id, file.original_name)}
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFileDelete(file.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
    </div>
  )
}