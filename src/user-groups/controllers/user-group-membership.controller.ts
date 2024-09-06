import {
    Controller,
    Post,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
    BadRequestException,
  } from '@nestjs/common';
  import { UserGroupMembershipService } from './../services/user-group-membership.service';
  import { JwtAuthGuard } from './../../auth/guards/jwt-auth.guard';
  import { RolesGuard } from './../../auth/guards/roles.guard';
  import { Roles } from './../../auth/decorators/roles.decorator';
  import { Role } from './../../auth/role.enum';
  import { AddUserToGroupDto } from './../dto/create-user-group-membership.dto';
  
  @Controller('user-groups/:id/memberships')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class UserGroupMembershipController {
    constructor(private readonly membershipService: UserGroupMembershipService) {}
  
    // Add a user to a group
    @Post('add-user')
    @Roles(Role.Admin, Role.ClientAdmin)
    async addUserToGroup(@Param('id') groupId: string, @Body() addUserToGroupDto: AddUserToGroupDto) {
      const { userId } = addUserToGroupDto;
      return this.membershipService.addUserToGroup(userId, groupId);
    }
  
    // Remove a user from a group
    @Delete('remove-user/:userId')
    @Roles(Role.Admin, Role.ClientAdmin)
    async removeUserFromGroup(@Param('id') groupId: string, @Param('userId') userId: string) {
      return this.membershipService.removeUserFromGroup(userId, groupId);
    }
  }
  