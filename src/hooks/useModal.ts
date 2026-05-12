import { useState, useCallback } from 'react'

interface ModalState {
  isOpen: boolean
  data?: any
}

export function useModal(initialState: boolean = false) {
  const [state, setState] = useState<ModalState>({
    isOpen: initialState,
    data: undefined
  })

  const openModal = useCallback((data?: any) => {
    setState({ isOpen: true, data })
  }, [])

  const closeModal = useCallback(() => {
    setState({ isOpen: false, data: undefined })
  }, [])

  const toggleModal = useCallback(() => {
    setState(prev => ({ 
      isOpen: !prev.isOpen, 
      data: prev.isOpen ? undefined : prev.data 
    }))
  }, [])

  return {
    isOpen: state.isOpen,
    data: state.data,
    openModal,
    closeModal,
    toggleModal
  }
}