import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePermissionDto {
  @IsBoolean()
  @IsOptional()
  canCreateUser?: boolean;

  @IsBoolean()
  @IsOptional()
  canEditUser?: boolean;

  @IsBoolean()
  @IsOptional()
  canDeleteUser?: boolean;

  @IsBoolean()
  @IsOptional()
  canCreateAsset?: boolean;

  @IsBoolean()
  @IsOptional()
  canEditAsset?: boolean;

  @IsBoolean()
  @IsOptional()
  canDeleteAsset?: boolean;

  @IsBoolean()
  @IsOptional()
  canCreateInspection?: boolean;

  @IsBoolean()
  @IsOptional()
  canEditInspection?: boolean;

  @IsBoolean()
  @IsOptional()
  canDeleteInspection?: boolean;

  @IsBoolean()
  @IsOptional()
  canCreateCustomer?: boolean;

  @IsBoolean()
  @IsOptional()
  canEditCustomer?: boolean;

  @IsBoolean()
  @IsOptional()
  canDeleteCustomer?: boolean;
}
