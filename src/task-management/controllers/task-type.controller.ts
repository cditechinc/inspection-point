// src/task-management/controllers/task-type.controller.ts

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
import { TaskTypeService } from '../services/task-type.service';
import { CreateTaskTypeDto } from '../dto/create-task-type.dto';
import { UpdateTaskTypeDto } from '../dto/update-task-type.dto';

import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('task-types')
export class TaskTypeController {
  constructor(private readonly taskTypeService: TaskTypeService) {}

  @Post()
  async create(@Body() createTaskTypeDto: CreateTaskTypeDto, @Req() req) {
    const clientId = req.user.clientId;
    return this.taskTypeService.create(createTaskTypeDto, clientId);
  }

  @Get()
  async findAll(@Req() req) {
    const clientId = req.user.clientId;
    return this.taskTypeService.findAll(clientId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const clientId = req.user.clientId;
    return this.taskTypeService.findOne(id, clientId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskTypeDto: UpdateTaskTypeDto,
    @Req() req,
  ) {
    const clientId = req.user.clientId;
    return this.taskTypeService.update(id, updateTaskTypeDto, clientId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const clientId = req.user.clientId;
    return this.taskTypeService.remove(id, clientId);
  }
}
