// src/task-management/services/task.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from '../entities/task.entity';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TaskStatusService } from './task-status.service';
import { TaskStatusHistory } from '../entities/task-status-history.entity';
import { TaskStatus } from '../entities/task-status.entity';
import { ClientTaskSettings } from '../entities/client-task-settings.entity';
import { User } from '../../user/entities/user.entity';
import { Asset } from '../../assets/entities/asset.entity';
import { TaskType } from '../entities/task-type.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(TaskStatusHistory)
    private readonly taskStatusHistoryRepository: Repository<TaskStatusHistory>,

    @InjectRepository(TaskStatus)
    private readonly taskStatusRepository: Repository<TaskStatus>,

    @InjectRepository(ClientTaskSettings)
    private readonly clientTaskSettingsRepository: Repository<ClientTaskSettings>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    @InjectRepository(TaskType)
    private readonly taskTypeRepository: Repository<TaskType>,

    // Inject other services and repositories as needed
  ) {}

  async create(createTaskDto: CreateTaskDto, clientId: string, userId: string): Promise<Task[]> {
    const {
      customerId,
      taskTypeId,
      taskPriority,
      taskInterval,
      dueDate,
      reoccurringEndDate,
      assetIds,
      assignedUserIds,
      taskSetId,
    } = createTaskDto;

    // Validate task type
    let taskType: TaskType = null;
    if (taskTypeId) {
      taskType = await this.taskTypeRepository.findOne({ where: { id: taskTypeId } });
      if (!taskType) {
        throw new NotFoundException('Task type not found');
      }
    }

    // Generate a new task set ID if not provided
    const newTaskSetId = taskSetId || uuidv4().slice(0, 10);

    // Fetch assets
    const assets = await this.assetRepository.findBy({ id: In(assetIds) });

    // Fetch assigned users
    const assignedUsers = await this.userRepository.findBy({ id: In(assignedUserIds) });

    // Fetch client task settings
    const clientTaskSettings = await this.clientTaskSettingsRepository.findOne({
      where: { client: { id: clientId } },
    });

    // Calculate task dates based on interval
    const tasksToCreate = await this.calculateTaskIntervals(
      dueDate,
      reoccurringEndDate,
      taskInterval,
    );

    const createdTasks: Task[] = [];

    for (const taskDate of tasksToCreate) {
      const task = this.taskRepository.create({
        taskId: uuidv4().slice(0, 10),
        client: { id: clientId },
        createdByUser: { id: userId },
        customer: { id: customerId },
        taskType,
        taskPriority,
        taskInterval,
        taskSetId: newTaskSetId,
        dueDate: taskDate,
        reoccurringEndDate: reoccurringEndDate ? new Date(reoccurringEndDate) : null,
        assets,
        assignedUsers,
        // Additional fields as needed
      });

      // Set initial task status
      const initialStatus = await this.taskStatusRepository.findOne({
        where: { name: 'Created' },
      });
      task.taskStatus = initialStatus;

      // Save task
      const savedTask = await this.taskRepository.save(task);

      // Create task status history
      const statusHistory = this.taskStatusHistoryRepository.create({
        task: savedTask,
        client: { id: clientId },
        taskStatus: initialStatus,
        createdByUser: { id: userId },
      });
      await this.taskStatusHistoryRepository.save(statusHistory);

      createdTasks.push(savedTask);
    }

    return createdTasks;
  }

  async findAll(clientId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { client: { id: clientId } },
      relations: ['taskType', 'taskStatus', 'assets', 'assignedUsers'],
    });
  }

  async findOne(taskId: string, clientId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, client: { id: clientId } },
      relations: ['taskType', 'taskStatus', 'assets', 'assignedUsers'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(taskId: string, updateTaskDto: UpdateTaskDto, clientId: string): Promise<Task> {
    const task = await this.findOne(taskId, clientId);

    // Update task properties
    // Note: Implement logic to prevent updating certain fields if necessary
    Object.assign(task, updateTaskDto);

    // Update relations if provided
    if (updateTaskDto.assetIds) {
      const assets = await this.assetRepository.findBy({ id: In(updateTaskDto.assetIds) });
      task.assets = assets;
    }

    if (updateTaskDto.assignedUserIds) {
      const assignedUsers = await this.userRepository.findBy({ id: In(updateTaskDto.assignedUserIds) });
      task.assignedUsers = assignedUsers;
    }

    if (updateTaskDto.taskTypeId) {
      const taskType = await this.taskTypeRepository.findOne({ where: { id: updateTaskDto.taskTypeId } });
      if (!taskType) {
        throw new NotFoundException('Task type not found');
      }
      task.taskType = taskType;
    }

    // Save updated task
    return this.taskRepository.save(task);
  }

  async remove(taskId: string, clientId: string): Promise<void> {
    const task = await this.findOne(taskId, clientId);
    await this.taskRepository.remove(task);
  }

  async changeTaskStatus(
    taskId: string,
    statusId: string,
    clientId: string,
    userId: string,
    location?: string,
    delayedReason?: string,
  ): Promise<Task> {
    const task = await this.findOne(taskId, clientId);

    const newStatus = await this.taskStatusRepository.findOne({ where: { id: statusId } });
    if (!newStatus) {
      throw new NotFoundException('Task status not found');
    }

    // Business logic to prevent setting the same status consecutively
    const lastStatusHistory = await this.taskStatusHistoryRepository.findOne({
      where: { task: { id: taskId } },
      order: { createdAt: 'DESC' },
    });

    if (lastStatusHistory && lastStatusHistory.taskStatus.id === statusId) {
      throw new BadRequestException('Cannot set the same status consecutively');
    }

    // Logic to prevent changing status after 'Completed-Billed'
    if (task.taskStatus && task.taskStatus.name === 'Completed-Billed') {
      throw new BadRequestException('Cannot change status after Completed-Billed');
    }

    // Update task status
    task.taskStatus = newStatus;
    await this.taskRepository.save(task);

    // Add to status history
    const statusHistory = this.taskStatusHistoryRepository.create({
      task,
      client: { id: clientId },
      taskStatus: newStatus,
      createdByUser: { id: userId },
      location,
      delayedReason,
    });
    await this.taskStatusHistoryRepository.save(statusHistory);

    return task;
  }

  private async calculateTaskIntervals(
    dueDate: string,
    endDate: string,
    interval: string,
  ): Promise<Date[]> {
    const dates: Date[] = [];
    const startDate = new Date(dueDate);
    const finalDate = endDate ? new Date(endDate) : new Date(startDate.getFullYear() + 3, startDate.getMonth(), startDate.getDate());

    let currentDate = new Date(startDate);

    switch (interval) {
      case 'One-Time':
        dates.push(currentDate);
        break;
      case 'Daily':
        while (currentDate <= finalDate) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;
      case 'Bi-Monthly':
        while (currentDate <= finalDate) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 15);
        }
        break;
      case 'Monthly':
        while (currentDate <= finalDate) {
          dates.push(new Date(currentDate));
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        break;
      case 'Quarterly':
        while (currentDate <= finalDate) {
          dates.push(new Date(currentDate));
          currentDate.setMonth(currentDate.getMonth() + 3);
        }
        break;
      case 'Annual':
        while (currentDate <= finalDate) {
          dates.push(new Date(currentDate));
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
        break;
      default:
        throw new BadRequestException('Invalid task interval');
    }

    return dates;
  }

  // Additional methods as needed
}
