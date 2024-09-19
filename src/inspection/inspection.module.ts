import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inspection } from './entities/inspection.entity';
import { Checklist } from './entities/checklist.entity';
import { ChecklistItem } from './entities/checklist-item.entity';
import { InspectionScore } from './entities/inspection-score.entity';
import { InspectionService } from './services/inspection.service';
import { ChecklistService } from './services/checklist.service';
import { ChecklistItemService } from './services/checklist-item.service';
import { InspectionScoreService } from './services/inspection-score.service';
import { InspectionController } from './controllers/inspection.controller';
import { ChecklistController } from './controllers/checklist.controller';
import { ChecklistItemController } from './controllers/checklist-item.controller';
import { InspectionScoreController } from './controllers/inspection-score.controller';
import { UserModule } from './../user/user.module';
import { Customer } from './../customer/entities/customer.entity';
import { Client } from './../client/entities/client.entity';
import { Asset } from './../assets/entities/asset.entity';
import { InvoiceModule } from './../invoice/invoice.module';
import { AuthModule } from './../auth/auth.module';
import { ReportModule } from './../reports/report.module';
import { UserGroupModule } from './../user-groups/user-group.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inspection, Checklist, ChecklistItem, InspectionScore, Customer, Client, Asset]),
    UserModule,
    UserGroupModule,
    forwardRef(() => InvoiceModule),
    forwardRef(() => AuthModule),
    forwardRef(() => ReportModule),
  ],
  providers: [
    InspectionService,
    ChecklistService,
    ChecklistItemService,
    InspectionScoreService,
  ],
  controllers: [
    InspectionController,
    ChecklistController,
    ChecklistItemController,
    InspectionScoreController,
  ],
  exports: [InspectionService],
})
export class InspectionModule {}
