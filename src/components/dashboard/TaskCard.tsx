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
  Flag
} from 'lucide-react'
import { getTaskStatusColor, getPriorityColor, formatDateTime } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onAccept?: (taskId: string) => void
  onComplete?: (taskId: string) => void
  onView?: (task: Task) => void
  showActions?: boolean
}

export function TaskCard({ 
  task, 
  onAccept, 
  onComplete, 
  onView, 
  showActions = true 
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
        return 'bg-[#F5F5F5] text-black border-2 border-black'
      case 'accepted':
      case 'acknowledged':
        return 'bg-[#00A86B] text-black border-2 border-black'
      case 'completed':
      case 'revision_requested':
        return 'bg-black text-white border-2 border-black'
      default:
        return 'bg-[#F5F5F5] text-black border-2 border-black'
    }
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-black'
      case 'low':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const canAccept = task.status === 'pending' && task.type === 'assigned'
  const canComplete = ['accepted', 'in_progress'].includes(task.status)
  const isCompleted = ['completed', 'acknowledged'].includes(task.status)

  return (
    <Card className="hover:shadow-lg transition-all duration-200 min-w-[300px]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-black mb-3 font-['Work_Sans']">
              {task.title}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
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
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border-2 border-black ${getPriorityBadgeClass(task.priority)}`}>
              <Flag className="h-3 w-3 mr-1" />
              {task.priority.toUpperCase()}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
              {getStatusIcon(task.status)}
              <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-black text-sm mb-4 line-clamp-3 leading-relaxed">
          {task.description}
        </p>

        {task.revision_notes && (
          <div className="bg-black border-2 border-[#00A86B] rounded-md p-4 mb-4">
            <h4 className="text-sm font-semibold text-[#00A86B] mb-2">Revision Notes:</h4>
            <p className="text-sm text-white">{task.revision_notes}</p>
          </div>
        )}

        {showActions && (
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView?.(task)}
              className="text-black hover:text-[#00A86B]"
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
              
              {isCompleted && (
                <div className="flex items-center text-[#00A86B] text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>
        )}

        {task.completed_at && (
          <div className="mt-4 pt-3 border-t-2 border-gray-200">
            <p className="text-xs text-gray-500 font-medium">
              Completed on {formatDateTime(task.completed_at)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}