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

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20 })
  type: string;

  @Column({ default: 'pending', length: 30 })
  status: string;

  @Column({ default: 'medium', length: 20 })
  priority: string;

  @Column({ type: 'text' })
  assigned_to: string;

  @Column({ type: 'text', nullable: true })
  assigned_by: string;

  @Column({ default: false })
  is_personal: boolean;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ type: 'datetime', nullable: true })
  due_date: Date;

  @Column({ type: 'datetime', nullable: true })
  accepted_at: Date;

  @Column({ type: 'datetime', nullable: true })
  completed_at: Date;

  @Column({ type: 'datetime', nullable: true })
  acknowledged_at: Date;

  @Column({ type: 'text', nullable: true })
  revision_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_by' })
  assigner: User;
}
