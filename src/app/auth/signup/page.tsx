'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle } from 'lucide-react'
import { formatPhoneNumber, validatePhoneNumber } from '@/lib/utils'
import { toast } from 'sonner'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { signUp, isOffline } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid Nigerian phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const phoneNumber = formData.phoneNumber ? formatPhoneNumber(formData.phoneNumber) : undefined
      
      const result = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        phoneNumber
      )
      
      if (result.success) {
        toast.success('Account created successfully! Please check your email to verify your account.')
        router.push('/auth/login')
      } else {
        toast.error(result.error || 'Registration failed')
        setErrors({ general: result.error || 'Registration failed' })
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      setErrors({ general: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (isOffline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className="border-2 border-black">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
                <h2 className="mt-4 text-lg font-semibold text-black font-['Reem_Kufi']">
                  Registration Unavailable
                </h2>
                <p className="mt-2 text-sm text-gray-600 font-['Work_Sans']">
                  Registration requires an internet connection. Please try again when you're online.
                </p>
                <Link href="/auth/login" className="mt-4 inline-block">
                  <Button>Back to Login</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 flex items-center justify-center">
            <img 
              src="/kano-logo.png" 
              alt="KANO Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="mt-6 text-4xl font-extrabold text-black font-['Reem_Kufi']">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-['Work_Sans']">
            Join Startup Kano Innovation Hub
          </p>
        </div>

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-2xl font-['Reem_Kufi'] text-black">Create Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                icon={<User className="h-5 w-5 text-gray-400" />}
                error={errors.fullName}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                icon={<Mail className="h-5 w-5 text-gray-400" />}
                error={errors.email}
                required
              />

              <Input
                label="Phone Number (Optional)"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="e.g., 08012345678 or +2348012345678"
                icon={<Phone className="h-5 w-5 text-gray-400" />}
                error={errors.phoneNumber}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a password (min. 6 characters)"
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                  error={errors.password}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                  error={errors.confirmPassword}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
              >
                Create Account
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}