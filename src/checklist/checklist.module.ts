import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ChecklistQuestion } from './entities/checklist-question.entity';
import { InspectionChecklist } from './entities/inspection-checklist.entity';
import { InspectionChecklistAnswer } from './entities/inspection-checklist-answer.entity';
import { ChecklistTemplateService } from './services/checklist-template.service';
import { InspectionChecklistService } from './services/inspection-checklist.service';
import { ChecklistTemplateController } from './controllers/checklist-template.controller';
import { InspectionChecklistController } from './controllers/inspection-checklist.controller';
import { Inspection } from '../inspection/entities/inspection.entity';
import { UserGroupModule } from './../user-groups/user-group.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChecklistTemplate,
      ChecklistQuestion,
      InspectionChecklist,
      InspectionChecklistAnswer,
      Inspection,
    ]),
    UserGroupModule
  ],
  providers: [ChecklistTemplateService, InspectionChecklistService],
  controllers: [ChecklistTemplateController, InspectionChecklistController],
  exports: [ChecklistTemplateService, InspectionChecklistService, TypeOrmModule],
})
export class ChecklistModule {}