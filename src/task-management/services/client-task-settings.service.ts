// src/task-management/services/client-task-settings.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Import necessary entities and DTOs
import { ClientTaskSettings } from '../entities/client-task-settings.entity';
import { UpdateClientTaskSettingsDto } from '../dto/update-client-task-settings.dto';

@Injectable()
export class ClientTaskSettingsService {
  constructor(
    @InjectRepository(ClientTaskSettings)
    private readonly clientTaskSettingsRepository: Repository<ClientTaskSettings>,
  ) {}

  async findOne(clientId: string): Promise<ClientTaskSettings> {
    return this.clientTaskSettingsRepository.findOne({
      where: { client: { id: clientId } },
    });
  }

  async update(
    clientId: string,
    updateClientTaskSettingsDto: UpdateClientTaskSettingsDto,
  ): Promise<ClientTaskSettings> {
    let settings = await this.findOne(clientId);

    if (!settings) {
      settings = this.clientTaskSettingsRepository.create({
        client: { id: clientId },
      });
    }

    Object.assign(settings, updateClientTaskSettingsDto);
    return this.clientTaskSettingsRepository.save(settings);
  }
}
