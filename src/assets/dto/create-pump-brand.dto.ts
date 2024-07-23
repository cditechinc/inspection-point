import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePumpBrandDto {
  @IsString()
  name: string;

  @IsString()
  model: string;

  @IsString()
  website: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipcode: string;

  @IsBoolean()
  madeInUSA: boolean;
}
