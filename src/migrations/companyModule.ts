import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompanyMigration20240721123456 implements MigrationInterface {
  name = 'CompanyMigration20240721123456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the companies table
    await queryRunner.query(`
      CREATE TABLE "companies" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "client_id" uuid UNIQUE NOT NULL,
        "company_name" character varying NOT NULL,
        "company_type" character varying,
        "industry" character varying,
        "company_logo" character varying,
        "address" character varying,
        "billing_address" character varying,
        "city" character varying,
        "state" character varying,
        "zipcode" character varying,
        "phone" character varying,
        "website" character varying,
        "email" character varying,
        "phone2" character varying,
        "payment_method" character varying,
        "package_id" uuid REFERENCES "packages"("id") ON DELETE SET NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the companies table
    await queryRunner.query(`DROP TABLE "companies";`);
  }
}
