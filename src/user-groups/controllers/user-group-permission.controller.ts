import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Body,
    UseGuards,
  } from '@nestjs/common';
  import { UserGroupPermissionService } from './../services/user-group-permission.service';
  import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
  import { RolesGuard } from './../../auth/guards/roles.guard';
  import { Roles } from './../../auth/decorators/roles.decorator';
  import { Role } from './../../auth/role.enum';
  import { CreateUserGroupPermissionDto } from './../dto/create-user-group-permission.dto';
  import { UpdateUserGroupPermissionDto } from './../dto/update-user-group-permission.dto';
  
  @Controller('user-groups/:id/permissions')
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
    @Post()
    @Roles(Role.Admin, Role.ClientAdmin)
    async assignPermissions(@Param('id') groupId: string, @Body() createPermissionDto: CreateUserGroupPermissionDto) {
      return this.permissionService.assignPermissions(groupId, createPermissionDto);
    }
  
    // Update permissions for a group
    @Put(':permissionId')
    @Roles(Role.Admin, Role.ClientAdmin)
    async updatePermissions(
      @Param('id') groupId: string,
      @Param('permissionId') permissionId: string,
      @Body() updatePermissionDto: UpdateUserGroupPermissionDto,
    ) {
      return this.permissionService.updatePermissions(permissionId, updatePermissionDto);
    }
  }
  