import { IsString, IsEmail, IsOptional, IsIn, IsBoolean, IsUUID } from 'class-validator';
import { Client } from './../../client/entities/client.entity';

export class CreateAssociatedUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  status?: string;  // User status, such as 'active', 'inactive', etc.

  @IsOptional()
  @IsString()
  addressLine1?: string;  // Address Line 1

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
  division?: string;  // User's division within the company

  @IsOptional()
  @IsBoolean()
  receiveSms?: boolean;

  @IsOptional()
  @IsBoolean()
  requirePasswordChange?: boolean;

  @IsOptional()
  @IsBoolean()
  sendWelcomeMessage?: boolean;

  @IsOptional()
  @IsUUID()
  groupId?: string;  // Assign user to a group

  @IsOptional()
  client?: Client;  // The client the user belongs to
}
