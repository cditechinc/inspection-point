import { MigrationInterface, QueryRunner } from 'typeorm';

export class InspectionModuleMigration20240804123456 implements MigrationInterface {
  name = 'InspectionModuleMigration20240804123456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inspections" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "client_id" uuid REFERENCES "clients"("id") ON DELETE CASCADE,
        "customer_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
        "asset_id" uuid REFERENCES "assets"("id") ON DELETE CASCADE,
        "assigned_to" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "status" varchar(50) CHECK (status IN ('pending', 'in_progress', 'completed', 'canceled')),
        "scheduled_date" TIMESTAMP,
        "completed_date" TIMESTAMP,
        "route" jsonb,
        "comments" text,
        "service_fee" decimal(10, 2),
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
        "name" varchar(255),
        "overall_score" varchar(10),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_checklists_inspection_id" ON "Checklists" ("inspection_id");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ChecklistItems" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "checklist_id" uuid REFERENCES "Checklists"("id") ON DELETE CASCADE,
        "description" text,
        "is_completed" boolean DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_checklist_items_checklist_id" ON "ChecklistItems" ("checklist_id");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "InspectionScores" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "inspection_id" uuid REFERENCES "Inspections"("id") ON DELETE CASCADE,
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
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inspection_scores_inspection_id" ON "InspectionScores" ("inspection_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_scores_inspection_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "InspectionScores";`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_checklist_items_checklist_id";`);
    await queryRunner.query(`DROP TABLE IF NOT EXISTS "ChecklistItems";`);

    await queryRunner.query(`DROP INDEX IF NOT EXISTS "idx_checklists_inspection_id";`);
    await queryRunner.query(`DROP TABLE IF NOT EXISTS "Checklists";`);

    await queryRunner.query(`DROP INDEX IF NOT EXISTS "idx_inspections_assigned_to";`);
    await queryRunner.query(`DROP INDEX IF NOT EXISTS "idx_inspections_asset_id";`);
    await queryRunner.query(`DROP INDEX IF NOT EXISTS "idx_inspections_customer_id";`);
    await queryRunner.query(`DROP INDEX IF NOT EXISTS "idx_inspections_client_id";`);
    await queryRunner.query(`DROP TABLE IF NOT EXISTS "Inspections";`);
  }
}
