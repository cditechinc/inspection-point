import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { RegisterClientDto } from './dto/register-client.dto';
import { AwsService } from '../aws/aws.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './../auth/dto/create-user.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    private readonly awsService: AwsService,
    private readonly userService: UserService,
  ) {}

  async create(registerClientDto: RegisterClientDto): Promise<Client> {
    const hashedPassword = await bcrypt.hash(registerClientDto.password, 10);

    // Create a User entity for the client
    const userDto: CreateUserDto = {
      username: registerClientDto.name,
      email: registerClientDto.email,
      password: registerClientDto.password,
      password_hash: hashedPassword,
      role: 'client',
      is_client_admin: true,
    };
    const user = await this.userService.create(userDto);

    const client = this.clientsRepository.create({
      ...registerClientDto,
      user: user,
    });

    try {
      await this.clientsRepository.save(client);
      await this.awsService.createS3Folder(client.id);
      return client;
    } catch (error) {
      throw new InternalServerErrorException('Error creating client');
    }
  }

  async findAll(): Promise<Client[]> {
    return this.clientsRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({ where: { id }, relations: ['user'] });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async findOneByEmail(email: string): Promise<Client | undefined> {
    return this.clientsRepository.findOne({ where: { email }, relations: ['user'] });
  }

  async update(id: string, updateClientDto: Partial<Client>): Promise<Client> {
    const client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    Object.assign(client, updateClientDto);
    await this.clientsRepository.save(client);
    return client;
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    await this.clientsRepository.delete(id);
  }
}