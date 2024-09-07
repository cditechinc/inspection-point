// import { IsBoolean, IsString, IsNotEmpty, MaxLength } from 'class-validator';

// export class CreateUserGroupPermissionDto {
//   @IsString()
//   @IsNotEmpty()
//   @MaxLength(255)
//   permissionName: string;

//   @IsBoolean()
//   @IsNotEmpty()
//   canView: boolean;

//   @IsBoolean()
//   @IsNotEmpty()
//   canEdit: boolean;

//   @IsBoolean()
//   @IsNotEmpty()
//   canCreate: boolean;

//   @IsBoolean()
//   @IsNotEmpty()
//   canDelete: boolean;
// }
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserGroupPermissionDto {
  @IsString()
  @IsNotEmpty()
  resource: string;

  @IsString()
  @IsNotEmpty()
  action: string;
}