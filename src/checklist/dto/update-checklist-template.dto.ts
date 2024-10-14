import { PartialType } from '@nestjs/mapped-types';
import { CreateChecklistTemplateDTO } from './create-checklist-template.dto';

export class UpdateChecklistTemplateDTO extends PartialType(CreateChecklistTemplateDTO) {}