// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
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
    TypeOrmModule.forFeature([User, UserSession, UserIP, Log]),
    ClientModule,
    AwsModule,
  ],
  providers: [AuthService, UserService, ClientService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
