// src/entities/task-status-history.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Index,
    CreateDateColumn,
  } from 'typeorm';
  import { Client } from './../../client/entities/client.entity';
  import { TaskStatus } from './task-status.entity';
  import { Task } from './task.entity';
  import { User } from './../../user/entities/user.entity';
  
  @Entity('task_status_history')
  export class TaskStatusHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @CreateDateColumn()
    createdAt: Date; // Task Status Date
  
    @ManyToOne(() => Client, { onDelete: 'CASCADE' })
    @Index()
    client: Client;
  
    @ManyToOne(() => TaskStatus, { nullable: false, onDelete: 'SET NULL' })
    @Index()
    taskStatus: TaskStatus;
  
    @ManyToOne(() => Task, (task) => task.statusHistory, { onDelete: 'CASCADE' })
    @Index()
    task: Task;
  
    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @Index()
    createdByUser: User;
  
    @Column({ type: 'point', nullable: true })
    location: string; // GPS lat/long
  
    @Column({ type: 'text', nullable: true })
    delayedReason: string;
  }
  