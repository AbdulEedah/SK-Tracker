export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'member'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'acknowledged' | 'revision_requested'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to: string  // Backend uses this field name
  assignee_id?: string  // For backward compatibility
  assigned_by?: string
  created_by?: string
  due_date?: string
  type?: string
  revision_notes?: string
  metadata?: any
  created_at: string
  updated_at?: string
}

export interface Report {
  id: string
  title: string
  content: string
  user_id: string
  week_start: string
  week_end: string
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected'
  admin_feedback?: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  location: string
  type: string
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description?: string
  start_date: string
  end_date: string
  location: string
  type: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  created_at: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables?: string[]
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id?: string
  details?: any
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface SystemSetting {
  id: string
  key: string
  value: any
  description?: string
  created_at: string
  updated_at: string
}

export interface FileUpload {
  id: string
  filename: string
  original_name: string
  mime_type: string
  size: number
  url: string
  category?: string
  is_public: boolean
  uploaded_by: string
  created_at: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}