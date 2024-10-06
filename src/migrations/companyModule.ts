import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompanyMigration20241006123456 implements MigrationInterface {
  name = 'CompanyMigration20241006123456';

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
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_companies_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the companies table
    await queryRunner.query(`DROP TABLE "companies";`);
  }
}
