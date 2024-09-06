import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserGroupPermissionDto {
  @IsBoolean()
  @IsOptional()
  canView?: boolean;

  @IsBoolean()
  @IsOptional()
  canEdit?: boolean;

  @IsBoolean()
  @IsOptional()
  canCreate?: boolean;

  @IsBoolean()
  @IsOptional()
  canDelete?: boolean;
}
