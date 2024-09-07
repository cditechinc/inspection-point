import { IsString, IsEmail, IsOptional, IsIn, IsBoolean, IsUUID } from 'class-validator';
import { Client } from './../../client/entities/client.entity';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsIn(['admin', 'client', 'employee'])
  role: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  password_hash?: string; 
  
  @IsOptional()
  @IsBoolean()
  is_client_admin?: boolean;
  
  @IsOptional()
  @IsBoolean()
  isProtectedUser?: boolean;
  
  @IsOptional()  // Optional because not all users might have a client initially
  client?: Client;

  @IsOptional()
  @IsUUID()
  groupId?: string;

}

