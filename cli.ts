import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './src/data-source';
import { execSync } from 'child_process';
import { AssetTypeSeed } from './src/seeds/asset-type.seed'; // Import the AssetType seeder

const AppDataSource = new DataSource(dataSourceOptions);

const args = process.argv.slice(2);
const command = args.join(' ');

AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source has been initialized!');
    
    if (command === 'seed:asset-types') {
      // Run the asset type seeder
      console.log('Seeding asset types...');
      const assetTypeSeed = new AssetTypeSeed(AppDataSource.getRepository('AssetType'));
      await assetTypeSeed.run();
      console.log('Asset types have been seeded successfully!');
      process.exit(0); // Exit the process after the seed is completed
    } else {
      // Run TypeORM commands as usual
      execSync(`typeorm-ts-node-commonjs ${command}`, {
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_OPTIONS: '-r tsconfig-paths/register -r dotenv/config',
        },
      });
    }
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
