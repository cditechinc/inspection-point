import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomerTable1628879943693 implements MigrationInterface {
  name = 'CreateCustomerTable1628879943693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) NOT NULL,
        "phone" VARCHAR(50),
        "address" VARCHAR(255),
        "service_address" VARCHAR(255),
        "billing_address" VARCHAR(255),
        "type" VARCHAR(50),
        "status" VARCHAR(50) CHECK (status IN ('Active', 'Inactive')),
        "gate_code" VARCHAR(255),
        "previous_phone_number" VARCHAR(50),
        "service_contact" VARCHAR(255),
        "client_id" uuid REFERENCES "clients"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "customers";`);
  }
}
