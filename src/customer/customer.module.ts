
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from './entities/customer.entity';
import { ClientModule } from '../client/client.module';
import { AuthModule } from '../auth/auth.module';
import { Client } from '../client/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Client]), ClientModule, AuthModule],
  providers: [CustomerService],
  controllers: [CustomerController],
})
export class CustomerModule {}
