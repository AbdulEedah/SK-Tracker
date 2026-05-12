import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from './event.entity';

@Entity('event_feedback')
@Unique(['event_id', 'user_id'])
export class EventFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  event_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ nullable: true })
  would_recommend: boolean;

  @Column({ type: 'text', nullable: true })
  suggestions: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
