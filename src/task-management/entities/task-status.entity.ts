// src/entities/task-status.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}