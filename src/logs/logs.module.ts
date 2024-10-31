import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from './services/logs.service';
import { LogsController } from './logs.controller';
import { Logs } from './entities/log.entity';
import { UserModule } from '../user/user.module';
import {User} from './../user/entities/user.entity';  
import { UserGroupModule } from './../user-groups/user-group.module';
import { AuthModule } from './../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Logs, User]),
    UserModule,  // To inject the User entity
    UserGroupModule,
    AuthModule,
  ],
  providers: [LogsService],
  controllers: [LogsController],
})
export class LogsModule {}
