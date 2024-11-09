import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateTaskStatusHistoryDto {
  @IsUUID()
  taskId: string;

  @IsUUID()
  clientId: string;

  @IsUUID()
  statusId: string;

  @IsUUID()
  userId: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  delayedReason?: string;
}