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

@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  meeting_date: Date;

  @Column({ type: 'time' })
  meeting_time: string;

  @Column({ default: 60 })
  duration: number;

  @Column({ nullable: true })
  location: string;

  @Column({ default: 'in-person', length: 20 })
  meeting_type: string;

  @Column({ nullable: true })
  max_attendees: number;

  @Column({ default: 'scheduled', length: 20 })
  status: string;

  @Column({ type: 'uuid' })
  created_by: string;

  @Column({ length: 500, nullable: true })
  meeting_url: string;

  @Column({ type: 'text', nullable: true })
  agenda: string;

  @Column({ type: 'text', nullable: true })
  minutes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
