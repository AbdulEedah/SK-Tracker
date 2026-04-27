// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

// API Client Class
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; success: boolean; error?: any }> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add any additional headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value
        })
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value
        })
      } else {
        Object.assign(headers, options.headers)
      }
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          data: null as T,
          error: result.error || { message: 'Request failed' }
        }
      }

      return {
        success: true,
        data: result.data,
      }
    } catch (error) {
      return {
        success: false,
        data: null as T,
        error: { message: 'Network error', details: error }
      }
    }
  }

  // Auth methods
  async signUp(email: string, password: string, fullName: string, phoneNumber?: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        phone_number: phoneNumber,
        role: 'member'
      }),
    })
  }

  async signIn(email: string, password: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (result.success && result.data && typeof result.data === 'object' && 'token' in result.data) {
      this.setToken((result.data as any).token)
    }

    return result
  }

  async signOut() {
    const result = await this.request('/auth/logout', {
      method: 'POST',
    })
    this.clearToken()
    return result
  }

  async refreshToken(refreshToken: string) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  }

  // User methods
  async getCurrentUser() {
    return this.request('/users/me', { method: 'GET' })
  }

  async getUsers() {
    return this.request('/users', { method: 'GET' })
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`, { method: 'GET' })
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateUserStatus(id: string, isActive: boolean) {
    return this.request(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: 'DELETE' })
  }

  // Task methods
  async getTasks(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/tasks${queryString}`, { method: 'GET' })
  }

  async getMyTasks() {
    return this.request('/tasks/my-tasks', { method: 'GET' })
  }

  async getTaskById(id: string) {
    return this.request(`/tasks/${id}`, { method: 'GET' })
  }

  async createTask(data: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTask(id: string, data: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateTaskStatus(id: string, status: string) {
    return this.request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async acceptTask(id: string) {
    return this.request(`/tasks/${id}/accept`, { method: 'PATCH' })
  }

  async requestTaskRevision(id: string, notes: string) {
    return this.request(`/tasks/${id}/revision`, {
      method: 'PATCH',
      body: JSON.stringify({ revision_notes: notes }),
    })
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, { method: 'DELETE' })
  }

  // Report methods
  async getReports(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/reports${queryString}`, { method: 'GET' })
  }

  async getMyReports() {
    return this.request('/reports/my-reports', { method: 'GET' })
  }

  async getReportById(id: string) {
    return this.request(`/reports/${id}`, { method: 'GET' })
  }

  async createReport(data: any) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateReport(id: string, data: any) {
    return this.request(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateReportStatus(id: string, status: string, feedback?: string) {
    return this.request(`/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_feedback: feedback }),
    })
  }

  async deleteReport(id: string) {
    return this.request(`/reports/${id}`, { method: 'DELETE' })
  }

  // Meeting methods
  async getMeetings(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/meetings${queryString}`, { method: 'GET' })
  }

  async getMyMeetings() {
    return this.request('/meetings/my-meetings', { method: 'GET' })
  }

  async getMeetingById(id: string) {
    return this.request(`/meetings/${id}`, { method: 'GET' })
  }

  async createMeeting(data: any) {
    return this.request('/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMeeting(id: string, data: any) {
    return this.request(`/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async registerForMeeting(id: string) {
    return this.request(`/meetings/${id}/register`, { method: 'POST' })
  }

  async cancelMeetingRegistration(id: string) {
    return this.request(`/meetings/${id}/register`, { method: 'DELETE' })
  }

  async updateMeetingStatus(id: string, status: string) {
    return this.request(`/meetings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async deleteMeeting(id: string) {
    return this.request(`/meetings/${id}`, { method: 'DELETE' })
  }

  // Event methods
  async getEvents(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/events${queryString}`, { method: 'GET' })
  }

  async getMyEvents() {
    return this.request('/events/my-events', { method: 'GET' })
  }

  async getEventById(id: string) {
    return this.request(`/events/${id}`, { method: 'GET' })
  }

  async createEvent(data: any) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateEvent(id: string, data: any) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async registerForEvent(id: string) {
    return this.request(`/events/${id}/register`, { method: 'POST' })
  }

  async cancelEventRegistration(id: string) {
    return this.request(`/events/${id}/register`, { method: 'DELETE' })
  }

  async updateEventStatus(id: string, status: string) {
    return this.request(`/events/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async deleteEvent(id: string) {
    return this.request(`/events/${id}`, { method: 'DELETE' })
  }

  // Notification methods
  async getNotifications(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request(`/notifications${queryString}`, { method: 'GET' })
  }

  async getNotificationById(id: string) {
    return this.request(`/notifications/${id}`, { method: 'GET' })
  }

  async createNotification(data: any) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' })
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', { method: 'PATCH' })
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, { method: 'DELETE' })
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count', { method: 'GET' })
  }

  // File upload methods
  async uploadReportAttachment(file: File, reportId: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('report_id', reportId)

    const headers: HeadersInit = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${this.baseURL}/uploads/reports`, {
        method: 'POST',
        headers,
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error: result.error || { message: 'Upload failed' }
        }
      }

      return {
        success: true,
        data: result.data,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: { message: 'Upload error', details: error }
      }
    }
  }

  async deleteFile(fileId: string) {
    return this.request(`/uploads/${fileId}`, { method: 'DELETE' })
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL)

// Export types for better TypeScript support
export type ApiResponse<T> = {
  success: boolean
  data: T
  error?: any
}

import { Task } from './types'

// Mock data for offline development
export const mockUsers = [
  {
    id: 'mock-admin',
    email: 'admin@startupkano.com',
    full_name: 'Admin User',
    role: 'admin',
    phone_number: '+2348012345678',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-user',
    email: 'user@startupkano.com',
    full_name: 'Test User',
    role: 'member',
    phone_number: '+2348087654321',
    is_active: true,
    created_at: new Date().toISOString()
  }
]

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Complete Project Documentation',
    description: 'Finalize all project documentation and submit for review',
    type: 'assigned' as const,
    status: 'pending' as const,
    priority: 'high' as const,
    assigned_to: 'mock-user',
    assigned_by: 'mock-admin',
    is_personal: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Review Team Performance',
    description: 'Conduct weekly team performance review and provide feedback',
    type: 'personal' as const,
    status: 'in_progress' as const,
    priority: 'medium' as const,
    assigned_to: 'mock-admin',
    assigned_by: 'mock-admin',
    is_personal: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Utility function to check if backend is available
export const checkBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.ok
  } catch (error) {
    return false
  }
}