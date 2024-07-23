import { IsUUID, IsString, IsDecimal, IsOptional } from 'class-validator';

export class CreatePumpDto {
  @IsUUID()
  assetId: string;

  @IsUUID()
  brandId: string;

  @IsDecimal()
  avgAmps: number;

  @IsDecimal()
  maxAmps: number;

  @IsDecimal()
  hp: number;

  @IsString()
  serial: string;

  @IsString()
  @IsOptional()
  warranty?: string;

  @IsString()
  @IsOptional()
  installedDate?: string;
}
