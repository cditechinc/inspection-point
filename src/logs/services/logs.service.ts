import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logs } from './../entities/log.entity';
import { CreateLogDto } from './../dto/create-log.dto';
import { FilterLogsDto } from './../dto/filter-logs.dto';
import { User } from './../../user/entities/user.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Logs)
    private logsRepository: Repository<Logs>,
  ) {}

  async createLog(user: User, createLogDto: CreateLogDto): Promise<Logs> {
    const log = this.logsRepository.create({
      ...createLogDto,
      user,
      timestamp: new Date(),
    });
    return await this.logsRepository.save(log);
  }

  async getLogs(filterLogsDto: FilterLogsDto): Promise<Logs[]> {
    const { userId, action, logLevel, startDate, endDate } = filterLogsDto;
    const query = this.logsRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user');

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }
    if (action) {
      query.andWhere('log.action = :action', { action });
    }
    if (logLevel) {
      query.andWhere('log.logLevel = :logLevel', { logLevel });
    }
    if (startDate && endDate) {
      query.andWhere('log.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return await query.getMany();
  }

  async getLogById(id: string): Promise<Logs> {
    return await this.logsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async deleteLog(id: string): Promise<void> {
    await this.logsRepository.delete(id);
  }
}
