import { IsString, IsArray, IsNotEmpty, IsIn, ArrayNotEmpty } from 'class-validator';
import { Action } from './../../common/enums/action.enum';
import { Resource } from './../../common/enums/resource.enum';

export class AssignPermissionsDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(Resource))
  resource: Resource;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsIn(Object.values(Action), { each: true })
  actions: Action[];
}
