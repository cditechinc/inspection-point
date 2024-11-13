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
  Patch,
} from '@nestjs/common';
import { TaskTypeService } from '../services/task-type.service';
import { CreateTaskTypeDto } from '../dto/create-task-type.dto';
import { UpdateTaskTypeDto } from '../dto/update-task-type.dto';

import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Role } from './../../auth/role.enum';
import { Roles } from './../../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('task-types')
export class TaskTypeController {
  constructor(private readonly taskTypeService: TaskTypeService) {}

  @Roles(Role.ClientAdmin, Role.Client)
  @Post()
  async create(@Body() createTaskTypeDto: CreateTaskTypeDto, @Req() req) {
    const clientId = req.user.clientId;
    return this.taskTypeService.create(createTaskTypeDto, clientId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get()
  async findAll(@Req() req) {
    const clientId = req.user.clientId;
    return this.taskTypeService.findAll(clientId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    const clientId = req.user.clientId;
    return this.taskTypeService.findOne(id, clientId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskTypeDto: UpdateTaskTypeDto,
    @Req() req,
  ) {
    const clientId = req.user.clientId;
    return this.taskTypeService.update(id, updateTaskTypeDto, clientId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    const clientId = req.user.clientId;
    return this.taskTypeService.remove(id, clientId);
  }
}
