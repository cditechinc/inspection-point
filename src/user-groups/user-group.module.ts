import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGroup } from './entities/user-group.entity';
import { UserGroupMembership } from './entities/user-group-membership.entity';
import { UserGroupPermission } from './entities/user-group-permission.entity';
import { UserGroupService } from './services/user-group.service';
import { UserGroupMembershipService } from './services/user-group-membership.service';
import { UserGroupPermissionService } from './services/user-group-permission.service';
import { UserGroupController } from './controllers/user-group.controller';
import { UserGroupMembershipController } from './controllers/user-group-membership.controller';
import { UserGroupPermissionController } from './controllers/user-group-permission.controller';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserGroup, UserGroupMembership, UserGroupPermission, User])],
  controllers: [
    UserGroupController,
    UserGroupMembershipController,
    UserGroupPermissionController,
  ],
  providers: [
    UserGroupService,
    UserGroupMembershipService,
    UserGroupPermissionService,
  ],
  exports: [UserGroupService, UserGroupMembershipService, UserGroupPermissionService],
})
export class UserGroupModule {}
