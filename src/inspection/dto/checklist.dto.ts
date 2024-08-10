import { IsUUID, IsString, IsNotEmpty, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ChecklistItemDTO } from './checklist-item.dto';

export class ChecklistDTO {
  @IsUUID()
  inspectionId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()
  overallScore: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDTO)
  items: ChecklistItemDTO[];
}

export class UpdateChecklistDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  overallScore?: string;
}

// export class ChecklistItemDTO {
//   id: string;
//   checklistId: string;
//   description: string;
//   isCompleted: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }
