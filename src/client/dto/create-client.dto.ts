import { IsNotEmpty, IsEmail, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  billing_address: string;

  @IsOptional()
  @IsString()
  payment_method: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsDateString()
  next_bill_date: string;
}
