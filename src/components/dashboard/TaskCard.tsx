import React from 'react'
import { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Calendar,
  Flag,
  Trash2
} from 'lucide-react'
import { getTaskStatusColor, getPriorityColor, formatDateTime } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onAccept?: (taskId: string) => void
  onComplete?: (taskId: string) => void
  onView?: (task: Task) => void
  onDelete?: (taskId: string) => void
  showActions?: boolean
  currentUserId?: string
}

export function TaskCard({ 
  task, 
  onAccept, 
  onComplete, 
  onView, 
  onDelete,
  showActions = true,
  currentUserId
}: TaskCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'completed':
      case 'acknowledged':
        return <CheckCircle className="h-4 w-4" />
      case 'revision_requested':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-50 text-gray-600 border-none'
      case 'accepted':
      case 'acknowledged':
        return 'bg-emerald-50 text-emerald-700 border-none'
      case 'completed':
      case 'revision_requested':
        return 'bg-gray-800 text-white border-none'
      default:
        return 'bg-gray-50 text-gray-600 border-none'
    }
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 text-red-700 border-none'
      case 'high':
        return 'bg-orange-50 text-orange-700 border-none'
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-none'
      case 'low':
        return 'bg-green-50 text-green-700 border-none'
      default:
        return 'bg-gray-50 text-gray-600 border-none'
    }
  }

  const canAccept = task.status === 'pending' && task.type === 'assigned'
  const canComplete = ['accepted', 'in_progress'].includes(task.status)
  const isCompleted = ['completed', 'acknowledged'].includes(task.status)
  const canDelete = currentUserId && (task.created_by === currentUserId || task.type === 'personal')

  return (
    <Card className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 min-w-[320px]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold text-gray-800 mb-3 font-['Work_Sans'] line-height-1.4">
                {task.title}
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(task.created_at)}</span>
                </div>
                {task.type === 'assigned' && (
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>Assigned Task</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-10 ${getPriorityBadgeClass(task.priority)}`}>
              <Flag className="h-3 w-3 mr-1" />
              {task.priority.toUpperCase()}
            </span>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-10 ${getStatusBadgeClass(task.status)}`}>
              {getStatusIcon(task.status)}
              <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
          {task.description}
        </p>

        {task.revision_notes && (
          <div className="bg-red-50/50 border border-red-200/50 rounded-xl p-4 mb-4 backdrop-blur-10">
            <h4 className="text-sm font-semibold text-red-700 mb-2">Revision Notes:</h4>
            <p className="text-sm text-red-600">{task.revision_notes}</p>
          </div>
        )}

        {showActions && (
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView?.(task)}
              className="text-gray-600 hover:text-emerald-600"
            >
              View Details
            </Button>
            
            <div className="flex space-x-2">
              {canAccept && (
                <Button
                  size="sm"
                  onClick={() => onAccept?.(task.id)}
                >
                  Accept Task
                </Button>
              )}
              
              {canComplete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onComplete?.(task.id)}
                >
                  Mark Complete
                </Button>
              )}
              
              {canDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete?.(task.id)}
                  className="text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
              
              {isCompleted && (
                <div className="flex items-center text-emerald-600 text-sm font-medium bg-emerald-50 px-3 py-1.5 rounded-full">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}