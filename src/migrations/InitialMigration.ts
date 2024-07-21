import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1628879943693 implements MigrationInterface {
  name = 'InitialMigration1628879943693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL UNIQUE,
        "email" character varying NOT NULL UNIQUE,
        "phone" character varying,
        "address" character varying,
        "billing_address" character varying,
        "industry" character varying,
        "payment_method" character varying,
        "account_status" character varying CHECK (account_status IN ('Active', 'Disabled', 'Fraud', 'Inactive')) DEFAULT 'Active',
        "custom_portal_url" character varying,
        "tax_exempt" boolean DEFAULT FALSE,
        "protected" boolean DEFAULT FALSE,
        "email_verified" boolean DEFAULT FALSE,
        "next_bill_date" date,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL UNIQUE,
        "password_hash" character varying NOT NULL,
        "email" character varying NOT NULL UNIQUE,
        "role" character varying CHECK (role IN ('admin', 'client_admin', 'customer_admin', 'client', 'customer', 'employee')),
        "created_by" uuid,
        "client_id" uuid,
        "customer_id" uuid,
        "phone" character varying,
        "is_active" boolean DEFAULT TRUE,
        "is_client_admin" boolean DEFAULT FALSE,
        "is_customer_admin" boolean DEFAULT FALSE,
        "last_login" TIMESTAMP,
        "last_login_ip" inet,
        "last_gps_location" point,
        "title" character varying,
        "profile_image" character varying,
        "two_factor_enabled" boolean DEFAULT FALSE,
        "two_factor_details" jsonb,
        "two_factor_authentication_secret" character varying,
        "quickbooks_customer_id" character varying,
        "quickbooks_sync_date" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_users_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_users_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_users_customer_id" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "action" character varying NOT NULL,
        "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "details" jsonb,
        "user_id" uuid,
        CONSTRAINT "FK_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "user_ips" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ip_address" inet NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "user_id" uuid,
        CONSTRAINT "FK_user_ips_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "user_sessions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ip_address" inet NOT NULL,
        "session_token" character varying NOT NULL,
        "expires_at" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "user_id" uuid,
        CONSTRAINT "FK_user_sessions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_sessions";`);
    await queryRunner.query(`DROP TABLE "user_ips";`);
    await queryRunner.query(`DROP TABLE "logs";`);
    await queryRunner.query(`DROP TABLE "users";`);
    await queryRunner.query(`DROP TABLE "clients";`);
  }
}
