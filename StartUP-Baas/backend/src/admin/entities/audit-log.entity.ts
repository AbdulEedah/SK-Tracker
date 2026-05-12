import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  user_id: string;

  @Column({ length: 50 })
  action: string;

  @Column({ length: 50 })
  resource_type: string;

  @Column({ type: 'text', nullable: true })
  resource_id: string;

  @Column({ type: 'text', nullable: true })
  old_values: any;

  @Column({ type: 'text', nullable: true })
  new_values: any;

  @Column({ length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
