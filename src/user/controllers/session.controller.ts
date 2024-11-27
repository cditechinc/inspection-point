import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { SessionService } from '../services/session.service';
import { SessionFilterDto } from '../dto/session-filter.dto';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { Role } from './../../auth/role.enum';
import { Roles } from './../../auth/decorators/roles.decorator';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Roles(Role.ClientAdmin, Role.Client)
  @Get()
  async getSessions(@Query() filterDto: SessionFilterDto) {
    return await this.sessionService.getSessionDetails(filterDto);
  }

  @Roles(Role.ClientAdmin, Role.Client)
  @Delete(':id')
  async deleteSession(@Param('id') sessionId: string) {
    await this.sessionService.deleteSession(sessionId);
    return { message: 'Session deleted successfully' };
  }
}