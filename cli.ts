import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './src/data-source';
import { execSync } from 'child_process';
import { AssetTypeSeed } from './src/seeds/asset-type.seed';
import { ChecklistTemplateSeed } from './src/seeds/checklist-template.seed';
import { ChecklistTemplate } from './src/checklist/entities/checklist-template.entity';
import { ChecklistQuestion } from './src/checklist/entities/checklist-question.entity';
import { AssetType } from './src/assets/entities/asset-type.entity';

const AppDataSource = new DataSource(dataSourceOptions);

const args = process.argv.slice(2);
const command = args.join(' ');

AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source has been initialized!');

    if (command === 'seed:asset-types') {
      // Run the asset type seeder
      console.log('Seeding asset types...');
      const assetTypeSeed = new AssetTypeSeed(
        AppDataSource.getRepository(AssetType),
      );
      await assetTypeSeed.run();
      console.log('Asset types have been seeded successfully!');
      process.exit(0); // Exit the process after the seed is completed
    } else if (command === 'seed:checklist-templates') {
      // Run the checklist template seeder
      console.log('Seeding checklist template...');
      const checklistTemplateSeed = new ChecklistTemplateSeed(
        AppDataSource.getRepository(ChecklistTemplate),
        AppDataSource.getRepository(ChecklistQuestion), // Pass both repositories
      );
      await checklistTemplateSeed.run();
      console.log('Checklist template has been seeded successfully!');
      process.exit(0);
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
