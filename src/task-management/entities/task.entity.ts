// src/entities/task.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
  } from 'typeorm';
  import { Client } from './../../client/entities/client.entity';
  import { User } from './../../user/entities/user.entity';
  import { Customer } from './../../customer/entities/customer.entity';
  import { TaskStatus } from './task-status.entity';
  import { TaskType } from './task-type.entity';
  import { Asset } from './../../assets/entities/asset.entity';
  import { Invoice } from './../../invoice/entities/invoice.entity';
  import { TaskFile } from './task-file.entity';
  import { TaskStatusHistory } from './task-status-history.entity';
  
  @Entity('tasks')
  @Unique(['taskId'])
  export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ length: 10 })
    taskId: string; // Random ID to identify the unique task
  
    @ManyToOne(() => Client, (client) => client.tasks, { onDelete: 'CASCADE' })
    @Index()
    client: Client;
  
    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @Index()
    createdByUser: User;
  
    @ManyToOne(() => Customer, (customer) => customer.tasks, { onDelete: 'CASCADE' })
    @Index()
    customer: Customer;
  
    @ManyToOne(() => TaskStatus, { nullable: true, onDelete: 'SET NULL' })
    @Index()
    taskStatus: TaskStatus;
  
    @ManyToOne(() => TaskType, { nullable: true, onDelete: 'SET NULL' })
    @Index()
    taskType: TaskType;
  
    @Column({
      type: 'enum',
      enum: ['Emergency', 'High', 'Normal', 'Low'],
      default: 'Normal',
    })
    taskPriority: 'Emergency' | 'High' | 'Normal' | 'Low';
  
    @Column({
      type: 'enum',
      enum: ['One-Time', 'Daily', 'Bi-Monthly', 'Monthly', 'Quarterly', 'Annual'],
      default: 'One-Time',
    })
    taskInterval:
      | 'One-Time'
      | 'Daily'
      | 'Bi-Monthly'
      | 'Monthly'
      | 'Quarterly'
      | 'Annual';
  
    @Column({ length: 10, nullable: true })
    @Index()
    taskSetId: string; // Shared among tasks in the same recurring set
  
    @Column({ type: 'timestamp', nullable: true })
    reoccurringEndDate: Date;
  
    @Column({ type: 'timestamp' })
    dueDate: Date;
  
    @Column({ length: 50, nullable: true })
    quickbooksInvoiceNumber: string;
  
    @Column({ default: false })
    archived: boolean;
  
    @Column({ type: 'text', nullable: true })
    weather: string;
  
    @ManyToMany(() => Asset)
    @JoinTable({
      name: 'task_assets',
      joinColumn: { name: 'task_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'asset_id', referencedColumnName: 'id' },
    })
    assets: Asset[];
  
    @ManyToMany(() => User)
    @JoinTable({
      name: 'task_user_assignments',
      joinColumn: { name: 'task_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    assignedUsers: User[];
  
    @OneToMany(() => TaskFile, (taskFile) => taskFile.task)
    files: TaskFile[];
  
    @OneToMany(() => TaskStatusHistory, (statusHistory) => statusHistory.task)
    statusHistory: TaskStatusHistory[];
  
    @ManyToOne(() => Invoice, (invoice) => invoice.tasks, { nullable: true, onDelete: 'SET NULL' })
    invoice: Invoice;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  