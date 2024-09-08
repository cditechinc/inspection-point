import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import { UserGroupPermissionService } from './../services/user-group-permission.service';
import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
import { RolesGuard } from './../../auth/guards/roles.guard';
import { Roles } from './../../auth/decorators/roles.decorator';
import { Role } from './../../auth/role.enum';
import { CreateUserGroupPermissionDto } from './../dto/create-user-group-permission.dto';
import { UpdateUserGroupPermissionDto } from './../dto/update-user-group-permission.dto';
import { AssignMultiplePermissionsDto } from '../dto/assign-multiple-permissions.dto';
import { UserGroupPermission } from '../entities/user-group-permission.entity';

@Controller('user-groups/:groupId/permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserGroupPermissionController {
  constructor(private readonly permissionService: UserGroupPermissionService) {}

  // Get all permissions for a group
  @Get()
  @Roles(Role.Admin, Role.ClientAdmin)
  async getPermissions(@Param('id') groupId: string) {
    return this.permissionService.getGroupPermissions(groupId);
  }

  // Assign permissions to a group
  // @Post()
  // @Roles(Role.ClientAdmin)
  // async assignPermissions(
  //   @Param('groupId') groupId: string,
  //   @Body() assignMultiplePermissionsDto: AssignMultiplePermissionsDto,
  // ): Promise<UserGroupPermission[]> {
  //   return this.permissionService.assignPermissions(
  //     groupId,
  //     assignMultiplePermissionsDto,
  //   );
  // }

  @Post('/custom-assign')
  @Roles(Role.ClientAdmin) // Only client admins can assign permissions to user groups
  async assignCustomPermissions(
    @Param('groupId') groupId: string,
    @Body() assignMultiplePermissionsDto: AssignMultiplePermissionsDto,
  ): Promise<UserGroupPermission[]> {
    console.log('Assigning permissions to group:', groupId);
    return this.permissionService.assignCustomPermissions(
      groupId,
      assignMultiplePermissionsDto,
    );
  }

  //   @Delete()
  // @Roles(Role.ClientAdmin)
  // async removePermissions(
  //   @Param('groupId') groupId: string,
  //   @Body() removePermissionsDto: AssignMultiplePermissionsDto, // Or create a separate RemovePermissionsDto
  // ): Promise<void> {
  //   return this.permissionService.removePermissions(groupId, removePermissionsDto);
  // }

  // Update permissions for a group
  @Patch(':permissionId')
  @Roles(Role.Admin, Role.ClientAdmin)
  async updatePermissions(
    @Param('id') groupId: string,
    @Param('permissionId') permissionId: string,
    @Body() updatePermissionDto: UpdateUserGroupPermissionDto,
  ) {
    return this.permissionService.updatePermissions(
      permissionId,
      updatePermissionDto,
    );
  }
}
