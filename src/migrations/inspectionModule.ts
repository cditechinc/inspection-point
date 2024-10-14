// import { MigrationInterface, QueryRunner } from 'typeorm';

// export class InspectionModuleMigration20240804123456
//   implements MigrationInterface
// {
//   name = 'InspectionModuleMigration20240804123456';

//   public async up(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

//     await queryRunner.query(`
//       DO $$
//       BEGIN
//         IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inspection_status_enum') THEN
//           CREATE TYPE inspection_status_enum AS ENUM (
//             'Not-Done',
//             'Started Not Finished',
//             'Past-Due',
//             'Complete Billed',
//             'Complete Not-Billed',
//             'On-Hold',
//             'Canceled'
//           );
//         END IF;
//       END $$;
//     `);

//     await queryRunner.query(`
//       CREATE TABLE IF NOT EXISTS "inspections" (
//         "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
//         "client_id" uuid REFERENCES "clients"("id") ON DELETE CASCADE,
//         "customer_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
//         "asset_id" uuid REFERENCES "assets"("id") ON DELETE CASCADE,
//         "assigned_to" uuid REFERENCES "users"("id") ON DELETE SET NULL,
//         "status" inspection_status_enum NOT NULL DEFAULT 'Not-Done',
//         "scheduled_date" TIMESTAMP,
//         "completed_date" TIMESTAMP,
//         "route" jsonb,
//         "is_reocurring" boolean DEFAULT FALSE, 
//         "inspection_interval" TIMESTAMP, 
//         "reocurrence_end_date" TIMESTAMP, 
//         "pdf_file_path" varchar(255),
//         "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//     await queryRunner.query(`
//       CREATE INDEX IF NOT EXISTS "idx_inspections_client_id" ON "inspections" ("client_id");
//     `);

//     await queryRunner.query(`
//       CREATE INDEX IF NOT EXISTS "idx_inspections_customer_id" ON "inspections" ("customer_id");
//     `);

//     await queryRunner.query(`
//       CREATE INDEX IF NOT EXISTS "idx_inspections_asset_id" ON "inspections" ("asset_id");
//     `);

//     await queryRunner.query(`
//       CREATE INDEX IF NOT EXISTS "idx_inspections_assigned_to" ON "inspections" ("assigned_to");
//     `);

//     await queryRunner.query(`
//       CREATE TABLE IF NOT EXISTS "checklists" (
//         "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
//         "inspection_id" uuid REFERENCES "inspections"("id") ON DELETE CASCADE,
//         "structure_score" varchar(10),
//         "panel_score" varchar(10),
//         "pipes_score" varchar(10),
//         "alarm_score" varchar(10),
//         "alarm_light_score" varchar(10),
//         "wires_score" varchar(10),
//         "breakers_score" varchar(10),
//         "contactors_score" varchar(10),
//         "thermals_score" varchar(10),
//         "float_scores" jsonb,
//         "pump_scores" jsonb,
//         "overall_score" varchar(10),
//         "cleaning" boolean DEFAULT FALSE,
//         "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `);

//     await queryRunner.query(`
//       CREATE INDEX IF NOT EXISTS "idx_checklists_inspection_id" ON "checklists" ("inspection_id");
//     `);
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(
//       `DROP INDEX IF EXISTS "idx_checklists_inspection_id";`,
//     );
//     await queryRunner.query(`DROP TABLE IF EXISTS "checklists";`);

//     await queryRunner.query(
//       `DROP INDEX IF EXISTS "idx_inspections_assigned_to";`,
//     );
//     await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspections_asset_id";`);
//     await queryRunner.query(
//       `DROP INDEX IF EXISTS "idx_inspections_customer_id";`,
//     );
//     await queryRunner.query(
//       `DROP INDEX IF EXISTS "idx_inspections_client_id";`,
//     );
//     await queryRunner.query(`DROP TABLE IF EXISTS "inspections";`);
//     await queryRunner.query(`DROP TYPE IF EXISTS "inspection_status_enum";`);
//   }
// }

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InspectionModuleMigration20240804123456
  implements MigrationInterface
{
  name = 'InspectionModuleMigration20240804123456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create UUID extension if not exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create inspection_status_enum type if not exists
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

    // Create inspections table (unchanged)
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
        "inspection_interval" TIMESTAMP, 
        "reocurrence_end_date" TIMESTAMP, 
        "pdf_file_path" varchar(255),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes on inspections table
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

    // Remove the old checklists table creation (since it's being replaced)

    // Create question_type_enum type if not exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type_enum') THEN
          CREATE TYPE question_type_enum AS ENUM ('text', 'number', 'boolean', 'multiple_choice');
        END IF;
      END $$;
    `);

    // 1. Create checklist_templates table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "checklist_templates" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create checklist_questions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "checklist_questions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "template_id" uuid REFERENCES "checklist_templates"("id") ON DELETE CASCADE,
        "question_text" TEXT NOT NULL,
        "question_type" question_type_enum NOT NULL,
        "options" JSONB,
        "is_required" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on checklist_questions.template_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_checklist_questions_template_id" ON "checklist_questions" ("template_id");
    `);

    // 3. Create inspection_checklists table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inspection_checklists" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "inspection_id" uuid REFERENCES "inspections"("id") ON DELETE CASCADE,
        "template_id" uuid REFERENCES "checklist_templates"("id"),
        "completed_at" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes on inspection_checklists
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inspection_checklists_inspection_id" ON "inspection_checklists" ("inspection_id");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inspection_checklists_template_id" ON "inspection_checklists" ("template_id");
    `);

    // 4. Create inspection_checklist_answers table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inspection_checklist_answers" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "inspection_checklist_id" uuid REFERENCES "inspection_checklists"("id") ON DELETE CASCADE,
        "question_id" uuid REFERENCES "checklist_questions"("id"),
        "answer" TEXT,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes on inspection_checklist_answers
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inspection_checklist_answers_checklist_id" ON "inspection_checklist_answers" ("inspection_checklist_id");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inspection_checklist_answers_question_id" ON "inspection_checklist_answers" ("question_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes and tables in reverse order to avoid dependency issues

    // Drop inspection_checklist_answers indexes and table
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_checklist_answers_question_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_checklist_answers_checklist_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inspection_checklist_answers";`);

    // Drop inspection_checklists indexes and table
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_checklists_template_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspection_checklists_inspection_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inspection_checklists";`);

    // Drop checklist_questions index and table
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_checklist_questions_template_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "checklist_questions";`);

    // Drop question_type_enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "question_type_enum";`);

    // Drop checklist_templates table
    await queryRunner.query(`DROP TABLE IF EXISTS "checklist_templates";`);

    // The old checklists table drop statements have been removed since we didn't create it

    // Drop indexes and table for inspections (unchanged)
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspections_assigned_to";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspections_asset_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspections_customer_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inspections_client_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inspections";`);

    // Drop inspection_status_enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "inspection_status_enum";`);
  }
}
