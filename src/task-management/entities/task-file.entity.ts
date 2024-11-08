import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, CreateDateColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity('task_files')
export class TaskFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, (task) => task.files, { onDelete: 'CASCADE' })
  @Index()
  task: Task;

  @Column({ length: 255 })
  fileUrl: string;

  @Column({
    type: 'enum',
    enum: ['image', 'video', 'document'],
  })
  fileType: 'image' | 'video' | 'document';

  @CreateDateColumn()
  createdAt: Date;
}