import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { UserIP } from './entities/user-ip.entity';
import { Log } from './entities/log.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserGroupMembership } from './../user-groups/entities/user-group-membership.entity';
import { UserGroupModule } from './../user-groups/user-group.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession, UserIP, Log, UserGroupMembership]),
  UserGroupModule
],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
