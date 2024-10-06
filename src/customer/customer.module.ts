
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from './entities/customer.entity';
import { ClientModule } from '../client/client.module';
import { AuthModule } from '../auth/auth.module';
import { Client } from '../client/entities/client.entity';
import { UserGroupModule } from './../user-groups/user-group.module';
import { AwsService } from './../aws/aws.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Client]), ClientModule, AuthModule, UserGroupModule],
  providers: [CustomerService, AwsService],
  controllers: [CustomerController],
  exports: [CustomerService],
})
export class CustomerModule {}
