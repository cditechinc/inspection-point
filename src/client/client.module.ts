// src/client/client.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { Client } from './entities/client.entity';
import { AwsService } from './../aws/aws.service';
import { UserModule } from './../user/user.module';
import { AssetsModule } from './../assets/assets.module';
import { AuthModule } from './../auth/auth.module';
import { QuickBooksOAuthService } from './../auth/quickbooks-oauth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    UserModule,
    AssetsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [ClientController],
  providers: [ClientService, AwsService, QuickBooksOAuthService],
  exports: [ClientService, TypeOrmModule],
})
export class ClientModule {}
