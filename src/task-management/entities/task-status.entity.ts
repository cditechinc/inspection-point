// src/entities/task-status.entity.ts

import { Client } from './../../client/entities/client.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  Index,
} from 'typeorm';

@Entity('task_statuses')
@Unique(['name'])
export class TaskStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 7, default: '#FFFFFF' })
  color: string;

  @Column({ default: false })
  isPastDueProtected: boolean;

  @Column({ default: false })
  isDefault: boolean; // If true, cannot be edited or deleted
  
  @ManyToOne(() => Client, (client) => client.taskStatuses, {
    onDelete: 'CASCADE',
  })
  client: Client;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
