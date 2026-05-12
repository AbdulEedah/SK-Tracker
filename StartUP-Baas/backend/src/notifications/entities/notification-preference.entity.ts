import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @Column({ default: true })
  email_notifications: boolean;

  @Column({ default: true })
  push_notifications: boolean;

  @Column({ default: true })
  task_assignments: boolean;

  @Column({ default: true })
  task_updates: boolean;

  @Column({ default: true })
  meeting_reminders: boolean;

  @Column({ default: true })
  event_announcements: boolean;

  @Column({ default: true })
  report_feedback: boolean;

  @Column({ default: false })
  system_updates: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
