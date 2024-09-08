import { IsOptional, IsString, IsEmail, IsBoolean, IsUUID } from 'class-validator';

export class UpdateAssociatedUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipcode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsBoolean()
  receiveSms?: boolean;

  @IsOptional()
  @IsBoolean()
  requirePasswordChange?: boolean;

  @IsOptional()
  @IsUUID()
  groupId?: string;
}