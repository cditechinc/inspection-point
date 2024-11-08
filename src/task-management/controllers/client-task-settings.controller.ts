// src/task-management/controllers/client-task-settings.controller.ts

import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ClientTaskSettingsService } from '../services/client-task-settings.service';
import { UpdateClientTaskSettingsDto } from '../dto/update-client-task-settings.dto';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('task-settings')
export class ClientTaskSettingsController {
  constructor(
    private readonly clientTaskSettingsService: ClientTaskSettingsService,
  ) {}

  @Get()
  async findOne(@Req() req) {
    const clientId = req.user.clientId;
    return this.clientTaskSettingsService.findOne(clientId);
  }

  @Put()
  async update(@Body() updateDto: UpdateClientTaskSettingsDto, @Req() req) {
    const clientId = req.user.clientId;
    return this.clientTaskSettingsService.update(clientId, updateDto);
  }
}
