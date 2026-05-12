import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Task } from '../tasks/entities/task.entity';
import { Report } from '../reports/entities/report.entity';
import { MeetingRegistration } from '../meetings/entities/meeting-registration.entity';
import { EventRegistration } from '../events/entities/event-registration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      Report,
      MeetingRegistration,
      EventRegistration,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
