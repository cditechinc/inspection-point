import { IsBoolean, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUserGroupPermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  permissionName: string;

  @IsBoolean()
  @IsNotEmpty()
  canView: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canEdit: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canCreate: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canDelete: boolean;
}
