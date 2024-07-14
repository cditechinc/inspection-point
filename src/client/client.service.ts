// src/client/client.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { AwsService } from '../aws/aws.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    private readonly awsService: AwsService,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientsRepository.create(createClientDto);

    // Hash the password
    client.password = await bcrypt.hash(createClientDto.password, 10);

    await this.clientsRepository.save(client);
    await this.awsService.createS3Folder(client.id);
    return client;
  }

  async findAll(): Promise<Client[]> {
    return this.clientsRepository.find();
  }

  async findOne(id: string): Promise<Client> {
    return this.clientsRepository.findOne({ where: { id } });
  }

  async findOneByEmail(email: string): Promise<Client | undefined> {
    return this.clientsRepository.findOne({ where: { email } });
  }

  async update(id: string, updateClientDto: Partial<Client>): Promise<Client> {
    await this.clientsRepository.update(id, updateClientDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.clientsRepository.delete(id);
  }
}
