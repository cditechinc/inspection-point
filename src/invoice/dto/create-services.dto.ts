import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDecimal } from 'class-validator';

export class CreateServiceFeeDto {
  @IsString()
  @IsNotEmpty()
  quickbooksServiceId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDecimal()
  @IsNotEmpty()
  price: number;

  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;
}
