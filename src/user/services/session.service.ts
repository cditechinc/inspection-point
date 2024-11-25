import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UserSession } from '../entities/user-session.entity';
import { CreateSessionDto } from '../dto/create-session.dto';
import { User } from '../entities/user.entity';
import { SessionFilterDto } from '../dto/session-filter.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionsRepository: Repository<UserSession>,
  ) {}

  async createSession(createSessionDto: CreateSessionDto, user: User): Promise<UserSession> {
    const session = this.sessionsRepository.create({
      ...createSessionDto,
      user,
    });
    return await this.sessionsRepository.save(session);
  }

  async invalidateExpiredSessions(): Promise<void> {
    const now = new Date();
    await this.sessionsRepository.delete({
      expires_at: LessThan(now),
    });
  }

  async getSessionDetails(filterDto: SessionFilterDto): Promise<UserSession[]> {
    const { userId, startDate, endDate, ipAddress } = filterDto;
    const query = this.sessionsRepository.createQueryBuilder('session')
      .leftJoinAndSelect('session.user', 'user');

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }
    if (startDate && endDate) {
      query.andWhere('session.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }
    if (ipAddress) {
      query.andWhere('session.ip_address = :ipAddress', { ipAddress });
    }

    return await query.orderBy('session.created_at', 'DESC').getMany();
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.sessionsRepository.delete(sessionId);
  }
}