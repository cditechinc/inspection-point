import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CustomConfigModule } from './config/config.module';
import { User } from './user/entities/user.entity';
import { UserSession } from './user/entities/user-session.entity';
import { UserIP } from './user/entities/user-ip.entity';
import { ClientModule } from './client/client.module';
import { Client } from './client/entities/client.entity';
import { Customer } from './customer/entities/customer.entity';
import { CustomerModule } from './customer/customer.module';
import { AssetsModule } from './assets/assets.module';
import { Asset } from './assets/entities/asset.entity';
import { Photo } from './assets/entities/photo.entity';
import { Pump } from './assets/entities/pump.entity';
import { PumpBrand } from './assets/entities/pump-brand.entity';
import { AssetType } from './assets/entities/asset-type.entity';
import { AssetPump } from './assets/entities/asset-pump.entity';
import { Inspection } from './inspection/entities/inspection.entity';
import { InspectionModule } from './inspection/inspection.module';
import { ReportModule } from './reports/report.module';
import { Invoice } from './invoice/entities/invoice.entity';
import { InvoiceModule } from './invoice/invoice.module';
import { UserGroup } from './user-groups/entities/user-group.entity';
import { UserGroupMembership } from './user-groups/entities/user-group-membership.entity';
import { UserGroupPermission } from './user-groups/entities/user-group-permission.entity';
import { Permission } from './permissions/entities/permission.entity';
import { UserGroupModule } from './user-groups/user-group.module';
import { PermissionModule } from './permissions/permission.module';
import { QuickBooksOAuthService } from './auth/quickbooks-oauth.service';
import { QuickBooksController } from './quickbooks.controller';
import { Company } from './company/entities/company.entity';
import { CompanyModule } from './company/company.module';
import { InvoiceItem } from './invoice/entities/invoice-item.entity';
import { Services } from './invoice/entities/services.entity';
import { ChecklistTemplate } from './checklist/entities/checklist-template.entity';
import { ChecklistQuestion } from './checklist/entities/checklist-question.entity';
import { InspectionChecklist } from './checklist/entities/inspection-checklist.entity';
import { InspectionChecklistAnswer } from './checklist/entities/inspection-checklist-answer.entity';
import { ChecklistModule } from './checklist/checklist.module';
import { LogsModule } from './logs/logs.module';
import { Logs } from './logs/entities/log.entity';
import { Package } from './packages/entities/package.entity';
import { PackageModule } from './packages/package.module';
import { Task } from './task-management/entities/task.entity';
import { TaskStatus } from './task-management/entities/task-status.entity';
import { TaskStatusHistory } from './task-management/entities/task-status-history.entity';
import { TaskType } from './task-management/entities/task-type.entity';
import { TaskFile } from './task-management/entities/task-file.entity';
import { ClientTaskSettings } from './task-management/entities/client-task-settings.entity';
import { TaskManagementModule } from './task-management/task-management.module';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { IpGeolocationService } from './common/services/ip-geolocation.service';
import { RoutesModule } from './routes/routes.module';

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
        entities: [
          User,
          Task,
          TaskStatus,
          TaskStatusHistory,
          TaskType,
          TaskFile,
          ClientTaskSettings,
          Client,
          Customer,
          UserSession,
          UserIP,
          Logs,
          Asset,
          Photo,
          Pump,
          PumpBrand,
          AssetType,
          AssetPump,
          Inspection,
          Invoice,
          InvoiceItem,
          Services,
          UserGroup,
          UserGroupMembership,
          UserGroupPermission,
          Permission,
          Company,
          Package,
          ChecklistTemplate,
          ChecklistQuestion,
          InspectionChecklist,
          InspectionChecklistAnswer,
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    TaskManagementModule,
    ClientModule,
    CustomerModule,
    AssetsModule,
    InspectionModule,
    ReportModule,
    InvoiceModule,
    UserGroupModule,
    PermissionModule,
    CompanyModule,
    PackageModule,
    ChecklistModule,
    LogsModule,
    RoutesModule
  ],
  providers: [QuickBooksOAuthService, IpGeolocationService], // Add the QuickBooks service as a provider
  controllers: [QuickBooksController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*'); // Apply to all routes
  }
}
