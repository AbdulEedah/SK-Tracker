import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  description?: string
}

export function StatsCard({ title, value, icon: Icon, color, description }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg',
    green: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg',
    yellow: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg',
    red: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg'
  }

  return (
    <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-4 rounded-2xl ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">{title}</p>
            <p className="text-3xl font-bold text-gray-800 font-['Reem_Kufi'] mt-1">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1 font-['Work_Sans']">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}