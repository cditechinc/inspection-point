import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inspection } from './entities/inspection.entity';

import { InspectionService } from './services/inspection.service';
import { InspectionController } from './controllers/inspection.controller';
import { UserModule } from './../user/user.module';
import { Customer } from './../customer/entities/customer.entity';
import { Client } from './../client/entities/client.entity';
import { Asset } from './../assets/entities/asset.entity';
import { InvoiceModule } from './../invoice/invoice.module';
import { AuthModule } from './../auth/auth.module';
import { ReportModule } from './../reports/report.module';
import { UserGroupModule } from './../user-groups/user-group.module';
import { InspectionChecklist } from './../checklist/entities/inspection-checklist.entity';
import { InspectionChecklistController } from './../checklist/controllers/inspection-checklist.controller';
import { InspectionChecklistService } from './../checklist/services/inspection-checklist.service';
import { ChecklistQuestion } from './../checklist/entities/checklist-question.entity';
import { ChecklistTemplate } from './../checklist/entities/checklist-template.entity';
import { InspectionChecklistAnswer } from './../checklist/entities/inspection-checklist-answer.entity';
import { ChecklistModule } from './../checklist/checklist.module';
import { AwsModule } from './../aws/aws.module';
import { Services } from './../invoice/entities/services.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inspection, InspectionChecklist, ChecklistQuestion,
      ChecklistTemplate,
      InspectionChecklistAnswer, Customer, Client, Asset, Services]),
    UserModule,
    UserGroupModule,
    ChecklistModule,
    AwsModule,
    forwardRef(() => InvoiceModule),
    forwardRef(() => AuthModule),
    forwardRef(() => ReportModule),
  ],
  providers: [
    InspectionService,
    InspectionChecklistService,
  ],
  controllers: [
    InspectionController,
    InspectionChecklistController,
  ],
  exports: [InspectionService],
})
export class InspectionModule {}
