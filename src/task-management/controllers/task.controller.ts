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
} from '@nestjs/common';
import { TaskService } from '../services/task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req) {
    const clientId = req.user.clientId;
    const userId = req.user.id;

    return this.taskService.create(createTaskDto, clientId, userId);
  }

  @Get()
  async findAll(@Req() req) {
    const clientId = req.user.clientId;
    return this.taskService.findAll(clientId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const clientId = req.user.clientId;
    return this.taskService.findOne(id, clientId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req,
  ) {
    const clientId = req.user.clientId;
    return this.taskService.update(id, updateTaskDto, clientId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const clientId = req.user.clientId;
    return this.taskService.remove(id, clientId);
  }

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
