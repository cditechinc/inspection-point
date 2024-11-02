import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { UserIP } from './entities/user-ip.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserGroupMembership } from './../user-groups/entities/user-group-membership.entity';
import { UserGroupModule } from './../user-groups/user-group.module';
import { Logs } from './../logs/entities/log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession, UserIP, Logs, UserGroupMembership]),
  UserGroupModule
],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
