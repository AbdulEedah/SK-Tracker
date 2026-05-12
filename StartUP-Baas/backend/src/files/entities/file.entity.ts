import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  original_name: string;

  @Column({ length: 500 })
  file_path: string;

  @Column({ type: 'bigint' })
  file_size: number;

  @Column({ length: 100 })
  mime_type: string;

  @Column({ length: 50 })
  category: string;

  @Column({ type: 'uuid' })
  uploaded_by: string;

  @Column({ length: 50, nullable: true })
  related_resource_type: string;

  @Column({ type: 'uuid', nullable: true })
  related_resource_id: string;

  @Column({ default: false })
  is_public: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;
}
