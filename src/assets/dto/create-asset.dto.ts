import { IsString, IsUUID, IsOptional, IsDecimal, IsEnum } from 'class-validator';

export class CreateAssetDto {
  @IsUUID()
  clientId: string;

  @IsUUID()
  customerId: string;

  @IsString()
  name: string;

  @IsUUID()
  @IsOptional()
  typeId?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsDecimal()
  @IsOptional()
  latitude?: number;

  @IsDecimal()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['active', 'inactive', 'maintenance'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  inspectionInterval?: string;

  @IsString()
  @IsOptional()
  qrCode?: string;

  @IsString()
  @IsOptional()
  nfcCode?: string;
}
