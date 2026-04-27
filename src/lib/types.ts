export interface User {
  id: string
  email: string
  full_name: string
  phone_number?: string
  role: 'admin' | 'member'
  is_active: boolean
  created_at: string
  password?: string // For offline users only
}

export interface Task {
  id: string
  title: string
  description: string
  type: 'personal' | 'assigned'
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'acknowledged' | 'revision_requested'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to: string
  assigned_by?: string
  is_personal: boolean
  sort_order?: number
  accepted_at?: string
  completed_at?: string
  acknowledged_at?: string
  revision_notes?: string
  created_at: string
  updated_at: string
}

export interface WeeklyReport {
  id: string
  user_id: string
  week_start: string
  week_end: string
  accomplishments: string
  challenges: string
  next_week_goals: string
  submitted_at: string
}

export interface Meeting {
  id: string
  title: string
  description?: string
  scheduled_at: string
  participants: string[]
  created_by: string
  created_at: string
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

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  isOffline: boolean
}