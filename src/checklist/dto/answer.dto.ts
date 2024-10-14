import { IsUUID, IsString, IsOptional } from 'class-validator';

export class AnswerDTO {
  @IsUUID()
  questionId: string;

  @IsOptional()
  @IsString()
  answer: string;
}