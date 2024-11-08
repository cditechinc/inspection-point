import {
    IsNotEmpty,
    IsString,
    IsUUID,
    IsBoolean,
    IsOptional,
    IsInt,
  } from 'class-validator';
  
  export class CreateTaskTypeDto {
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @IsUUID()
    @IsOptional()
    pairedServiceFeeId?: string;
  
    @IsBoolean()
    @IsOptional()
    pairedServiceFeeQuantityRequired?: boolean;
  
    @IsInt()
    @IsOptional()
    taskWeight?: number;
  
    @IsInt()
    @IsOptional()
    baseTaskWorkTime?: number;
  
    @IsString()
    @IsOptional()
    categories?: string;
  }