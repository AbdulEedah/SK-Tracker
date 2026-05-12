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
      fixed lg:static inset-y-0 left-0 z-50 w-72 
      bg-gradient-to-br from-emerald-500/95 via-emerald-600/95 to-emerald-700/95
      backdrop-blur-3xl border-none
      shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      relative overflow-hidden
    `}>
      {/* Glass overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/2 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="flex flex-col h-full relative z-10">
        {/* Logo Area */}
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-xl font-['Outfit']">K</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-white text-lg font-accent leading-tight drop-shadow-sm">
                Startup Kano
              </span>
              <span className="text-sm text-white/80 font-sans font-medium">
                Innovation Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
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
                    group flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden border-none
                    ${isActive(item.href)
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                      : 'text-white/90 hover:bg-white/10 hover:text-white hover:shadow-md hover:translate-x-1 hover:backdrop-blur-sm'
                    }
                  `}
                >
                  {!isActive(item.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}
                  <Icon className="h-5 w-5 relative z-10 drop-shadow-sm" />
                  <span className="font-['Inter'] font-medium relative z-10 drop-shadow-sm">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Admin Panel */}
          {user?.role === 'admin' && (
            <div className="pt-6">
              <div className="px-4 mb-3">
                <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider font-['Inter'] drop-shadow-sm">
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
                        group flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative overflow-hidden border-none
                        ${isActive(item.href)
                          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                          : 'text-white/90 hover:bg-white/10 hover:text-white hover:shadow-md hover:translate-x-1 hover:backdrop-blur-sm'
                        }
                      `}
                    >
                      {!isActive(item.href) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      )}
                      <Icon className="h-5 w-5 relative z-10 drop-shadow-sm" />
                      <span className="font-['Inter'] font-medium relative z-10 drop-shadow-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-xs text-white/70 font-['Inter'] drop-shadow-sm">
              © 2024 Startup Kano Innovation Hub
            </p>
            <p className="text-xs text-white/60 mt-1 font-['Inter'] font-light">
              All rights reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}