import { IsNotEmpty, IsEmail, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';

export class RegisterClientDto {
  
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  billing_address: string;

  @IsNotEmpty()
  @IsString()
  company_name: string;

  @IsNotEmpty()
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
  payment_method: string;

  @IsOptional()
  @IsString()
  account_status: string;

  @IsOptional()
  @IsString()
  custom_portal_url: string;

  @IsOptional()
  @IsDateString()
  next_bill_date: string;

  @IsOptional()
  @IsBoolean()
  tax_exempt: boolean;

  @IsOptional()
  @IsBoolean()
  protected: boolean;

  @IsOptional()
  @IsBoolean()
  email_verified: boolean;

  @IsOptional()
  @IsString()
  website: string;
}
