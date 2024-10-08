import { MigrationInterface, QueryRunner } from 'typeorm';

export class InspectionModuleMigration20240804123456
  implements MigrationInterface
{
  name = 'InspectionModuleMigration20240804123456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inspection_status_enum') THEN
          CREATE TYPE inspection_status_enum AS ENUM (
            'Not-Done',
            'Started Not Finished',
            'Past-Due',
            'Complete Billed',
            'Complete Not-Billed',
            'On-Hold',
            'Canceled'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inspections" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "client_id" uuid REFERENCES "clients"("id") ON DELETE CASCADE,
        "customer_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
        "asset_id" uuid REFERENCES "assets"("id") ON DELETE CASCADE,
        "assigned_to" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "status" inspection_status_enum NOT NULL DEFAULT 'Not-Done',
        "scheduled_date" TIMESTAMP,
        "completed_date" TIMESTAMP,
        "route" jsonb,
        "is_reocurring" boolean DEFAULT FALSE, 
        "inspection_interval" integer, 
        "reocurrence_end_date" TIMESTAMP, 
        "pdf_file_path" varchar(255),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inspections_client_id" ON "inspections" ("client_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inspections_customer_id" ON "inspections" ("customer_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inspections_asset_id" ON "inspections" ("asset_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inspections_assigned_to" ON "inspections" ("assigned_to");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "checklists" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "inspection_id" uuid REFERENCES "inspections"("id") ON DELETE CASCADE,
        "structure_score" varchar(10),
        "panel_score" varchar(10),
        "pipes_score" varchar(10),
        "alarm_score" varchar(10),
        "alarm_light_score" varchar(10),
        "wires_score" varchar(10),
        "breakers_score" varchar(10),
        "contactors_score" varchar(10),
        "thermals_score" varchar(10),
        "float_scores" jsonb,
        "pump_scores" jsonb,
        "overall_score" varchar(10),
        "cleaning" boolean DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_checklists_inspection_id" ON "checklists" ("inspection_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_checklists_inspection_id";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "checklists";`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_inspections_assigned_to";`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspections_asset_id";`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_inspections_customer_id";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_inspections_client_id";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "inspections";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "inspection_status_enum";`);
  }
}
