import { IsString, IsEnum, IsOptional, IsBoolean, IsJSON } from 'class-validator';
import { QuestionType } from '../entities/checklist-question.entity';

export class CreateChecklistQuestionDTO {
  @IsString()
  question_text: string;

  @IsEnum(QuestionType)
  question_type: QuestionType;

  @IsOptional()
  @IsJSON()
  options?: any;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;
}