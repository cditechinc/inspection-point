import { IsUUID, IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateChecklistItemDTO {

  @IsString()
  @IsNotEmpty()
  name: string;

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
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}

export class ChecklistItemDTO {
  id: string;
  name: string;
  description: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
