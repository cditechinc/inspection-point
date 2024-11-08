// src/entities/client-task-settings.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from './../../client/entities/client.entity';

@Entity('client_task_settings')
export class ClientTaskSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn()
  client: Client;

  @Column({ default: false })
  autoAssignUsersToTask: boolean;

  @Column({ type: 'integer', default: 0 })
  maxInProgressTasksPerUser: number;

  @Column({ default: false })
  allowUsersToCompleteBillTask: boolean;

  @Column({ default: false })
  assignUserToTaskUsingSchedules: boolean;

  @Column({ default: false })
  enableTaskWeights: boolean;

  @Column({ default: false })
  captureTaskStatusGpsLocation: boolean;

  @Column({ default: false })
  automaticTaskArrivalStatus: boolean;

  @Column({ default: false })
  automaticTaskInvoiceCreation: boolean;

  @Column({ length: 50, nullable: true })
  taskInvoiceTheme: string;

  @Column({ default: false })
  taskWeather: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
