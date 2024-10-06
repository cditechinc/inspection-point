import { IsNotEmpty, IsEmail, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  service_address?: string;

  @IsOptional()
  @IsString()
  billing_address?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  gate_code?: string;

  @IsOptional()
  @IsString()
  previous_phone_number?: string;

  @IsOptional()
  @IsString()
  service_contact?: string;

  @IsOptional()
  @IsString()
  previousProvider?: string; // New field for Previous Provider

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[]; // New field for photo URLs

  @IsOptional()
  @IsEmail()
  billingContactEmail?: string; // New field for Billing Contact Email
}