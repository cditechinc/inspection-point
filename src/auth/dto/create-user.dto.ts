import { IsString, IsEmail, IsOptional, IsIn } from 'class-validator';

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
}

