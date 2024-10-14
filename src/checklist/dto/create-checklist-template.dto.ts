import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateChecklistQuestionDTO } from './create-checklist-question.dto';

export class CreateChecklistTemplateDTO {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChecklistQuestionDTO)
  questions: CreateChecklistQuestionDTO[];
}