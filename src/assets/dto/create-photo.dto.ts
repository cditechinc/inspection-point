import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePhotoDto {
  @IsOptional()
  @IsString()
  assetId?: string;

  @IsOptional()
  @IsString()
  pumpId?: string;

  @IsOptional()
  @IsString()
  pumpBrandId?: string;

  @IsNotEmpty()
  @IsString()
  url: string;
}
