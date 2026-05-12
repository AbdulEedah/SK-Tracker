// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://startup-baas.onrender.com/api/v1'

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

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        return {
          success: false,
          data: null as T,
          error: { 
            message: 'Invalid response format', 
            status: response.status,
            statusText: response.statusText,
            details: parseError 
          }
        }
      }

      if (!response.ok) {
        return {
          success: false,
          data: null as T,
          error: result.error || result.message || { 
            message: `Request failed with status ${response.status}`,
            status: response.status,
            statusText: response.statusText
          }
        }
      }

      // Handle different response formats
      // Some endpoints return { success: true, data: ... }
      // Others return arrays or objects directly
      if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
        return {
          success: true,
          data: result.data,
        }
      } else {
        // For endpoints that return data directly (like arrays)
        return {
          success: true,
          data: result,
        }
      }
    } catch (error) {
      return {
        success: false,
        data: null as T,
        error: { 
          message: 'Network error', 
          details: error instanceof Error ? error.message : String(error)
        }
      }
    }
  }

  // Auth methods
  async signUp(email: string, password: string, fullName: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: fullName,  // Backend expects 'name', not 'full_name'
        email,
        password,
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
    const result = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (result.success && result.data && typeof result.data === 'object' && 'access_token' in result.data) {
      this.setToken((result.data as any).access_token)
    }

    return result
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ 
        current_password: currentPassword, 
        new_password: newPassword 
      }),
    })
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    })
  }

  async verifyEmail(token: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  async resendVerification(email: string) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  // User methods
  async getCurrentUser() {
    return this.request('/users/me', { method: 'GET' })
  }

  async getUsers(page = 1, limit = 10) {
    return this.request(`/users?page=${page}&limit=${limit}`, { method: 'GET' })
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

  async getMyTasks(status?: string, priority?: string) {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (priority) params.append('priority', priority)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/tasks/my-tasks${queryString}`, { method: 'GET' })
  }

  async getOverdueTasks(daysOverdue?: number) {
    const params = daysOverdue ? `?days_overdue=${daysOverdue}` : ''
    return this.request(`/tasks/overdue${params}`, { method: 'GET' })
  }

  async searchTasks(query: string, status?: string, priority?: string) {
    const params = new URLSearchParams({ query })
    if (status) params.append('status', status)
    if (priority) params.append('priority', priority)
    return this.request(`/tasks/search?${params.toString()}`, { method: 'GET' })
  }

  async getTaskHistory(id: string) {
    return this.request(`/tasks/${id}/history`, { method: 'GET' })
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

  async bulkUpdateTasks(taskIds: string[], updates: any) {
    return this.request('/tasks/bulk-update', {
      method: 'PATCH',
      body: JSON.stringify({ task_ids: taskIds, updates }),
    })
  }

  // Report methods
  async getReports(page = 1, limit = 10) {
    return this.request(`/reports?page=${page}&limit=${limit}`, { method: 'GET' })
  }

  async getMyReports() {
    return this.request('/reports', { method: 'GET' })
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
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async updateReportStatus(id: string, status: string) {
    return this.request(`/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  async deleteReport(id: string) {
    return this.request(`/reports/${id}`, { method: 'DELETE' })
  }

  async uploadReportAttachment(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', 'report')
    formData.append('is_public', 'false')

    const headers: HeadersInit = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${this.baseURL}/files/upload`, {
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

  // Meeting methods
  async getMeetings(type?: string, status?: string) {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    if (status) params.append('status', status)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/meetings${queryString}`, { method: 'GET' })
  }

  async getMyMeetings() {
    return this.request('/meetings', { method: 'GET' })
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
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async registerForMeeting(id: string) {
    return this.request(`/meetings/${id}/register`, { method: 'POST' })
  }

  async deleteMeeting(id: string) {
    return this.request(`/meetings/${id}`, { method: 'DELETE' })
  }

  // Event methods
  async getEvents(type?: string, status?: string, featured?: boolean) {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    if (status) params.append('status', status)
    if (featured !== undefined) params.append('featured', featured.toString())
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return this.request(`/events${queryString}`, { method: 'GET' })
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
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async registerForEvent(id: string) {
    return this.request(`/events/${id}/register`, { method: 'POST' })
  }

  async submitEventFeedback(id: string, rating?: number, comments?: string) {
    return this.request(`/events/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comments }),
    })
  }

  async deleteEvent(id: string) {
    return this.request(`/events/${id}`, { method: 'DELETE' })
  }

  // Notification methods
  async getNotifications() {
    return this.request('/notifications', { method: 'GET' })
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', { method: 'POST' })
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' })
  }

  async getNotificationPreferences() {
    return this.request('/notifications/preferences', { method: 'GET' })
  }

  async updateNotificationPreferences(preferences: any) {
    return this.request('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    })
  }

  // File upload methods
  async uploadFile(file: File, category?: string, isPublic = false) {
    const formData = new FormData()
    formData.append('file', file)
    if (category) formData.append('category', category)
    formData.append('is_public', isPublic.toString())

    const headers: HeadersInit = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${this.baseURL}/files/upload`, {
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

  async getFile(fileId: string) {
    return this.request(`/files/${fileId}`, { method: 'GET' })
  }

  async getUserFiles() {
    return this.request('/files/my-files', { method: 'GET' })
  }

  async deleteFile(fileId: string) {
    return this.request(`/files/${fileId}`, { method: 'DELETE' })
  }

  // Admin methods
  async getAdminDashboardStats() {
    return this.request('/admin/dashboard/stats', { method: 'GET' })
  }

  async getAdminUsers(page = 1, limit = 10) {
    return this.request(`/admin/users?page=${page}&limit=${limit}`, { method: 'GET' })
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  }

  async getAuditLogs(page = 1, limit = 10) {
    return this.request(`/admin/audit-logs?page=${page}&limit=${limit}`, { method: 'GET' })
  }

  async getAdminSettings() {
    return this.request('/admin/settings', { method: 'GET' })
  }

  async updateAdminSetting(key: string, value: any) {
    return this.request(`/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    })
  }

  // Communications (Email templates) methods
  async createEmailTemplate(data: { name: string; subject: string; body: string; variables?: string[] }) {
    return this.request('/communications/email-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getEmailTemplates() {
    return this.request('/communications/email-templates', { method: 'GET' })
  }

  async getEmailTemplateById(id: string) {
    return this.request(`/communications/email-templates/${id}`, { method: 'GET' })
  }

  async updateEmailTemplate(id: string, data: any) {
    return this.request(`/communications/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteEmailTemplate(id: string) {
    return this.request(`/communications/email-templates/${id}`, { method: 'DELETE' })
  }

  async testEmailTemplate(id: string, testData: any) {
    return this.request(`/communications/email-templates/${id}/test`, {
      method: 'POST',
      body: JSON.stringify(testData),
    })
  }

  // Health check and app status
  async getAppRoot() {
    return this.request('/', { method: 'GET' })
  }

  async healthCheck() {
    return this.request('/health', { method: 'GET' })
  }

  async getStatus() {
    return this.request('/status', { method: 'GET' })
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

