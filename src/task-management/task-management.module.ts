// src/task-management/task-management.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskStatus } from './entities/task-status.entity';
import { TaskType } from './entities/task-type.entity';
import { TaskStatusHistory } from './entities/task-status-history.entity';
import { TaskFile } from './entities/task-file.entity';
import { ClientTaskSettings } from './entities/client-task-settings.entity';
import { TaskService } from './services/task.service';
import { TaskStatusService } from './services/task-status.service';
import { TaskTypeService } from './services/task-type.service';
import { ClientTaskSettingsService } from './services/client-task-settings.service';
import { TaskController } from './controllers/task.controller';
import { TaskStatusController } from './controllers/task-status.controller';
import { TaskTypeController } from './controllers/task-type.controller';
import { ClientTaskSettingsController } from './controllers/client-task-settings.controller';
import { UserModule } from './../user/user.module';
import { AssetsModule } from './../assets/assets.module';
import { Asset } from './../assets/entities/asset.entity';
import { UserGroupModule } from './../user-groups/user-group.module';
import { TaskStatusHistoryService } from './services/task-status-history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskStatus,
      TaskType,
      TaskStatusHistory,
      TaskFile,
      ClientTaskSettings,
      Asset
    ]),
    // Import other necessary modules (e.g., UserModule, AssetModule)
    UserModule,
    AssetsModule,
    UserGroupModule,
  ],
  controllers: [
    TaskController,
    TaskStatusController,
    TaskTypeController,
    ClientTaskSettingsController,
    TaskStatusController,
  ],
  providers: [
    TaskService,
    TaskStatusService,
    TaskTypeService,
    ClientTaskSettingsService,
    TaskStatusHistoryService
  ],
})
export class TaskManagementModule {}
