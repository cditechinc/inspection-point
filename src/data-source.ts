import { Check, DataSource, DataSourceOptions } from 'typeorm';

import { Client } from './client/entities/client.entity';
import { User } from './user/entities/user.entity';
import { UserIP } from './user/entities/user-ip.entity';
import { UserSession } from './user/entities/user-session.entity';
import { Log } from './user/entities/log.entity';
import { Customer } from './customer/entities/customer.entity';
import { Asset } from './assets/entities/asset.entity';
import { Photo } from './assets/entities/photo.entity';
import { Pump } from './assets/entities/pump.entity';
import { PumpBrand } from './assets/entities/pump-brand.entity';
import { AssetType } from './assets/entities/asset-type.entity';
import { AssetPump } from './assets/entities/asset-pump.entity';
import { CombinedMigration20240722162333 } from './migrations/combinedMigration';
import { InspectionModuleMigration20240804123456 } from './migrations/inspectionModule';
import { Inspection } from './inspection/entities/inspection.entity';
import { Invoice } from './invoice/entities/invoice.entity';
import { AddInvoicesTableWithQuickBooksFields20240901123456 } from './migrations/invoicesModule';
import { UserGroup } from './user-groups/entities/user-group.entity';
import { UserGroupMembership } from './user-groups/entities/user-group-membership.entity';
import { UserGroupPermission } from './user-groups/entities/user-group-permission.entity';
import { Permission } from './permissions/entities/permission.entity';
import { AddSecurityGroupsAndPermissions20240905123456 } from './migrations/securityGroupsAndPermissions';
import { Company } from './company/entities/company.entity';
import { CompanyMigration20240721123456 } from './migrations/companyModule';
import { InvoiceItem } from './invoice/entities/invoice-item.entity';
import { Services } from './invoice/entities/services.entity';
import { ChecklistTemplate } from './checklist/entities/checklist-template.entity';
import { ChecklistQuestion } from './checklist/entities/checklist-question.entity';
import { InspectionChecklist } from './checklist/entities/inspection-checklist.entity';
import { InspectionChecklistAnswer } from './checklist/entities/inspection-checklist-answer.entity';


const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  
  host: process.env.DATABASE_HOST || '172.31.23.247',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'utilitypointuser',
  password: process.env.DATABASE_PASSWORD || 'UtilityPointApp',
  database: process.env.DATABASE_NAME || 'utilitypoint',

  // host: process.env.DATABASE_HOST || 'localhost',
  // port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  // username: process.env.DATABASE_USER || 'postgres',
  // password: process.env.DATABASE_PASSWORD || 'postgres',
  // database: process.env.DATABASE_NAME || 'utilityPoint',
  entities: [
    Client,
    Customer,
    User,
    UserIP,
    UserSession,
    Log,
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
    ChecklistTemplate,
    ChecklistQuestion,
    InspectionChecklist,
    InspectionChecklistAnswer,
  ],
  migrations: [
    CompanyMigration20240721123456,
    CombinedMigration20240722162333,
    InspectionModuleMigration20240804123456,
    AddInvoicesTableWithQuickBooksFields20240901123456,
    AddSecurityGroupsAndPermissions20240905123456,
  ],
  synchronize: false,
  logging: true,
  extra: {
    ssl:
      process.env.SSL_MODE === 'require'
        ? {
            rejectUnauthorized: false,
          }
        : false,
  },
};

const AppDataSource = new DataSource(dataSourceOptions);

export { dataSourceOptions, AppDataSource };
