import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Body,
    UseGuards,
    Request,
    Patch,
  } from '@nestjs/common';
  import { PermissionService } from './permission.service';
  import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
  import { RolesGuard } from './../auth/guards/roles.guard';
  import { Roles } from './../auth/decorators/roles.decorator';
  import { Role } from '../auth/role.enum';
  import { CreatePermissionDto } from './dto/create-permission.dto';
  import { UpdatePermissionDto } from './dto/update-permission.dto';
  
  @Controller('permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}
  
    // Assign permissions to a user
    @Post('assign/:userId')
    @Roles(Role.Admin, Role.ClientAdmin)
    async assignPermissions(@Param('userId') userId: string, @Body() createPermissionDto: CreatePermissionDto) {
      return this.permissionService.assignPermissions(userId, createPermissionDto);
    }
  
    // Get permissions for a user
    @Get('user/:userId')
    @Roles(Role.Admin, Role.ClientAdmin)
    async getUserPermissions(@Param('userId') userId: string) {
      return this.permissionService.getUserPermissions(userId);
    }
  
    // Update permissions for a user
    @Patch('update/:permissionId')
    @Roles(Role.Admin, Role.ClientAdmin)
    async updatePermissions(
      @Param('permissionId') permissionId: string,
      @Body() updatePermissionDto: UpdatePermissionDto,
    ) {
      return this.permissionService.updatePermissions(permissionId, updatePermissionDto);
    }
  }
  