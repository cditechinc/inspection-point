// src/company/dto/create-company.dto.ts
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  company_name: string;

  @IsOptional()
  @IsString()
  company_type: string;

  @IsOptional()
  @IsString()
  industry: string;

  @IsOptional()
  @IsString()
  company_logo: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  billing_address: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  zipcode: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  phone2: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  website: string;

  @IsOptional()
  @IsString()
  payment_method: string;
}
