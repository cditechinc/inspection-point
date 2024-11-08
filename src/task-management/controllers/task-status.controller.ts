// src/task-management/controllers/task-status.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TaskStatusService } from '../services/task-status.service';
import { CreateTaskStatusDto } from '../dto/create-task-status.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('task-statuses')
export class TaskStatusController {
  constructor(private readonly taskStatusService: TaskStatusService) {}

  @Post()
  async create(@Body() createTaskStatusDto: CreateTaskStatusDto) {
    return this.taskStatusService.create(createTaskStatusDto);
  }

  @Get()
  async findAll() {
    return this.taskStatusService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.taskStatusService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return this.taskStatusService.update(id, updateTaskStatusDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.taskStatusService.remove(id);
  }
}
