import {
  IsUUID,
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChecklistItemDTO } from './checklist-item.dto';

export class ChecklistDTO {

  @IsUUID()
  id: string;

  @IsUUID()
  inspectionId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  @IsUUID(undefined, { each: true })
  checklistItemIds: string[];
}

export class UpdateChecklistDTO {
  @IsString()
  @IsOptional()
  name?: string;

 
}

// export class ChecklistItemDTO {
//   id: string;
//   checklistId: string;
//   description: string;
//   isCompleted: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }
