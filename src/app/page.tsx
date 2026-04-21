'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/auth/login')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <div className="mx-auto w-32 h-32 flex items-center justify-center mb-8">
            <img 
              src="/kano-logo.png" 
              alt="KANO Logo" 
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A86B] mx-auto mb-4"></div>
          <p className="text-black font-['Work_Sans'] text-lg">Loading Startup Kano...</p>
          <p className="text-gray-600 font-['Work_Sans'] text-sm mt-2">Innovation Hub</p>
        </div>
      </div>
    )
  }

  return null
}