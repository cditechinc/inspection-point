import { IsNotEmpty, IsString, IsHexColor, IsBoolean, IsOptional } from 'class-validator';

export class CreateTaskStatusDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  isPastDueProtected?: boolean;
}