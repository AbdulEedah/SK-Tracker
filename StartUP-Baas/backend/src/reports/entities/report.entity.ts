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

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'date' })
  week_start: Date;

  @Column({ type: 'date' })
  week_end: Date;

  @Column({ default: 'submitted', length: 20 })
  status: string;

  @Column({ type: 'text', nullable: true })
  admin_feedback: string;

  @Column({ type: 'datetime', nullable: true })
  submitted_at: Date;

  @Column({ type: 'datetime', nullable: true })
  reviewed_at: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;
}
