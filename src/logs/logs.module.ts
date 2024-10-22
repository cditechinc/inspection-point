import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from './services/logs.service';
import { LogsController } from './logs.controller';
import { Log } from './entities/log.entity';
import { UserModule } from '../user/user.module';  // Import user module for relations
import { UserGroupModule } from './../user-groups/user-group.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Log]),
    UserModule,  // To inject the User entity
    UserGroupModule
  ],
  providers: [LogsService],
  controllers: [LogsController],
})
export class LogsModule {}
