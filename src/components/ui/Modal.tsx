import React, { useEffect } from 'react'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className
}: ModalProps) {
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4'
  }

  const variantStyles = {
    default: {
      header: 'border-gray-100',
      icon: null,
      iconColor: ''
    },
    success: {
      header: 'border-emerald-100 bg-emerald-50/50',
      icon: CheckCircle,
      iconColor: 'text-emerald-600'
    },
    warning: {
      header: 'border-amber-100 bg-amber-50/50',
      icon: AlertTriangle,
      iconColor: 'text-amber-600'
    },
    error: {
      header: 'border-red-100 bg-red-50/50',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    },
    info: {
      header: 'border-blue-100 bg-blue-50/50',
      icon: Info,
      iconColor: 'text-blue-600'
    }
  }

  const currentVariant = variantStyles[variant]
  const IconComponent = currentVariant.icon

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md transition-all duration-300"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
        
        {/* Modal */}
        <div
          className={cn(
            'relative w-full bg-white/95 backdrop-blur-xl rounded-2xl border-none shadow-2xl transform transition-all duration-300 scale-100 opacity-100 animate-in fade-in-0 zoom-in-95',
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className={cn(
              'flex items-center justify-between p-6 border-b',
              currentVariant.header
            )}>
              <div className="flex items-center gap-3">
                {IconComponent && (
                  <IconComponent className={cn('h-5 w-5', currentVariant.iconColor)} />
                )}
                {title && (
                  <h2 className="text-xl font-semibold text-gray-800 font-['Reem_Kufi']">
                    {title}
                  </h2>
                )}
              </div>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-emerald-600 transition-all duration-300 p-2 rounded-xl hover:bg-gray-50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}