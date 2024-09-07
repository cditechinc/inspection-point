
import { IsArray, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { AssignPermissionsDto } from './assign-permissions.dto';

export class AssignMultiplePermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AssignPermissionsDto)
  permissions: AssignPermissionsDto[];
}
