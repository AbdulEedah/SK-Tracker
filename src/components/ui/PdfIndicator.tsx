import React from 'react'
import { FileText, CheckCircle } from 'lucide-react'

interface PdfIndicatorProps {
  userId: string
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const PdfIndicator: React.FC<PdfIndicatorProps> = ({ 
  userId, 
  className = '', 
  showText = true,
  size = 'md'
}) => {
  const [hasPdfs, setHasPdfs] = React.useState(false)
  const [pdfCount, setPdfCount] = React.useState(0)

  React.useEffect(() => {
    const checkUserPdfs = () => {
      try {
        const storedFiles = localStorage.getItem(`user_files_${userId}`)
        if (storedFiles) {
          const files = JSON.parse(storedFiles)
          const pdfFiles = files.filter((file: any) => file.mime_type === 'application/pdf')
          setHasPdfs(pdfFiles.length > 0)
          setPdfCount(pdfFiles.length)
        } else {
          setHasPdfs(false)
          setPdfCount(0)
        }
      } catch (error) {
        console.error('Error checking user PDFs:', error)
        setHasPdfs(false)
        setPdfCount(0)
      }
    }

    checkUserPdfs()

    // Listen for storage changes to update indicator in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `user_files_${userId}`) {
        checkUserPdfs()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events for same-tab updates
    const handleCustomUpdate = () => checkUserPdfs()
    window.addEventListener('userFilesUpdated', handleCustomUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userFilesUpdated', handleCustomUpdate)
    }
  }, [userId])

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  if (!hasPdfs) {
    return null
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="relative">
        <FileText className={`${sizeClasses[size]} text-red-500`} />
        <CheckCircle className="h-3 w-3 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {pdfCount} PDF{pdfCount !== 1 ? 's' : ''} uploaded
        </span>
      )}
    </div>
  )
}

// Helper function to trigger updates across tabs
export const triggerUserFilesUpdate = () => {
  window.dispatchEvent(new CustomEvent('userFilesUpdated'))
}