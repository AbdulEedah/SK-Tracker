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
    blue: 'bg-blue-500 text-white border-2 border-black',
    green: 'bg-[#00A86B] text-black border-2 border-black',
    yellow: 'bg-yellow-500 text-black border-2 border-black',
    red: 'bg-red-500 text-white border-2 border-black',
    purple: 'bg-purple-500 text-white border-2 border-black'
  }

  const bgColorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50'
  }

  return (
    <Card className="border-2 border-black hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-4 rounded-md ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 font-['Work_Sans']">{title}</p>
            <p className="text-3xl font-bold text-black font-['Reem_Kufi'] mt-1">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1 font-['Work_Sans']">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}