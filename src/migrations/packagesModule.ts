import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddPackagesTable20241101123456 implements MigrationInterface {
    name = 'AddPackagesTable20241101123456';
  
    public async up(queryRunner: QueryRunner): Promise<void> {
      // 1. Check if the "packages" table already exists
      const hasPackagesTable = await queryRunner.hasTable('packages');
      if (!hasPackagesTable) {
        // Create the "packages" table
        await queryRunner.query(`
          CREATE TABLE "packages" (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "name" VARCHAR(255) NOT NULL UNIQUE,
            "monthly_price" DECIMAL(10, 2) NOT NULL,
            "yearly_price" DECIMAL(10, 2) NOT NULL,
            "customer_limit" INTEGER,
            "asset_limit" INTEGER,
            "user_limit" INTEGER,
            "inspection_limit" INTEGER,
            "photo_storage_limit" INTEGER,
            "video_storage_limit" INTEGER,
            "pdf_storage_limit" INTEGER,
            "sms_limit" INTEGER,
            "customer_portal" BOOLEAN DEFAULT FALSE,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('Created "packages" table.');
      } else {
        console.log('"packages" table already exists. Skipping creation.');
      }
  
      // 2. Check if the "package_id" column already exists in "companies" table
      const hasPackageIdColumn = await queryRunner.hasColumn('companies', 'package_id');
      if (!hasPackageIdColumn) {
        // Add the "package_id" column
        await queryRunner.query(`
          ALTER TABLE "companies"
          ADD COLUMN "package_id" uuid;
        `);
        console.log('Added "package_id" column to "companies" table.');
  
        // 3. Create a foreign key for "package_id" referencing "packages.id"
        await queryRunner.createForeignKey('companies', new TableForeignKey({
          columnNames: ['package_id'],
          referencedTableName: 'packages',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }));
        console.log('Created foreign key for "package_id" in "companies" table.');
      } else {
        console.log('"package_id" column already exists in "companies" table. Skipping alteration.');
      }
    }
  
    public async down(queryRunner: QueryRunner): Promise<void> {
      // 1. Check if the "package_id" column exists in "companies" table
      const hasPackageIdColumn = await queryRunner.hasColumn('companies', 'package_id');
      if (hasPackageIdColumn) {
        // 2. Retrieve the foreign key associated with "package_id"
        const table = await queryRunner.getTable('companies');
        if (table) {
          const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('package_id') !== -1);
          if (foreignKey) {
            // Drop the foreign key
            await queryRunner.dropForeignKey('companies', foreignKey);
            console.log('Dropped foreign key for "package_id" in "companies" table.');
          }
        }

        // 3. Drop the "package_id" column
        await queryRunner.query(`
          ALTER TABLE "companies"
          DROP COLUMN "package_id";
        `);
        console.log('Dropped "package_id" column from "companies" table.');
      } else {
        console.log('"package_id" column does not exist in "companies" table. Skipping alteration.');
      }
  
      // 4. Check if the "packages" table exists
      const hasPackagesTable = await queryRunner.hasTable('packages');
      if (hasPackagesTable) {
        // Drop the "packages" table
        await queryRunner.query(`DROP TABLE "packages";`);
        console.log('Dropped "packages" table.');
      } else {
        console.log('"packages" table does not exist. Skipping drop.');
      }
    }
}
