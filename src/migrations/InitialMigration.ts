import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1628879943693 implements MigrationInterface {
  name = 'InitialMigration1628879943693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "address" character varying NOT NULL,
        "billing_address" character varying NOT NULL,
        "payment_method" character varying NOT NULL,
        "type" character varying NOT NULL,
        "status" character varying NOT NULL,
        "next_bill_date" date NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clients_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_clients_name" UNIQUE ("name"),
        CONSTRAINT "UQ_clients_email" UNIQUE ("email")
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "email" character varying NOT NULL,
        "role" character varying NOT NULL,
        "created_by" character varying,
        "phone" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_client_admin" boolean NOT NULL DEFAULT false,
        "is_customer_admin" boolean NOT NULL DEFAULT false,
        "last_login" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "two_factor_authentication_secret" character varying,
        "quickbooks_customer_id" character varying,
        "quickbooks_sync_date" TIMESTAMP,
        "clientId" uuid,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "FK_users_clientId" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "action" character varying NOT NULL,
        "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "details" jsonb,
        "userId" uuid,
        CONSTRAINT "PK_logs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_logs_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "user_ips" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ip_address" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" uuid,
        CONSTRAINT "PK_user_ips_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_ips_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "user_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ip_address" character varying NOT NULL,
        "session_token" character varying NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" uuid,
        CONSTRAINT "PK_user_sessions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_sessions_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
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
