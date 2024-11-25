import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { SessionService } from '../services/session.service';
import { SessionFilterDto } from '../dto/session-filter.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('sessions')
@UseGuards(AuthGuard('jwt'))
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  async getSessions(@Query() filterDto: SessionFilterDto) {
    return await this.sessionService.getSessionDetails(filterDto);
  }

  @Delete(':id')
  async deleteSession(@Param('id') sessionId: string) {
    await this.sessionService.deleteSession(sessionId);
    return { message: 'Session deleted successfully' };
  }
}