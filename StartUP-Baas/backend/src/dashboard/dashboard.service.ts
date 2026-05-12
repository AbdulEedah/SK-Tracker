import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { Report } from '../reports/entities/report.entity';
import { MeetingRegistration } from '../meetings/entities/meeting-registration.entity';
import { EventRegistration } from '../events/entities/event-registration.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Report) private reportRepo: Repository<Report>,
    @InjectRepository(MeetingRegistration)
    private meetingRegistrationRepo: Repository<MeetingRegistration>,
    @InjectRepository(EventRegistration)
    private eventRegistrationRepo: Repository<EventRegistration>,
  ) {}

  async getUserStats(userId: string) {
    const tasks = await this.taskRepo.find({ where: { assigned_to: userId } });
    const reports = await this.reportRepo.find({ where: { user_id: userId } });
    const meetingRegs = await this.meetingRegistrationRepo.find({
      where: { user_id: userId },
    });
    const eventRegs = await this.eventRegistrationRepo.find({
      where: { user_id: userId },
    });

    return {
      success: true,
      data: {
        tasks: {
          total: tasks.length,
          active: tasks.filter((t) => t.status === 'in_progress').length,
          pending: tasks.filter((t) => t.status === 'pending').length,
          completed: tasks.filter((t) => t.status === 'completed').length,
          acknowledged: tasks.filter((t) => t.status === 'acknowledged').length,
        },
        reports: {
          total: reports.length,
          submitted: reports.filter((r) => r.status === 'submitted').length,
          approved: reports.filter((r) => r.status === 'approved').length,
          pending_review: reports.filter((r) =>
            ['draft', 'submitted'].includes(r.status),
          ).length,
        },
        meetings: {
          upcoming: meetingRegs.filter((m) => m.status === 'registered').length, // Simplification
          attended: meetingRegs.filter((m) => m.status === 'attended').length,
          missed: meetingRegs.filter((m) => m.status === 'no_show').length,
        },
        events: {
          registered: eventRegs.filter((e) => e.status === 'registered').length,
          attended: eventRegs.filter((e) => e.status === 'attended').length,
          upcoming: eventRegs.filter((e) => e.status === 'registered').length,
        },
      },
    };
  }
}
