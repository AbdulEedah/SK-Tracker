import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  position?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className
}: DrawerProps) {
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

  // Prevent body scroll when drawer is open
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
    left: {
      sm: 'w-80',
      md: 'w-96',
      lg: 'w-[32rem]',
      xl: 'w-[40rem]',
      full: 'w-full'
    },
    right: {
      sm: 'w-80',
      md: 'w-96',
      lg: 'w-[32rem]',
      xl: 'w-[40rem]',
      full: 'w-full'
    },
    top: {
      sm: 'h-80',
      md: 'h-96',
      lg: 'h-[32rem]',
      xl: 'h-[40rem]',
      full: 'h-full'
    },
    bottom: {
      sm: 'h-80',
      md: 'h-96',
      lg: 'h-[32rem]',
      xl: 'h-[40rem]',
      full: 'h-full'
    }
  }

  const positionClasses = {
    left: {
      container: 'justify-start',
      panel: 'h-full rounded-r-2xl',
      animation: isOpen ? 'animate-in slide-in-from-left-full' : 'animate-out slide-out-to-left-full'
    },
    right: {
      container: 'justify-end',
      panel: 'h-full rounded-l-2xl',
      animation: isOpen ? 'animate-in slide-in-from-right-full' : 'animate-out slide-out-to-right-full'
    },
    top: {
      container: 'items-start',
      panel: 'w-full rounded-b-2xl',
      animation: isOpen ? 'animate-in slide-in-from-top-full' : 'animate-out slide-out-to-top-full'
    },
    bottom: {
      container: 'items-end',
      panel: 'w-full rounded-t-2xl',
      animation: isOpen ? 'animate-in slide-in-from-bottom-full' : 'animate-out slide-out-to-bottom-full'
    }
  }

  const currentPosition = positionClasses[position]
  const currentSize = sizeClasses[position][size]

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className={cn('flex h-full', currentPosition.container)}>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md transition-all duration-300"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
        
        {/* Drawer Panel */}
        <div
          className={cn(
            'relative bg-white/95 backdrop-blur-xl border-none shadow-2xl flex flex-col transition-all duration-300',
            currentPosition.panel,
            currentPosition.animation,
            currentSize,
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              {title && (
                <h2 className="text-xl font-semibold text-gray-800 font-['Reem_Kufi']">
                  {title}
                </h2>
              )}
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-emerald-600 transition-all duration-300 p-2 rounded-xl hover:bg-gray-50 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  aria-label="Close drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}