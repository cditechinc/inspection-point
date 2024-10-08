import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsUUID, IsArray } from 'class-validator';

export class CreateAssetDto {
  @IsUUID()
  clientId: string;

  @IsUUID()
  customerId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  assetType?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'maintenance'])
  status?: 'active' | 'inactive' | 'maintenance';

  @IsOptional()
  @IsString()
  inspectionInterval?: string;

  @IsOptional()
  @IsString()
  qrCode?: string;

  @IsOptional()
  @IsString()
  nfcCode?: string;

  @IsOptional()
  @IsNumber()
  pipeDia?: number;

  @IsOptional()
  @IsNumber()
  pumps?: number;

  @IsOptional()
  @IsString()
  smart?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsNumber()
  float?: number;

  @IsOptional()
  @IsString()
  duty?: string;

  @IsOptional()
  @IsString()
  rails?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  deleteProtect?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsString()
  power?: string;
}
