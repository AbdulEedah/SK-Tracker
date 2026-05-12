import React from 'react'
import { AlertTriangle, Trash2, CheckCircle, Info } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info'
  loading?: boolean
  children?: React.ReactNode
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  children
}: ConfirmDialogProps) {
  const variantConfig = {
    default: {
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      confirmVariant: 'primary' as const,
      title: title || 'Confirm Action'
    },
    danger: {
      icon: Trash2,
      iconColor: 'text-red-600',
      confirmVariant: 'danger' as const,
      title: title || 'Confirm Deletion'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      confirmVariant: 'primary' as const,
      title: title || 'Warning'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      confirmVariant: 'primary' as const,
      title: title || 'Confirm'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      confirmVariant: 'primary' as const,
      title: title || 'Information'
    }
  }

  const config = variantConfig[variant]
  const IconComponent = config.icon

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
      showCloseButton={false}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
          <IconComponent className={cn('h-8 w-8', config.iconColor)} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 font-['Reem_Kufi'] mb-2">
          {config.title}
        </h3>

        {/* Message */}
        {message && (
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            {message}
          </p>
        )}

        {/* Custom content */}
        {children && (
          <div className="mb-6">
            {children}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            size="md"
          >
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            loading={loading}
            size="md"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}