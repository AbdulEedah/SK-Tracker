import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Report } from '../reports/entities/report.entity';
import { Meeting } from '../meetings/entities/meeting.entity';
import { Event } from '../events/entities/event.entity';
import { AuditLog } from './entities/audit-log.entity';
import { SystemSetting } from './entities/system-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, Report, Meeting, Event, AuditLog, SystemSetting])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
