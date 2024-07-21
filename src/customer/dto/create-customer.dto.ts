import { IsNotEmpty, IsEmail, IsOptional, IsString } from 'class-validator';

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
}