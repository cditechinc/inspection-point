import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { TaskStatusHistoryService } from '../services/task-status-history.service';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Role } from './../../auth/role.enum';
import { Roles } from './../../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)

@Controller('tasks/:taskId/status-history')
export class TaskStatusHistoryController {
  constructor(
    private readonly taskStatusHistoryService: TaskStatusHistoryService,
  ) {}

  @Roles(Role.ClientAdmin, Role.Client)
  @Get()
  async findByTask(@Param('taskId') taskId: string, @Req() req) {
    const clientId = req.user.clientId;
    // Optionally, validate that the task belongs to the client
    return this.taskStatusHistoryService.findByTask(taskId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Get(':id')
  async findOne(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Req() req,
  ) {
    const clientId = req.user.clientId;
    // Optionally, validate ownership
    return this.taskStatusHistoryService.findOne(id);
  }
}