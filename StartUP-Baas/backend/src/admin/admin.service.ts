import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Report } from '../reports/entities/report.entity';
import { Meeting } from '../meetings/entities/meeting.entity';
import { Event } from '../events/entities/event.entity';
import { AuditLog } from './entities/audit-log.entity';
import { SystemSetting } from './entities/system-setting.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
    @InjectRepository(Meeting) private readonly meetingRepo: Repository<Meeting>,
    @InjectRepository(Event) private readonly eventRepo: Repository<Event>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
    @InjectRepository(SystemSetting)
    private readonly settingRepo: Repository<SystemSetting>,
  ) {}

  async getAdminStats() {
    const [users, userCount] = await this.userRepo.findAndCount();
    const activeCount = users.filter((user) => user.is_active).length;

    const tasks = await this.taskRepo.find();
    const reports = await this.reportRepo.find();
    const meetings = await this.meetingRepo.find();
    const events = await this.eventRepo.find();

    return {
      success: true,
      data: {
        users: {
          total: userCount,
          active: activeCount,
          inactive: userCount - activeCount,
        },
        tasks: {
          total: tasks.length,
          pending: tasks.filter((task) => task.status === 'pending').length,
          in_progress: tasks.filter((task) => task.status === 'in_progress').length,
          completed: tasks.filter((task) => task.status === 'completed').length,
        },
        reports: {
          total: reports.length,
          pending_review: reports.filter((report) => report.status === 'submitted').length,
          approved: reports.filter((report) => report.status === 'approved').length,
          rejected: reports.filter((report) => report.status === 'rejected').length,
        },
        meetings: {
          scheduled: meetings.filter((meeting) => meeting.status === 'scheduled').length,
          completed: meetings.filter((meeting) => meeting.status === 'completed').length,
          cancelled: meetings.filter((meeting) => meeting.status === 'cancelled').length,
        },
        events: {
          upcoming: events.filter((event) => event.status === 'upcoming').length,
          completed: events.filter((event) => event.status === 'completed').length,
        },
      },
    };
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [users, total] = await this.userRepo.findAndCount({
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      success: true,
      data: users.map((user) => {
        const { password_hash, ...rest } = user;
        return rest;
      }),
      pagination: { page, limit, total },
    };
  }

  async getUserDetails(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password_hash, ...result } = user;
    return { success: true, data: result };
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const validRoles = ['admin', 'member', 'manager', 'lead'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(
        `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      );
    }

    user.role = role;
    await this.userRepo.save(user);

    return { success: true, data: { id: user.id, role: user.role } };
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = isActive;
    await this.userRepo.save(user);

    return { success: true, data: { id: user.id, is_active: user.is_active } };
  }

  async deleteUser(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.is_active = false;
    await this.userRepo.save(user);

    return { success: true, message: 'User deactivated successfully' };
  }

  async getAuditLogs(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [logs, total] = await this.auditLogRepo.findAndCount({
      skip,
      take: limit,
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    return {
      success: true,
      data: logs,
      pagination: { page, limit, total },
    };
  }

  async getSystemSettings() {
    const settings = await this.settingRepo.find({
      order: { key: 'ASC' },
    });

    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return { success: true, data: settingsObj };
  }

  async updateSystemSetting(key: string, value: string) {
    let setting = await this.settingRepo.findOne({ where: { key } });

    if (!setting) {
      setting = this.settingRepo.create({ key, value });
    } else {
      setting.value = value;
    }

    await this.settingRepo.save(setting);
    return { success: true, data: { key, value } };
  }
}
