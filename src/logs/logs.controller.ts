import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { LogsService } from './services/logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { FilterLogsDto } from './dto/filter-logs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from './../user/entities/user.entity';
import { RolesGuard } from './../auth/guards/roles.guard';
import { Roles } from './../auth/decorators/roles.decorator';
import { Role } from './../auth/role.enum';

@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)  // Protect all log routes
export class LogsController {
  constructor(private logsService: LogsService) {}

  @Roles(Role.Admin, Role.ClientAdmin)
  @Post()
  async createLog(@Body() createLogDto: CreateLogDto, @Req() req: Request) {
    const user = req.user as User; 
    return await this.logsService.createLog(user, createLogDto);
  }

  @Roles(Role.Admin, Role.ClientAdmin)
  @Get()
  async getLogs(@Query() filterLogsDto: FilterLogsDto) {
    return await this.logsService.getLogs(filterLogsDto);
  }

  @Roles(Role.Admin, Role.ClientAdmin)
  @Get(':id')
  async getLogById(@Param('id') id: string) {
    return await this.logsService.getLogById(id);
  }

  @Roles(Role.Admin, Role.ClientAdmin)
  @Post('delete/:id')
  async deleteLog(@Param('id') id: string) {
    return await this.logsService.deleteLog(id);
  }
}
