import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAssetsModule20240722162333 implements MigrationInterface {
  name = 'CreateAssetsModule20240722162333';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "assets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "client_id" uuid,
        "customer_id" uuid,
        "name" character varying NOT NULL,
        "type" uuid,
        "location" character varying,
        "latitude" decimal(9,6),
        "longitude" decimal(9,6),
        "description" text,
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
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_assets_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_assets_customer_id" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_assets_type" FOREIGN KEY ("type") REFERENCES "asset_types"("id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_assets_client_id" ON "assets" ("client_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_assets_customer_id" ON "assets" ("customer_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_assets_type" ON "assets" ("type");
    `);

    await queryRunner.query(`
      CREATE TABLE "photos" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "url" character varying,
        "asset_id" uuid,
        "pump_id" uuid,
        "pump_brand_id" uuid,
        "client_id" uuid,
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
      CREATE INDEX "idx_photos_asset_id" ON "photos" ("asset_id");
      CREATE INDEX "idx_photos_pump_id" ON "photos" ("pump_id");
      CREATE INDEX "idx_photos_pump_brand_id" ON "photos" ("pump_brand_id");
      CREATE INDEX "idx_photos_client_id" ON "photos" ("client_id");
      CREATE INDEX "idx_photos_customer_id" ON "photos" ("customer_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "pump_brands" (
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
      CREATE TABLE "pumps" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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
      CREATE INDEX "idx_pumps_asset_id" ON "pumps" ("asset_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_pumps_brand_id" ON "pumps" ("brand_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "asset_types" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "asset_pumps" (
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
      CREATE INDEX "idx_asset_pumps_asset_id" ON "asset_pumps" ("asset_id");
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_asset_pumps_pump_id" ON "asset_pumps" ("pump_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_asset_pumps_pump_id";`);
    await queryRunner.query(`DROP INDEX "idx_asset_pumps_asset_id";`);
    await queryRunner.query(`DROP TABLE "asset_pumps";`);

    await queryRunner.query(`DROP TABLE "asset_types";`);

    await queryRunner.query(`DROP INDEX "idx_pumps_brand_id";`);
    await queryRunner.query(`DROP INDEX "idx_pumps_asset_id";`);
    await queryRunner.query(`DROP TABLE "pumps";`);

    await queryRunner.query(`DROP TABLE "pump_brands";`);

    await queryRunner.query(`DROP INDEX "idx_photos_asset_id";`);
    await queryRunner.query(`DROP TABLE "photos";`);

    await queryRunner.query(`DROP INDEX "idx_assets_customer_id";`);
    await queryRunner.query(`DROP INDEX "idx_assets_client_id";`);
    await queryRunner.query(`DROP TABLE "assets";`);
  }
}
