import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { CreateUserDto } from '../auth/dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserSession)
    private sessionsRepository: Repository<UserSession>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async create(userDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(userDto);
    return this.usersRepository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData);
    return this.findById(id);
  }

  async createSession(sessionData: Partial<UserSession>): Promise<UserSession> {
    const session = this.sessionsRepository.create(sessionData);
    return this.sessionsRepository.save(session);
  }

  async saveSession(session: UserSession): Promise<UserSession> {
    return this.sessionsRepository.save(session);
  }

  async findSessionByToken(token: string): Promise<UserSession | undefined> {
    return this.sessionsRepository.findOne({ where: { session_token: token }, relations: ['user'] });
  }
}
