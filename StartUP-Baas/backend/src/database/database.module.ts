import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { TaskHistory } from '../tasks/entities/task-history.entity';
import { Report } from '../reports/entities/report.entity';
import { Meeting } from '../meetings/entities/meeting.entity';
import { MeetingRegistration } from '../meetings/entities/meeting-registration.entity';
import { Event } from '../events/entities/event.entity';
import { EventRegistration } from '../events/entities/event-registration.entity';
import { EventFeedback } from '../events/entities/event-feedback.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { NotificationPreference } from '../notifications/entities/notification-preference.entity';
import { File } from '../files/entities/file.entity';
import { AuditLog } from '../admin/entities/audit-log.entity';
import { SystemSetting } from '../admin/entities/system-setting.entity';
import { EmailTemplate } from '../communications/entities/email-template.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3' as const,
        database: 'dev.db',
        entities: [
          User,
          Task,
          TaskHistory,
          Report,
          Meeting,
          MeetingRegistration,
          Event,
          EventRegistration,
          EventFeedback,
          Notification,
          NotificationPreference,
          File,
          AuditLog,
          SystemSetting,
          EmailTemplate,
          RefreshToken,
        ],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
