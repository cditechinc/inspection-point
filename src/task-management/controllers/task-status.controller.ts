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
  Patch,
} from '@nestjs/common';
import { TaskStatusService } from '../services/task-status.service';
import { CreateTaskStatusDto } from '../dto/create-task-status.dto';
import { UpdateTaskStatusDto } from '../dto/update-task-status.dto';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('task-statuses')
export class TaskStatusController {
  constructor(private readonly taskStatusService: TaskStatusService) {}

  @Roles(Role.ClientAdmin, Role.Client)
  @Post()
  async create(@Body() createTaskStatusDto: CreateTaskStatusDto) {
    return this.taskStatusService.create(createTaskStatusDto);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get()
  async findAll() {
    return this.taskStatusService.findAll();
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.taskStatusService.findOne(id);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return this.taskStatusService.update(id, updateTaskStatusDto);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.taskStatusService.remove(id);
  }
}
