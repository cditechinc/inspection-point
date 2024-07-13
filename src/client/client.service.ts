// src/client/client.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import * as AWS from 'aws-sdk';

@Injectable()
export class ClientService {
  private s3: AWS.S3;

  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
  }

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const client = this.clientRepository.create(createClientDto);
    const savedClient = await this.clientRepository.save(client);

    await this.createS3Folder(savedClient.id);

    return savedClient;
  }

  private async createS3Folder(clientId: string) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${clientId}/`
    };

    await this.s3.putObject(params).promise();
  }
}
