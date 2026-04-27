'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Users, 
  Settings,
  BarChart3,
  UserCheck
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  const memberNavItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/tasks', icon: CheckSquare, label: 'My Tasks' },
    { href: '/meetings', icon: Calendar, label: 'Meetings' },
    { href: '/events', icon: Calendar, label: 'Events' },
    { href: '/reports', icon: FileText, label: 'Reports' },
  ]

  const adminNavItems = [
    { href: '/admin', icon: BarChart3, label: 'Dashboard' },
    { href: '/admin/tasks', icon: CheckSquare, label: 'Manage Tasks' },
    { href: '/admin/reports', icon: FileText, label: 'Reports' },
    { href: '/admin/events', icon: Calendar, label: 'Events' },
    { href: '/admin/meetings', icon: Calendar, label: 'Meetings' },
    { href: '/admin/users', icon: Users, label: 'Users' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className={`
      fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#F5F5F5] border-r-2 border-[#00A86B] 
      transform transition-transform duration-200 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="flex flex-col h-full">
        {/* Logo Area */}
        <div className="p-6 border-b-2 border-gray-200">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/kano-logo.png" 
                alt="KANO Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-black text-lg font-['Reem_Kufi'] leading-tight">
                Startup Kano
              </span>
              <span className="text-xs text-gray-600 font-['Work_Sans']">
                Innovation Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {/* Main Navigation */}
          <div className="space-y-1">
            {memberNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-[#00A86B] text-black border-2 border-black shadow-sm'
                      : 'text-black hover:bg-gray-100 border-2 border-transparent'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-['Work_Sans']">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Admin Panel */}
          {user?.role === 'admin' && (
            <div className="pt-6">
              <div className="px-4 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-['Work_Sans']">
                  Admin Panel
                </h3>
              </div>
              <div className="space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200
                        ${isActive(item.href)
                          ? 'bg-[#00A86B] text-black border-2 border-black shadow-sm'
                          : 'text-black hover:bg-gray-100 border-2 border-transparent'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-['Work_Sans']">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t-2 border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500 font-['Work_Sans']">
              © 2024 Startup Kano Innovation Hub
            </p>
            <p className="text-xs text-gray-400 mt-1 font-['Work_Sans']">
              All rights reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}