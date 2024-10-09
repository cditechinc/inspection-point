import { MigrationInterface, QueryRunner } from 'typeorm';

export class CombinedMigration20240722162333 implements MigrationInterface {
  name = 'CombinedMigration20240722162333';

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "clients" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "first_name" character varying,
        "last_name" character varying,
        "email" character varying NOT NULL UNIQUE,
        "phone" character varying,
        "address" character varying,
        "account_status" character varying CHECK (account_status IN ('Active', 'Disabled', 'Fraud', 'Inactive')) DEFAULT 'Active',
        "tax_exempt" boolean DEFAULT FALSE,
        "protected" boolean DEFAULT FALSE,
        "email_verified" boolean DEFAULT FALSE,
        "next_bill_date" date,
        "quickbooksAccessToken" character varying,
        "quickbooksRefreshToken" character varying,
        "quickbooksRealmId" character varying,
        "quickbooksTokenExpiresIn" TIMESTAMP,
        "quickbooksState" character varying,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "company_id" uuid,
        CONSTRAINT "FK_clients_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customers" (
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
        "previousProvider" VARCHAR(255),
        "photos" text[],
        "billingContactEmail" VARCHAR(255),
        "service_contact" VARCHAR(255),
        "quickbooksCustomerId" character varying,
        "client_id" uuid REFERENCES "clients"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
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
        "is_protected_user" BOOLEAN DEFAULT FALSE,
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
      CREATE TABLE IF NOT EXISTS "asset_types" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "assets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "client_id" uuid,  
        "customer_id" uuid, 
        "name" character varying NOT NULL,
        "type" uuid,
        "location" character varying,
        "latitude" character varying,
        "longitude" character varying,
        "status" character varying CHECK (status IN ('active', 'inactive', 'maintenance')),
        "inspection_interval" character varying,
        "qr_code" character varying,
        "nfc_code" character varying,
        "pipe_dia" character varying,
        "smart" character varying,
        "size" character varying,
        "material" character varying,
        "delete_protect" character varying,
        "duty" character varying,
        "rails" character varying,
        "float" character varying,
        "pumps" character varying,
        "power" character varying,
        "photos" text[],
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_assets_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_assets_customer_id" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_assets_type" FOREIGN KEY ("type") REFERENCES "asset_types"("id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_assets_client_id" ON "assets" ("client_id");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_assets_customer_id" ON "assets" ("customer_id");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_assets_type" ON "assets" ("type");
    `);
    

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "pump_brands" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL UNIQUE,
        "model" character varying,
        "website" character varying,
        "phone" character varying,
        "address" character varying,
        "made_in_usa" boolean,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "pumps" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "asset_id" uuid,
        "brand_id" uuid,
        "avg_amps" decimal(5,2),
        "max_amps" decimal(5,2),
        "hp" decimal(5,2),
        "serial" character varying,
        "warranty" character varying,
        "installed_date" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_pumps_asset_id" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pumps_brand_id" FOREIGN KEY ("brand_id") REFERENCES "pump_brands"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_pumps_asset_id" ON "pumps" ("asset_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_pumps_brand_id" ON "pumps" ("brand_id");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "photos" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "url" character varying NOT NULL,
        "inspection_id" uuid,
        "asset_id" uuid,
        "pump_id" uuid,
        "pump_brand_id" uuid,
        "client_id" uuid NOT NULL,
        "customer_id" uuid,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_photos_asset_id" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_photos_pump_id" FOREIGN KEY ("pump_id") REFERENCES "pumps"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_photos_pump_brand_id" FOREIGN KEY ("pump_brand_id") REFERENCES "pump_brands"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_photos_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_photos_customer_id" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_photos_asset_id" ON "photos" ("asset_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_photos_pump_id" ON "photos" ("pump_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_photos_pump_brand_id" ON "photos" ("pump_brand_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_photos_client_id" ON "photos" ("client_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_photos_customer_id" ON "photos" ("customer_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_photos_inspection_id" ON "photos" ("inspection_id");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "asset_pumps" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "asset_id" uuid,
        "pump_id" uuid,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_asset_pumps_asset_id" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_asset_pumps_pump_id" FOREIGN KEY ("pump_id") REFERENCES "pumps"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_asset_pumps_asset_id" ON "asset_pumps" ("asset_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_asset_pumps_pump_id" ON "asset_pumps" ("pump_id");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "action" character varying NOT NULL,
        "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "details" jsonb,
        "user_id" uuid,
        CONSTRAINT "FK_logs_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_ips" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ip_address" inet NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "user_id" uuid,
        CONSTRAINT "FK_user_ips_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_sessions" (
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
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_asset_pumps_pump_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_asset_pumps_asset_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "asset_pumps";`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_photos_asset_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_photos_pump_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_photos_pump_brand_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_photos_client_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_photos_customer_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "photos";`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_pumps_brand_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_pumps_asset_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pumps";`);

    await queryRunner.query(`DROP TABLE IF EXISTS "pump_brands";`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_assets_customer_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_assets_client_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_assets_type";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "assets";`);

    await queryRunner.query(`DROP TABLE IF EXISTS "asset_types";`);

    await queryRunner.query(`DROP TABLE IF EXISTS "user_sessions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_ips";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "logs";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customers";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clients";`);

    
  }
}
