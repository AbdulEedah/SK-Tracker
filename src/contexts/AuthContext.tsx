'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthContextType } from '@/lib/types'
import { apiClient, mockUsers, checkBackendConnection } from '@/lib/api'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check if backend is available
      const backendAvailable = await checkBackendConnection()
      
      if (!backendAvailable) {
        setIsOffline(true)
        // Use mock user for offline development
        const mockUser = mockUsers[0]
        setUser(mockUser as User)
        setLoading(false)
        return
      }

      setIsOffline(false)

      // Check if user is logged in by trying to get current user
      const result = await apiClient.getCurrentUser()
      
      if (result.success && result.data) {
        setUser(result.data as User)
      } else {
        setUser(null)
        apiClient.clearToken()
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
      apiClient.clearToken()
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      if (isOffline) {
        // Mock authentication for offline mode
        const mockUser = mockUsers.find(u => u.email === email)
        if (mockUser) {
          setUser(mockUser as User)
          return { success: true }
        } else {
          return { success: false, error: 'Invalid credentials' }
        }
      }

      const result = await apiClient.signIn(email, password)
      
      if (result.success && result.data) {
        // In a real implementation, the API would return user data
        // For now, we'll use the result data directly or fetch user info
        setUser(result.data as User)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: result.error?.message || 'Login failed' 
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      }
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    phoneNumber?: string
  ) => {
    try {
      if (isOffline) {
        return { 
          success: false, 
          error: 'Cannot create account in offline mode' 
        }
      }

      const result = await apiClient.signUp(email, password, fullName, phoneNumber)
      
      if (result.success && result.data) {
        // In a real implementation, the API would return user data
        // For now, we'll use the result data directly
        setUser(result.data as User)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: result.error?.message || 'Registration failed' 
        }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      }
    }
  }

  const signOut = async () => {
    try {
      if (!isOffline) {
        await apiClient.signOut()
      }
      
      setUser(null)
      apiClient.clearToken()
    } catch (error) {
      console.error('Sign out error:', error)
      // Still clear local state even if API call fails
      setUser(null)
      apiClient.clearToken()
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isOffline
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}