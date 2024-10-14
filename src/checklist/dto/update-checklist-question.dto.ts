import { PartialType } from '@nestjs/mapped-types';
import { CreateChecklistQuestionDTO } from './create-checklist-question.dto';

export class UpdateChecklistQuestionDTO extends PartialType(CreateChecklistQuestionDTO) {}