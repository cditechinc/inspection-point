// src/task-management/dto/update-client-task-settings.dto.ts

import { IsBoolean, IsOptional, IsInt, IsString } from 'class-validator';

export class UpdateClientTaskSettingsDto {
  @IsBoolean()
  @IsOptional()
  autoAssignUsersToTask?: boolean;

  @IsInt()
  @IsOptional()
  maxInProgressTasksPerUser?: number;

  @IsBoolean()
  @IsOptional()
  allowUsersToCompleteBillTask?: boolean;

  @IsBoolean()
  @IsOptional()
  assignUserToTaskUsingSchedules?: boolean;

  @IsBoolean()
  @IsOptional()
  enableTaskWeights?: boolean;

  @IsBoolean()
  @IsOptional()
  captureTaskStatusGpsLocation?: boolean;

  @IsBoolean()
  @IsOptional()
  automaticTaskArrivalStatus?: boolean;

  @IsBoolean()
  @IsOptional()
  automaticTaskInvoiceCreation?: boolean;

  @IsString()
  @IsOptional()
  taskInvoiceTheme?: string;

  @IsBoolean()
  @IsOptional()
  taskWeather?: boolean;
}
