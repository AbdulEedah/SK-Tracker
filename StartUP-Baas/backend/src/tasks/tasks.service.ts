import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { TaskHistory } from './entities/task-history.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskHistory)
    private readonly taskHistoryRepo: Repository<TaskHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: string, createTaskDto: any) {
    const isPersonal = createTaskDto.type === 'personal';
    const assignedTo = isPersonal ? userId : createTaskDto.assigned_to;

    if (!isPersonal && !assignedTo) {
      throw new Error('Assigned user is required for assigned tasks');
    }

    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      type: createTaskDto.type,
      priority: createTaskDto.priority || 'medium',
      assigned_to: assignedTo,
      assigned_by: userId,
      is_personal: isPersonal,
      due_date: createTaskDto.due_date,
    });

    const savedTask = await this.taskRepository.save(task);

    await this.taskHistoryRepo.save({
      task_id: savedTask.id,
      action: 'create',
      changed_by: userId,
      notes: 'Task created',
    });

    return savedTask;
  }

  async findAll(userId: string, role: string, type?: string, status?: string) {
    let query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.assigner', 'assigner')
      .orderBy('task.created_at', 'DESC');

    if (role !== 'admin') {
      // Normal users can only see tasks assigned to them or by them
      query = query.where(
        '(task.assigned_to = :userId OR task.assigned_by = :userId)',
        { userId },
      );
    }

    if (type) query = query.andWhere('task.type = :type', { type });
    if (status) query = query.andWhere('task.status = :status', { status });

    const tasks = await query.getMany();
    return { success: true, data: tasks };
  }

  async findOne(id: string, userId: string, role: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignee', 'assigner', 'history'],
    });

    if (!task) throw new NotFoundException('Task not found');

    if (
      role !== 'admin' &&
      task.assigned_to !== userId &&
      task.assigned_by !== userId
    ) {
      throw new ForbiddenException('No permission to view this task');
    }

    return { success: true, data: task };
  }

  async updateStatus(
    id: string,
    userId: string,
    statusDto: { status: string; notes?: string },
  ) {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    if (task.assigned_to !== userId && task.assigned_by !== userId) {
      throw new ForbiddenException('No permission to update this task');
    }

    const oldStatus = task.status;
    task.status = statusDto.status;

    if (statusDto.status === 'completed') task.completed_at = new Date();
    if (statusDto.status === 'accepted') task.accepted_at = new Date();
    if (statusDto.status === 'acknowledged') task.acknowledged_at = new Date();

    const savedTask = await this.taskRepository.save(task);

    await this.taskHistoryRepo.save({
      task_id: task.id,
      action: 'status_changed',
      old_value: oldStatus,
      new_value: statusDto.status,
      changed_by: userId,
      notes: statusDto.notes,
    });

    return { success: true, data: savedTask };
  }

  async remove(id: string, userId: string, role: string) {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    if (role !== 'admin' && task.assigned_by !== userId) {
      throw new ForbiddenException(
        'Only task assigner or admin can delete task',
      );
    }

    await this.taskRepository.remove(task);
    return { success: true };
  }

  async getMyTasks(userId: string, status?: string, priority?: string) {
    let query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.assigner', 'assigner')
      .where('task.assigned_to = :userId', { userId })
      .orderBy('task.due_date', 'ASC');

    if (status) query = query.andWhere('task.status = :status', { status });
    if (priority)
      query = query.andWhere('task.priority = :priority', { priority });

    const tasks = await query.getMany();
    return { success: true, data: tasks };
  }

  async getOverdueTasks(userId: string, daysOverdue: number = 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.assigner', 'assigner')
      .where('task.assigned_to = :userId', { userId })
      .andWhere('task.due_date < :cutoffDate', { cutoffDate })
      .andWhere('task.status != :status', { status: 'completed' })
      .orderBy('task.due_date', 'ASC')
      .getMany();

    return { success: true, data: tasks };
  }

  async searchTasks(
    userId: string,
    role: string,
    searchParams: {
      query?: string;
      status?: string;
      priority?: string;
      type?: string;
      assigned_to?: string;
      assigned_by?: string;
    },
  ) {
    let queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.assigner', 'assigner');

    // Permission filtering
    if (role !== 'admin') {
      queryBuilder = queryBuilder.where(
        '(task.assigned_to = :userId OR task.assigned_by = :userId)',
        { userId },
      );
    }

    // Search by title or description
    if (searchParams.query) {
      queryBuilder = queryBuilder.andWhere(
        '(task.title ILIKE :query OR task.description ILIKE :query)',
        { query: `%${searchParams.query}%` },
      );
    }

    // Filter by status
    if (searchParams.status) {
      queryBuilder = queryBuilder.andWhere('task.status = :status', {
        status: searchParams.status,
      });
    }

    // Filter by priority
    if (searchParams.priority) {
      queryBuilder = queryBuilder.andWhere('task.priority = :priority', {
        priority: searchParams.priority,
      });
    }

    // Filter by type
    if (searchParams.type) {
      queryBuilder = queryBuilder.andWhere('task.type = :type', {
        type: searchParams.type,
      });
    }

    // Filter by assigned_to
    if (searchParams.assigned_to) {
      queryBuilder = queryBuilder.andWhere('task.assigned_to = :assigned_to', {
        assigned_to: searchParams.assigned_to,
      });
    }

    // Filter by assigned_by
    if (searchParams.assigned_by) {
      queryBuilder = queryBuilder.andWhere('task.assigned_by = :assigned_by', {
        assigned_by: searchParams.assigned_by,
      });
    }

    const tasks = await queryBuilder
      .orderBy('task.created_at', 'DESC')
      .getMany();
    return { success: true, data: tasks };
  }

  async getTaskHistory(taskId: string, userId: string) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    if (task.assigned_to !== userId && task.assigned_by !== userId) {
      throw new ForbiddenException('No permission to view task history');
    }

    const history = await this.taskHistoryRepo.find({
      where: { task_id: taskId },
      order: { created_at: 'DESC' },
    });

    return { success: true, data: history };
  }

  async update(id: string, userId: string, updateDto: any) {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    if (task.assigned_to !== userId && task.assigned_by !== userId) {
      throw new ForbiddenException('No permission to update this task');
    }

    // Track changes for history
    const changes: any = {};
    if (updateDto.title && updateDto.title !== task.title) {
      changes.title = { old: task.title, new: updateDto.title };
      task.title = updateDto.title;
    }
    if (updateDto.description && updateDto.description !== task.description) {
      changes.description = {
        old: task.description,
        new: updateDto.description,
      };
      task.description = updateDto.description;
    }
    if (updateDto.priority && updateDto.priority !== task.priority) {
      changes.priority = { old: task.priority, new: updateDto.priority };
      task.priority = updateDto.priority;
    }
    if (updateDto.due_date && updateDto.due_date !== task.due_date) {
      changes.due_date = { old: task.due_date, new: updateDto.due_date };
      task.due_date = updateDto.due_date;
    }
    if (updateDto.status && updateDto.status !== task.status) {
      changes.status = { old: task.status, new: updateDto.status };
      task.status = updateDto.status;
    }

    const savedTask = await this.taskRepository.save(task);

    if (Object.keys(changes).length > 0) {
      await this.taskHistoryRepo.save({
        task_id: task.id,
        action: 'update',
        changed_by: userId,
        notes: JSON.stringify(changes),
      });
    }

    return { success: true, data: savedTask };
  }

  async acceptTask(taskId: string, userId: string) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    if (task.assigned_to !== userId) {
      throw new ForbiddenException('Only assigned user can accept this task');
    }

    task.status = 'accepted';
    task.accepted_at = new Date();

    const savedTask = await this.taskRepository.save(task);

    await this.taskHistoryRepo.save({
      task_id: taskId,
      action: 'accept',
      changed_by: userId,
      notes: 'Task accepted by assignee',
    });

    return { success: true, data: savedTask };
  }

  async requestRevision(taskId: string, userId: string, revisionNotes: string) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    task.status = 'revision_requested';
    task.revision_notes = revisionNotes;

    const savedTask = await this.taskRepository.save(task);

    await this.taskHistoryRepo.save({
      task_id: taskId,
      action: 'revision_requested',
      changed_by: userId,
      notes: revisionNotes,
    });

    return { success: true, data: savedTask };
  }

  async bulkUpdate(taskIds: string[], updates: any) {
    const tasks = await this.taskRepository.find({
      where: { id: taskIds as any },
    });

    if (tasks.length === 0) throw new NotFoundException('No tasks found');

    const updatedTasks = tasks.map((task) => {
      if (updates.status) task.status = updates.status;
      if (updates.priority) task.priority = updates.priority;
      if (updates.assigned_to) task.assigned_to = updates.assigned_to;
      return task;
    });

    const saved = await this.taskRepository.save(updatedTasks);

    // Log bulk update history
    for (const task of saved) {
      await this.taskHistoryRepo.save({
        task_id: task.id,
        action: 'bulk_update',
        notes: `Bulk update applied: ${JSON.stringify(updates)}`,
      });
    }

    return { success: true, data: saved, count: saved.length };
  }


    };
  }
}
