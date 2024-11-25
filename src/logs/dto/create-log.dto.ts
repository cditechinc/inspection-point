import { IsNotEmpty, IsString, IsOptional, IsJSON } from 'class-validator';

export class CreateLogDto {
  @IsOptional()
  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  ip_address?: string;

  @IsOptional()
  @IsString()
  gps_location?: string;

  @IsOptional()
  @IsString()
  device_type?: string;

  @IsOptional()
  @IsString()
  browser_type?: string;

  @IsOptional()
  @IsString()
  ip_location?: string;

  @IsOptional()
  @IsJSON()
  details?: Record<string, any>;

  @IsNotEmpty()
  @IsString()
  logLevel: string;  // Should be INFO, WARN, ERROR
}
