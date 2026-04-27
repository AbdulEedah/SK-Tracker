'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Mail, Lock, Eye, EyeOff, Phone, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn, isOffline } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn(email, password)
      
      if (result.success) {
        toast.success('Successfully signed in!')
        router.push('/dashboard')
      } else {
        setError(result.error || 'Sign in failed')
        toast.error(result.error || 'Sign in failed')
      }
    } catch (error) {
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-['Work_Sans']">
            Startup Kano Innovation Hub
          </p>
        </div>

        {isOffline && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 font-['Work_Sans']">
                  Offline Mode Active
                </h3>
                <div className="mt-2 text-sm text-yellow-700 font-['Work_Sans']">
                  <p>Use these credentials to test offline functionality:</p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li><strong>Admin:</strong> admin@startupkano.com / admin123</li>
                    <li><strong>Member:</strong> user@startupkano.com / user123</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="text-2xl font-['Reem_Kufi'] text-black">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border-2 border-red-400 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800 font-['Work_Sans']">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <Input
                label="Email or Phone Number"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or phone number"
                icon={email.includes('@') ? <Mail className="h-5 w-5 text-gray-400" /> : <Phone className="h-5 w-5 text-gray-400" />}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-[#00A86B] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!email || !password}
              >
                Sign In
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 font-['Work_Sans']">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="font-medium text-[#00A86B] hover:text-black transition-colors">
                    Sign up here
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