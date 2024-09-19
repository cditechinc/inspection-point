import { forwardRef, Module } from '@nestjs/common';
import { PdfService } from './services/pdf.service';
import { ReportController } from './controllers/report.controller';
import { AwsService } from '../aws/aws.service';
import { InspectionModule } from '../inspection/inspection.module'; // Import the InspectionModule if you need access to inspections
import { AuthModule } from './../auth/auth.module';
import { AwsModule } from './../aws/aws.module';
import { UserGroupModule } from './../user-groups/user-group.module';
import { PermissionModule } from './../permissions/permission.module';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { Inspection } from './../inspection/entities/inspection.entity';

@Module({
  imports: [
    forwardRef(() => InspectionModule),
    TypeOrmModule.forFeature([Inspection]), 
    AwsModule,
    forwardRef(() => AuthModule),
    UserGroupModule,
    PermissionModule
  ], // Import other modules as needed
  controllers: [ReportController],
  providers: [PdfService, AwsService],
  exports: [PdfService],
})
export class ReportModule {}
