import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-10 transition-opacity"
          onClick={onClose}
        />
        <div
          className={cn(
            'relative w-full bg-[#F5F5F5] rounded-lg border-2 border-black shadow-xl',
            sizeClasses[size]
          )}
        >
          {title && (
            <div className="flex items-center justify-between p-6 border-b-2 border-black">
              <h2 className="text-xl font-semibold text-black font-['Reem_Kufi']">{title}</h2>
              <button
                onClick={onClose}
                className="text-black hover:text-[#00A86B] transition-colors p-1 rounded-md hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}