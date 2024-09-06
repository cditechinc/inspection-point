import { IsUUID, IsNotEmpty } from 'class-validator';

export class AddUserToGroupDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  userGroupId: string;
}
