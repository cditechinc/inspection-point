import { IsOptional, IsString, IsDate, IsEnum } from 'class-validator';

export class FilterLogsDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsEnum(['INFO', 'WARN', 'ERROR'])
  logLevel?: 'INFO' | 'WARN' | 'ERROR';

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
