import { IsUUID, IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateChecklistItemDTO {
  @IsUUID()
  checklistId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}

export class UpdateChecklistItemDTO {
  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}

export class ChecklistItemDTO {
  id: string;
  checklistId: string;
  description: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
