import { IsNotEmpty, IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateTaskStatusHistoryDto {
  @IsUUID()
  @IsNotEmpty()
  taskStatusId: string;

  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsString()
  @IsOptional()
  location?: string; // GPS coordinates in 'POINT' format

  @IsString()
  @IsOptional()
  delayedReason?: string;
}