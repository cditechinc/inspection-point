import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePumpBrandDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  madeInUSA?: boolean;
}
