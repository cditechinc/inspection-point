// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CustomConfigModule } from './config/config.module';
import { User } from './user/entities/user.entity';
import { UserSession } from './user/entities/user-session.entity';
import { UserIP } from './user/entities/user-ip.entity';
import { Log } from './user/entities/log.entity';
import { ClientModule } from './client/client.module';
import { Client } from './client/entities/client.entity';

@Module({
  imports: [
    CustomConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User, Client, UserSession, UserIP, Log],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    ClientModule,
  ],
})
export class AppModule {}
