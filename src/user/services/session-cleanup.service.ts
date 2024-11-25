import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SessionService } from './session.service';

@Injectable()
export class SessionCleanupService {
  constructor(private readonly sessionService: SessionService) {}

  @Cron('0 * * * *') // Runs every hour at minute 0
  async handleCron() {
    await this.sessionService.invalidateExpiredSessions();
  }
}