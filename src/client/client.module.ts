// src/client/client.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Client } from './entities/client.entity';
import { AwsService } from './../aws/aws.service';
import { UserModule } from './../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Client]), UserModule],
  controllers: [ClientController],
  providers: [ClientService, AwsService],
  exports: [ClientService, TypeOrmModule],
})
export class ClientModule {}
