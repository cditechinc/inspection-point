import { IsUUID, IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateChecklistItemDTO {

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
  description: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
