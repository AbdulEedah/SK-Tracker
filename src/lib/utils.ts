import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // If it starts with 234, it's already in international format
  if (digits.startsWith('234')) {
    return `+${digits}`
  }
  
  // If it starts with 0, replace with 234
  if (digits.startsWith('0')) {
    return `+234${digits.slice(1)}`
  }
  
  // If it's just the local number, add 234
  if (digits.length === 10) {
    return `+234${digits}`
  }
  
  return phone
}

export function validatePhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone)
  const phoneRegex = /^\+234[789][01]\d{8}$/
  return phoneRegex.test(formatted)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getTaskStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'accepted':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'in_progress':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'acknowledged':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'revision_requested':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500 text-white'
    case 'high':
      return 'bg-orange-500 text-white'
    case 'medium':
      return 'bg-yellow-500 text-white'
    case 'low':
      return 'bg-green-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

export function getWeekDates(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}