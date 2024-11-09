import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskStatusHistory } from '../entities/task-status-history.entity';
import { Task } from '../entities/task.entity';
import { Client } from './../../client/entities/client.entity';
import { TaskStatus } from '../entities/task-status.entity';
import { User } from './../../user/entities/user.entity';

@Injectable()
export class TaskStatusHistoryService {
  constructor(
    @InjectRepository(TaskStatusHistory)
    private readonly taskStatusHistoryRepository: Repository<TaskStatusHistory>,
  ) {}

  async createStatusHistory(data: {
    taskId: string;
    clientId: string;
    statusId: string;
    userId: string;
    location?: string;
    delayedReason?: string;
  }): Promise<TaskStatusHistory> {
    const { taskId, clientId, statusId, userId, location, delayedReason } = data;

    const taskStatusHistory = this.taskStatusHistoryRepository.create({
      task: { id: taskId } as Task,
      client: { id: clientId } as Client,
      taskStatus: { id: statusId } as TaskStatus,
      createdByUser: { id: userId } as User,
      location,
      delayedReason,
    });
    return this.taskStatusHistoryRepository.save(taskStatusHistory);
  }

  async findByTask(taskId: string): Promise<TaskStatusHistory[]> {
    return this.taskStatusHistoryRepository.find({
      where: { task: { id: taskId } },
      relations: ['taskStatus', 'createdByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<TaskStatusHistory> {
    return this.taskStatusHistoryRepository.findOne({
      where: { id },
      relations: ['task', 'taskStatus', 'createdByUser'],
    });
  }

  // Additional methods as needed
}