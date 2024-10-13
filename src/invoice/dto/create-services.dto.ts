import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateServiceFeeDto {
  @IsString()
  @IsOptional() 
  quickbooksServiceId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({}, { message: 'Price must be a valid number' })
  @IsNotEmpty()
  price: number;

  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean; // Updated to match the payload field name

  @IsOptional()
  @IsString()
  billingIo?: string; // Added billing_io to match your payload
}
