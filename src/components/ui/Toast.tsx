import React, { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  id: string
  title?: string
  message: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: (id: string) => void
}

export function Toast({
  id,
  title,
  message,
  variant = 'default',
  duration = 5000,
  onClose
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (duration <= 0) return

    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  const variantStyles = {
    default: {
      bg: 'bg-white/95 border-gray-200/50',
      icon: Info,
      iconColor: 'text-gray-600',
      titleColor: 'text-gray-800'
    },
    success: {
      bg: 'bg-emerald-50/95 border-emerald-200/50',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-800'
    },
    error: {
      bg: 'bg-red-50/95 border-red-200/50',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-800'
    },
    warning: {
      bg: 'bg-amber-50/95 border-amber-200/50',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-800'
    },
    info: {
      bg: 'bg-blue-50/95 border-blue-200/50',
      icon: Info,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800'
    }
  }

  const currentVariant = variantStyles[variant]
  const IconComponent = currentVariant.icon

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-lg transition-all duration-300 transform max-w-md',
        currentVariant.bg,
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        isLeaving && '-translate-x-full opacity-0'
      )}
    >
      <IconComponent className={cn('h-5 w-5 mt-0.5 flex-shrink-0', currentVariant.iconColor)} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn('text-sm font-semibold font-["Work_Sans"] mb-1', currentVariant.titleColor)}>
            {title}
          </h4>
        )}
        <p className="text-sm text-gray-600 leading-relaxed">
          {message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100/50 flex-shrink-0"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastProps[]
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export function ToastContainer({ 
  toasts, 
  position = 'top-right' 
}: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  return (
    <div className={cn('fixed z-50 flex flex-col gap-2', positionClasses[position])}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}