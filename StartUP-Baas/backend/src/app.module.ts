import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { ReportsModule } from './reports/reports.module';
import { MeetingsModule } from './meetings/meetings.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DatabaseModule } from './database/database.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FilesModule } from './files/files.module';
import { AdminModule } from './admin/admin.module';
import { CommunicationsModule } from './communications/communications.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    TasksModule,
    ReportsModule,
    MeetingsModule,
    EventsModule,
    NotificationsModule,
    DatabaseModule,
    DashboardModule,
    FilesModule,
    AdminModule,
    CommunicationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
