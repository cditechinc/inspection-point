import { BadRequestException } from '@nestjs/common';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  IsArray,
  IsNumberString,
  ValidateNested,
  IsObject
} from 'class-validator';

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
  @IsEnum(['active', 'inactive', 'maintenance'])
  status?: 'active' | 'inactive' | 'maintenance';

  @IsOptional()
  @IsString()
  latitude?: string;

  @IsOptional()
  @IsString()
  longitude?: string;

  @IsOptional()
  @IsObject()
  @Type(() => Object)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        throw new BadRequestException('Invalid JSON format for properties');
      }
    }
    return value;
  })
  properties?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

}
