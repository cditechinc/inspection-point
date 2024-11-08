// src/entities/task-type.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
  } from 'typeorm';
  import { Client } from './../../client/entities/client.entity';
  import { Services } from './../../invoice/entities/services.entity';
  
  @Entity('task_types')
  @Unique(['name', 'client'])
  export class TaskType {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ length: 100 })
    name: string;
  
    @ManyToOne(() => Client, { onDelete: 'CASCADE' })
    @Index()
    client: Client;
  
    @Column({ default: false })
    isDefault: boolean; // If true, cannot be edited or deleted
  
    @ManyToOne(() => Services, { nullable: true, onDelete: 'SET NULL' })
    @Index()
    pairedServiceFee: Services;
  
    @Column({ default: false })
    pairedServiceFeeQuantityRequired: boolean;
  
    @Column({ type: 'integer', nullable: true })
    taskWeight: number;
  
    @Column({ type: 'integer', nullable: true })
    baseTaskWorkTime: number;
  
    @Column({ length: 50, nullable: true })
    categories: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  