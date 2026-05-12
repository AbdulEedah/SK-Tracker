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

@Entity('event_registrations')
@Unique(['event_id', 'user_id'])
export class EventRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  event_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ default: 'registered', length: 20 })
  status: string;

  @Column({ nullable: true })
  waitlist_position: number;

  @CreateDateColumn()
  registered_at: Date;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
