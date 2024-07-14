import { IsString, IsEmail, IsOptional, IsIn, IsBoolean } from 'class-validator';

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
}

