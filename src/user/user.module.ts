import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { UserIP } from './entities/user-ip.entity';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserGroupMembership } from './../user-groups/entities/user-group-membership.entity';
import { UserGroupModule } from './../user-groups/user-group.module';
import { Logs } from './../logs/entities/log.entity';
import { SessionService } from './services/session.service';
import { SessionCleanupService } from './services/session-cleanup.service';
import { SessionController } from './controllers/session.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession, UserIP, Logs, UserGroupMembership]),
  UserGroupModule
],
  providers: [UserService, SessionService, SessionCleanupService],
  controllers: [UserController, SessionController],
  exports: [UserService, SessionService, TypeOrmModule],
})
export class UserModule {}
