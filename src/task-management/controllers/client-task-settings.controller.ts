// src/task-management/controllers/client-task-settings.controller.ts

import { Controller, Get, Put, Body, UseGuards, Req, Patch } from '@nestjs/common';
import { ClientTaskSettingsService } from '../services/client-task-settings.service';
import { UpdateClientTaskSettingsDto } from '../dto/update-client-task-settings.dto';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('task-settings')
export class ClientTaskSettingsController {
  constructor(
    private readonly clientTaskSettingsService: ClientTaskSettingsService,
  ) {}

  @Roles(Role.ClientAdmin, Role.Client)
  @Get()
  async findOne(@Req() req) {
    const clientId = req.user.clientId;
    return this.clientTaskSettingsService.findOne(clientId);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Patch()
  async update(@Body() updateDto: UpdateClientTaskSettingsDto, @Req() req) {
    const clientId = req.user.clientId;
    return this.clientTaskSettingsService.update(clientId, updateDto);
  }
}
