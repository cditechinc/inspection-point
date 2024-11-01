import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsNumber,
  } from 'class-validator';
  
  export class CreatePackageDto {
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @IsNotEmpty()
    @IsNumber()
    monthly_price: number;
  
    @IsNotEmpty()
    @IsNumber()
    yearly_price: number;
  
    @IsOptional()
    @IsNumber()
    customer_limit?: number;
  
    @IsOptional()
    @IsNumber()
    asset_limit?: number;
  
    @IsOptional()
    @IsNumber()
    user_limit?: number;
  
    @IsOptional()
    @IsNumber()
    inspection_limit?: number;
  
    @IsOptional()
    @IsNumber()
    photo_storage_limit?: number;
  
    @IsOptional()
    @IsNumber()
    video_storage_limit?: number;
  
    @IsOptional()
    @IsNumber()
    pdf_storage_limit?: number;
  
    @IsOptional()
    @IsNumber()
    sms_limit?: number;
  
    @IsOptional()
    @IsBoolean()
    customer_portal?: boolean;
  }