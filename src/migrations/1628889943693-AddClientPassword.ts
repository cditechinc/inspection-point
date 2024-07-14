import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientPassword1628889943693 implements MigrationInterface {
  name = 'AddClientPassword1628889943693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "clients"
      ADD "password" character varying NOT NULL DEFAULT 'default_password';
    `);

    // Optionally remove the default if you don't want new records to use it
    await queryRunner.query(`
      ALTER TABLE "clients"
      ALTER COLUMN "password" DROP DEFAULT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "clients"
      DROP COLUMN "password";
    `);
  }
}
