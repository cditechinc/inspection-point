import { DataSource, DataSourceOptions } from 'typeorm';


import { Client } from './client/entities/client.entity';
import { User } from './user/entities/user.entity';
import { UserIP } from './user/entities/user-ip.entity';
import { UserSession } from './user/entities/user-session.entity';
import { Log } from './user/entities/log.entity';
import { InitialMigration1628879943693 } from './migrations/InitialMigration';
// Example migrations (adjust these to your actual migrations)
// import { InitialMigration } from './migration/InitialMigration';

const dataSourceOptions: DataSourceOptions  = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'inspection',
  entities: [Client, User, UserIP, UserSession, Log],
  migrations: [InitialMigration1628879943693],
  synchronize: false,
  logging: true,
  extra: {
    ssl: process.env.SSL_MODE === 'require'
      ? {
          rejectUnauthorized: false,
        }
      : false,
  },
};

const AppDataSource = new DataSource(dataSourceOptions);

export { dataSourceOptions, AppDataSource };
