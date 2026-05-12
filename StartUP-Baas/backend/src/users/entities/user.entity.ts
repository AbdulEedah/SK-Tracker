import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { Report } from '../../reports/entities/report.entity';
import { Meeting } from '../../meetings/entities/meeting.entity';
import { MeetingRegistration } from '../../meetings/entities/meeting-registration.entity';
import { Event } from '../../events/entities/event.entity';
import { EventRegistration } from '../../events/entities/event-registration.entity';
import { EventFeedback } from '../../events/entities/event-feedback.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { NotificationPreference } from '../../notifications/entities/notification-preference.entity';
import { File } from '../../files/entities/file.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { AuditLog } from '../../admin/entities/audit-log.entity';
import { TaskHistory } from '../../tasks/entities/task-history.entity';
import { SystemSetting } from '../../admin/entities/system-setting.entity';
import { EmailTemplate } from '../../communications/entities/email-template.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  full_name: string;

  @Column({ nullable: true, length: 20 })
  phone_number: string;

  @Column({ default: 'member', length: 20 })
  role: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ type: 'datetime', nullable: true })
  last_login_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
  @OneToMany(() => Task, (task) => task.assignee)
  assigned_tasks: Task[];

  @OneToMany(() => Task, (task) => task.assigner)
  created_tasks: Task[];

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @OneToMany(() => Report, (report) => report.reviewer)
  reviewed_reports: Report[];

  @OneToMany(() => Meeting, (meeting) => meeting.creator)
  created_meetings: Meeting[];

  @OneToMany(() => MeetingRegistration, (registration) => registration.user)
  meeting_registrations: MeetingRegistration[];

  @OneToMany(() => Event, (event) => event.creator)
  created_events: Event[];

  @OneToMany(() => EventRegistration, (registration) => registration.user)
  event_registrations: EventRegistration[];

  @OneToMany(() => EventFeedback, (feedback) => feedback.user)
  event_feedbacks: EventFeedback[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToOne(() => NotificationPreference, (preference) => preference.user)
  notification_prefs: NotificationPreference;

  @OneToMany(() => File, (file) => file.uploader)
  files: File[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refresh_tokens: RefreshToken[];

  @OneToMany(() => AuditLog, (log) => log.user)
  audit_logs: AuditLog[];

  @OneToMany(() => TaskHistory, (history) => history.changer)
  task_history: TaskHistory[];

  @OneToMany(() => SystemSetting, (setting) => setting.updater)
  updated_settings: SystemSetting[];

  @OneToMany(() => EmailTemplate, (template) => template.creator)
  created_templates: EmailTemplate[];
}
