// src/task-management/controllers/task.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
  UseGuards,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { TaskService } from '../services/task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Role } from './../../auth/role.enum';
import { Roles } from './../../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Roles(Role.ClientAdmin, Role.Client)
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    const clientId = req.user.clientId;
    const userId = req.user.id;

    return this.taskService.create(createTaskDto, clientId, userId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get()
  async findAll(@Req() req) {
    const clientId = req.user.clientId;
    return this.taskService.findAll(clientId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const clientId = req.user.clientId;
    return this.taskService.findOne(id, clientId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req,
  ) {
    const clientId = req.user.clientId;
    return this.taskService.update(id, updateTaskDto, clientId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const clientId = req.user.clientId;
    return this.taskService.remove(id, clientId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Post(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Body()
    body: { statusId: string; location?: string; delayedReason?: string },
    @Req() req,
  ) {
    const clientId = req.user.clientId;
    const userId = req.user.id;
    const { statusId, location, delayedReason } = body;

    if (!statusId) {
      throw new BadRequestException('Status ID is required');
    }

    return this.taskService.changeTaskStatus(
      id,
      statusId,
      clientId,
      userId,
      location,
      delayedReason,
    );
  }
}
