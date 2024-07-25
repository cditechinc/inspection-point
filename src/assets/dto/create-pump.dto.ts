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
  @IsNumber()
  avgAmps?: number;

  @IsOptional()
  @IsNumber()
  maxAmps?: number;

  @IsOptional()
  @IsNumber()
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
