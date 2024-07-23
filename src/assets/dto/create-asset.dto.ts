import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsUUID } from 'class-validator';

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
  type?: string;

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
  pipeDiameter?: number;

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
  floats?: number;

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
}
