import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './src/data-source';
import { execSync } from 'child_process';
// import dotenv from 'dotenv';

// // Load environment variables from .env file
// dotenv.config();

// console.log('Environment variables loaded:');
// console.log('DB_HOST:', process.env.DATABASE_HOST);
// console.log('DB_PORT:', process.env.DATABASE_PORT);
// console.log('DATABASE_USERNAME:', process.env.DATABASE_USERNAME);
// console.log('DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD);
// console.log('DATABASE_NAME:', process.env.DATABASE_NAME);

const AppDataSource = new DataSource(dataSourceOptions);

const args = process.argv.slice(2);
const command = args.join(' ');

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    execSync(`typeorm-ts-node-commonjs ${command}`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '-r tsconfig-paths/register -r dotenv/config',
      },
    });
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
