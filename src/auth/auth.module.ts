// src/auth/auth.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { UserSession } from '../user/entities/user-session.entity';
import { UserIP } from '../user/entities/user-ip.entity';
import { Log } from '../user/entities/log.entity';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { ClientModule } from '../client/client.module';
import { AwsModule } from './../aws/aws.module';
import { RolesGuard } from './guards/roles.guard';
import { QuickBooksStrategy } from './strategies/quickbooks.strategy';
import { QuickBooksOAuthService } from './quickbooks-oauth.service';
import { UserGroupModule } from './../user-groups/user-group.module';
import { PermissionsGuard } from './guards/permissions.guard';
import { Logs } from './../logs/entities/log.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, UserSession, UserIP, Log, Logs]),
    forwardRef(() => ClientModule),
    AwsModule,
    forwardRef(() => UserGroupModule),
  ],
  providers: [
    AuthService,
    UserService,
    ClientService,
    LocalStrategy,
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
    QuickBooksStrategy,
    QuickBooksOAuthService,
  ],
  controllers: [AuthController],
  exports: [AuthService, UserService, RolesGuard, JwtModule, QuickBooksOAuthService, PermissionsGuard],
})
export class AuthModule {}
