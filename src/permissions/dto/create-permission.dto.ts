import { IsBoolean, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsBoolean()
  @IsNotEmpty()
  canCreateUser: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canEditUser: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canDeleteUser: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canCreateAsset: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canEditAsset: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canDeleteAsset: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canCreateInspection: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canEditInspection: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canDeleteInspection: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canCreateCustomer: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canEditCustomer: boolean;

  @IsBoolean()
  @IsNotEmpty()
  canDeleteCustomer: boolean;
}
