import { IsNotEmpty, IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreatePumpDto {
  @IsNotEmpty()
  @IsUUID()
  assetId: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avgAmps?: number;

  @IsOptional()
  @IsString()
  maxAmps?: number;

  @IsOptional()
  @IsString()
  hp?: number;

  @IsOptional()
  @IsString()
  serial?: string;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsOptional()
  installedDate?: Date;
}
