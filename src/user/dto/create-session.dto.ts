import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  ip_address: string;

  @IsOptional()
  @IsString()
  ip_type?: string;

  @IsOptional()
  @IsString()
  device_type?: string;

  @IsOptional()
  @IsString()
  browser_type?: string;

  @IsOptional()
  @IsString()
  gps_location?: string;

  @IsOptional()
  @IsString()
  ip_location?: string;

  @IsString()
  session_token: string;

  @IsDateString()
  expires_at: string;

  @IsString()
  username: string;
}