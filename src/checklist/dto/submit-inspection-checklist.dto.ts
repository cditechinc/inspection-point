import { IsUUID, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { AnswerDTO } from './answer.dto';

export class SubmitInspectionChecklistDTO {

  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsOptional() 
  inspectionId?: string;

  @IsUUID()
  templateId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDTO)
  answers: AnswerDTO[];
}