import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserGroupDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
