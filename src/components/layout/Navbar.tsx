'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { 
  User, 
  LogOut, 
  Settings, 
  Bell, 
  Menu, 
  X
} from 'lucide-react'
import { PdfIndicator } from '@/components/ui/PdfIndicator'

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  return (
    <nav className="bg-white border-b border-gray-100 h-24 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={onMenuClick}
              className="p-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Menu className="h-7 w-7" />
            </button>
          </div>

          {/* Welcome Message */}
          <div className="hidden lg:block max-w-xl">
            <p className="text-3xl font-black text-gray-900 font-sans truncate welcome-message" style={{ fontWeight: 950 }}>
              Welcome back, <span className="text-emerald-600 font-black" style={{ fontWeight: 950 }}>{user?.full_name?.split(' ')[0]}</span>
            </p>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-5">
            {/* Notifications */}
            <button className="p-2.5 text-gray-700 hover:text-emerald-600 transition-all duration-300 rounded-xl hover:bg-gray-50 hover:-translate-y-0.5">
              <Bell className="h-6 w-6" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-base font-bold text-gray-800 font-sans">
                    {user?.full_name}
                  </p>
                  <p className="text-sm text-gray-500 font-sans">
                    {user?.email}
                  </p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border-none z-50">
                  <div className="py-2">
                    <div className="px-5 py-3 border-b border-gray-100">
                      <p className="text-base font-black text-gray-800 font-sans" style={{ fontWeight: 950 }}>{user?.full_name}</p>
                      <p className="text-sm text-gray-600 font-sans">{user?.email}</p>
                      <p className="text-xs text-emerald-600 capitalize font-black font-sans mt-1 bg-emerald-50 px-2 py-1 rounded-full inline-block" style={{ fontWeight: 950 }}>
                        {user?.role}
                      </p>
                      {user?.id && (
                        <div className="mt-2">
                          <PdfIndicator userId={user.id} size="sm" />
                        </div>
                      )}
                    </div>
                    <button className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300 font-sans rounded-xl mx-2 my-1">
                      <User className="h-5 w-5 mr-3" />
                      <Link href="/profile" className="flex-1 text-left">
                        My Profile
                      </Link>
                    </button>
                    <button className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-300 font-sans rounded-xl mx-2 my-1">
                      <Settings className="h-5 w-5 mr-3" />
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-5 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-300 font-sans rounded-xl mx-2 my-1"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile user info */}
      <div className="lg:hidden px-4 py-3 border-t border-gray-100">
        <p className="text-xl font-black text-gray-900 font-sans truncate welcome-message max-w-md" style={{ fontWeight: 950 }}>
          Welcome, <span className="text-emerald-600 font-black" style={{ fontWeight: 950 }}>{user?.full_name?.split(' ')[0]}</span>
        </p>
      </div>
    </nav>
  )
}