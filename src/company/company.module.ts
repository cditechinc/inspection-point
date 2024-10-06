// src/company/company.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyService } from './services/company.service';
import { CompanyController } from './company.controller';
import { Company } from './entities/company.entity';
import { UserGroupModule } from './../user-groups/user-group.module';

@Module({
  imports: [TypeOrmModule.forFeature([Company]), UserGroupModule],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
