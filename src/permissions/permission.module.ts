import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { User } from '../user/entities/user.entity';
import { AuthModule } from './../auth/auth.module';
import { UserGroupModule } from './../user-groups/user-group.module';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, User]), forwardRef(() => AuthModule), UserGroupModule],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
