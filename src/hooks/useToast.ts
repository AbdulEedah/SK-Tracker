import { useState, useCallback } from 'react'
import { ToastProps } from '@/components/ui/Toast'

interface ToastOptions {
  title?: string
  message: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: ToastProps = {
      id,
      ...options,
      onClose: (toastId: string) => {
        setToasts(prev => prev.filter(t => t.id !== toastId))
      }
    }

    setToasts(prev => [...prev, toast])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const success = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ message, title, variant: 'success', duration })
  }, [addToast])

  const error = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ message, title, variant: 'error', duration })
  }, [addToast])

  const warning = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ message, title, variant: 'warning', duration })
  }, [addToast])

  const info = useCallback((message: string, title?: string, duration?: number) => {
    return addToast({ message, title, variant: 'info', duration })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  }
}