// src/task-management/services/task-status.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskStatus } from '../entities/task-status.entity';
import { CreateTaskStatusDto } from '../dto/create-task-status.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';

@Injectable()
export class TaskStatusService {
  constructor(
    @InjectRepository(TaskStatus)
    private readonly taskStatusRepository: Repository<TaskStatus>,
  ) {}

  async create(createTaskStatusDto: CreateTaskStatusDto): Promise<TaskStatus> {
    const existingStatus = await this.taskStatusRepository.findOne({
      where: { name: createTaskStatusDto.name },
    });

    if (existingStatus) {
      throw new BadRequestException('Task status with this name already exists');
    }

    const taskStatus = this.taskStatusRepository.create(createTaskStatusDto);
    return this.taskStatusRepository.save(taskStatus);
  }

  async findAll(): Promise<TaskStatus[]> {
    return this.taskStatusRepository.find();
  }

  async findOne(id: string): Promise<TaskStatus> {
    const taskStatus = await this.taskStatusRepository.findOne({ where: { id } });
    if (!taskStatus) {
      throw new NotFoundException('Task status not found');
    }
    return taskStatus;
  }

  async update(id: string, updateTaskStatusDto: UpdateTaskStatusDto): Promise<TaskStatus> {
    const taskStatus = await this.findOne(id);

    if (taskStatus.isDefault) {
      throw new BadRequestException('Cannot modify default task statuses');
    }

    Object.assign(taskStatus, updateTaskStatusDto);
    return this.taskStatusRepository.save(taskStatus);
  }

  async remove(id: string): Promise<void> {
    const taskStatus = await this.findOne(id);

    if (taskStatus.isDefault) {
      throw new BadRequestException('Cannot delete default task statuses');
    }

    await this.taskStatusRepository.remove(taskStatus);
  }
}
