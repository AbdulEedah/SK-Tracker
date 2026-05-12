import { useState, useCallback } from 'react'

interface ConfirmOptions {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info'
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean
  onConfirm?: () => void | Promise<void>
  loading: boolean
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    loading: false
  })

  const confirm = useCallback((
    onConfirm: () => void | Promise<void>,
    options: ConfirmOptions = {}
  ) => {
    setState({
      isOpen: true,
      onConfirm,
      loading: false,
      ...options
    })
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!state.onConfirm) return

    setState(prev => ({ ...prev, loading: true }))

    try {
      await state.onConfirm()
      setState(prev => ({ ...prev, isOpen: false, loading: false }))
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }))
      // You might want to show an error toast here
      console.error('Confirmation action failed:', error)
    }
  }, [state.onConfirm])

  const handleCancel = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false, loading: false }))
  }, [])

  return {
    ...state,
    confirm,
    handleConfirm,
    handleCancel
  }
}