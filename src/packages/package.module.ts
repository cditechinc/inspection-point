import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { Package } from './entities/package.entity';
import { UserGroupModule } from './../user-groups/user-group.module';

@Module({
  imports: [TypeOrmModule.forFeature([Package]),
  UserGroupModule,
],
  controllers: [PackageController],
  providers: [PackageService],
  exports: [PackageService],
})
export class PackageModule {}