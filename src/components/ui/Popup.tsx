import React, { useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PopupProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  children?: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  position?: 'center' | 'top' | 'bottom' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  size?: 'sm' | 'md' | 'lg'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  autoClose?: number // Auto close after X milliseconds
  className?: string
}

export function Popup({
  isOpen,
  onClose,
  title,
  message,
  children,
  variant = 'default',
  position = 'center',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  autoClose,
  className
}: PopupProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Auto close timer
  useEffect(() => {
    if (!isOpen || !autoClose) return

    const timer = setTimeout(() => {
      onClose()
    }, autoClose)

    return () => clearTimeout(timer)
  }, [isOpen, autoClose, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  }

  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-20',
    bottom: 'items-end justify-center pb-20',
    'top-right': 'items-start justify-end pt-20 pr-8',
    'top-left': 'items-start justify-start pt-20 pl-8',
    'bottom-right': 'items-end justify-end pb-20 pr-8',
    'bottom-left': 'items-end justify-start pb-20 pl-8'
  }

  const variantStyles = {
    default: {
      bg: 'bg-white/95',
      border: 'border-gray-200/50',
      icon: null,
      iconColor: '',
      titleColor: 'text-gray-800'
    },
    success: {
      bg: 'bg-emerald-50/95',
      border: 'border-emerald-200/50',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-800'
    },
    warning: {
      bg: 'bg-amber-50/95',
      border: 'border-amber-200/50',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-800'
    },
    error: {
      bg: 'bg-red-50/95',
      border: 'border-red-200/50',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-800'
    },
    info: {
      bg: 'bg-blue-50/95',
      border: 'border-blue-200/50',
      icon: Info,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800'
    }
  }

  const currentVariant = variantStyles[variant]
  const IconComponent = currentVariant.icon

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      <div className={cn('flex min-h-screen p-4 pointer-events-none', positionClasses[position])}>
        {/* Backdrop for center position */}
        {position === 'center' && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 pointer-events-auto"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />
        )}
        
        {/* Popup */}
        <div
          className={cn(
            'relative w-full backdrop-blur-xl rounded-2xl border shadow-2xl transform transition-all duration-300 scale-100 opacity-100 animate-in fade-in-0 zoom-in-95 pointer-events-auto',
            sizeClasses[size],
            currentVariant.bg,
            currentVariant.border,
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6">
            <div className="flex items-start gap-3 flex-1">
              {IconComponent && (
                <IconComponent className={cn('h-5 w-5 mt-0.5 flex-shrink-0', currentVariant.iconColor)} />
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 className={cn('text-lg font-semibold font-["Reem_Kufi"] mb-1', currentVariant.titleColor)}>
                    {title}
                  </h3>
                )}
                {message && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {message}
                  </p>
                )}
                {children && (
                  <div className="mt-3">
                    {children}
                  </div>
                )}
              </div>
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-1 rounded-lg hover:bg-gray-100/50 flex-shrink-0 ml-2"
                aria-label="Close popup"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}