// src/user-groups/dto/assign-multiple-permissions.dto.ts

import {
  IsArray,
  ValidateNested,
  IsOptional,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssignPermissionsDto } from './assign-permissions.dto';

export class AssignMultiplePermissionsDto {
  @IsOptional()
  @ValidateIf((o) => !o.permissions || o.permissions.length === 0)
  @ValidateNested()
  @Type(() => AssignPermissionsDto)
  @IsNotEmpty()
  permission?: AssignPermissionsDto;

  @IsOptional()
  @ValidateIf((o) => !o.permission)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignPermissionsDto)
  @IsNotEmpty()
  permissions?: AssignPermissionsDto[];
}
