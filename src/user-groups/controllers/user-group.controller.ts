import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
    BadRequestException,
    Patch,
  } from '@nestjs/common';
  import { UserGroupService } from './../services/user-group.service';
  import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
  import { RolesGuard } from './../../auth/guards/roles.guard';
  import { Roles } from './../../auth/decorators/roles.decorator';
  import { Role } from './../../auth/role.enum';
  import { CreateUserGroupDto } from './../dto/create-user-group.dto';
  import { UpdateUserGroupDto } from './../dto/update-user-group.dto';
  
  @Controller('user-groups')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class UserGroupController {
    constructor(private readonly userGroupService: UserGroupService) {}
  
    // Get all user groups
    @Get()
    @Roles(Role.Admin, Role.ClientAdmin)
    async findAll(@Request() req) {
      const clientId = req.user.clientId;
      return this.userGroupService.findAll(clientId);
    }
  
    // Get a single user group
    @Get(':id')
    @Roles(Role.Admin, Role.ClientAdmin)
    async findOne(@Param('id') id: string) {
      return this.userGroupService.findOne(id);
    }
  
    // Create a new user group
    @Post()
    @Roles(Role.Admin, Role.ClientAdmin)
    async create(@Request() req, @Body() createUserGroupDto: CreateUserGroupDto) {
      const clientId = req.user.clientId;
      return this.userGroupService.create(clientId, createUserGroupDto);
    }
  
    // Update a user group
    @Patch(':id')
    @Roles(Role.Admin, Role.ClientAdmin)
    async update(@Param('id') id: string, @Body() updateUserGroupDto: UpdateUserGroupDto) {
      return this.userGroupService.update(id, updateUserGroupDto);
    }
  
    // Delete a user group (only if no users are assigned)
    @Delete(':id')
    @Roles(Role.Admin, Role.ClientAdmin)
    async remove(@Param('id') id: string) {
      return this.userGroupService.remove(id);
    }
  }
  