import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  event_date: Date;

  @Column({ type: 'time' })
  event_time: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  max_participants: number;

  @Column({ type: 'datetime', nullable: true })
  registration_deadline: Date;

  @Column({ default: 'general', length: 50 })
  type: string;

  @Column({ default: 'upcoming', length: 20 })
  status: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ length: 500, nullable: true })
  banner_image: string;

  @Column({ type: 'uuid' })
  created_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
