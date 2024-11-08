// src/task-management/services/task-type.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskType } from '../entities/task-type.entity';
import { CreateTaskTypeDto } from '../dto/create-task-type.dto';
import { UpdateTaskTypeDto } from '../dto/update-task-type.dto';

@Injectable()
export class TaskTypeService {
  constructor(
    @InjectRepository(TaskType)
    private readonly taskTypeRepository: Repository<TaskType>,
  ) {}

  async create(createTaskTypeDto: CreateTaskTypeDto, clientId: string): Promise<TaskType> {
    const existingType = await this.taskTypeRepository.findOne({
      where: { name: createTaskTypeDto.name, client: { id: clientId } },
    });

    if (existingType) {
      throw new BadRequestException('Task type with this name already exists for this client');
    }

    const taskType = this.taskTypeRepository.create({
      ...createTaskTypeDto,
      client: { id: clientId },
    });
    return this.taskTypeRepository.save(taskType);
  }

  async findAll(clientId: string): Promise<TaskType[]> {
    return this.taskTypeRepository.find({ where: { client: { id: clientId } } });
  }

  async findOne(id: string, clientId: string): Promise<TaskType> {
    const taskType = await this.taskTypeRepository.findOne({
      where: { id, client: { id: clientId } },
    });
    if (!taskType) {
      throw new NotFoundException('Task type not found');
    }
    return taskType;
  }

  async update(id: string, updateTaskTypeDto: UpdateTaskTypeDto, clientId: string): Promise<TaskType> {
    const taskType = await this.findOne(id, clientId);

    if (taskType.isDefault) {
      throw new BadRequestException('Cannot modify default task types');
    }

    Object.assign(taskType, updateTaskTypeDto);
    return this.taskTypeRepository.save(taskType);
  }

  async remove(id: string, clientId: string): Promise<void> {
    const taskType = await this.findOne(id, clientId);

    if (taskType.isDefault) {
      throw new BadRequestException('Cannot delete default task types');
    }

    await this.taskTypeRepository.remove(taskType);
  }
}
