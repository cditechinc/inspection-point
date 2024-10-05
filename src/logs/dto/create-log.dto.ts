import { IsNotEmpty, IsString, IsOptional, IsJSON } from 'class-validator';

export class CreateLogDto {
  @IsNotEmpty()
  @IsString()
  action: string;

  @IsOptional()
  @IsJSON()
  details?: Record<string, any>;

  @IsNotEmpty()
  @IsString()
  logLevel: string;  // Should be INFO, WARN, ERROR
}
