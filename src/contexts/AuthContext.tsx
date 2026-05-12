'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthContextType } from '@/lib/types'
import { apiClient } from '@/lib/api'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
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
      const result = await apiClient.signIn(email, password)
      
      if (result.success && result.data) {
        // The API returns { token, refresh_token, user }
        const responseData = result.data as any
        if (responseData.user) {
          setUser(responseData.user as User)
          return { 
            success: true, 
            user: responseData.user as User 
          }
        } else {
          // Fallback: fetch user info if not included in login response
          const userResult = await apiClient.getCurrentUser()
          if (userResult.success && userResult.data) {
            setUser(userResult.data as User)
            return { 
              success: true, 
              user: userResult.data as User 
            }
          }
        }
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
    fullName: string
  ) => {
    try {
      const result = await apiClient.signUp(email, password, fullName)
      
      if (result.success && result.data) {
        // The API returns user data on successful signup
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
      await apiClient.signOut()
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
    signOut
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