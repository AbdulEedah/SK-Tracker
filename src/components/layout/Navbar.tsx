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
  X,
  Wifi,
  WifiOff
} from 'lucide-react'

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut, isOffline } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  return (
    <nav className="bg-[#F5F5F5] border-b-2 border-gray-200 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-black hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-[#00A86B]"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Welcome Message */}
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-black font-['Work_Sans'] whitespace-nowrap overflow-hidden text-ellipsis">
              Welcome back, <span className="text-[#00A86B] font-['Reem_Kufi']">{user?.full_name}</span>!
            </h1>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            {isOffline ? (
              <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full border-2 border-yellow-300">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium font-['Work_Sans']">Offline Mode</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-[#00A86B] text-black px-3 py-1 rounded-full border-2 border-black">
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium font-['Work_Sans']">Online</span>
              </div>
            )}

            {/* Notifications */}
            <button className="p-2 text-black hover:text-[#00A86B] transition-colors rounded-md hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-[#00A86B]"
              >
                <div className="w-8 h-8 bg-[#00A86B] rounded-full flex items-center justify-center border-2 border-black">
                  <User className="h-4 w-4 text-black" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-black font-['Work_Sans']">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500 font-['Work_Sans']">
                    {user?.email}
                  </p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#F5F5F5] rounded-md shadow-lg border-2 border-black z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b-2 border-gray-200">
                      <p className="text-sm font-medium text-black font-['Work_Sans']">{user?.full_name}</p>
                      <p className="text-sm text-gray-500 font-['Work_Sans']">{user?.email}</p>
                      <p className="text-xs text-[#00A86B] capitalize font-semibold font-['Work_Sans'] mt-1">
                        {user?.role}
                      </p>
                    </div>
                    <button className="flex items-center w-full px-4 py-3 text-sm text-black hover:bg-gray-100 transition-colors font-['Work_Sans']">
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-['Work_Sans']"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
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
      <div className="lg:hidden px-4 py-2 border-t border-gray-200">
        <p className="text-sm font-medium text-black font-['Work_Sans'] whitespace-nowrap overflow-hidden text-ellipsis">
          Welcome, <span className="text-[#00A86B]">{user?.full_name}</span>
        </p>
      </div>
    </nav>
  )
}