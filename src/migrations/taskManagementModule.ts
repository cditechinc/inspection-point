import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskManagementModule20250101123456 implements MigrationInterface {
  name = 'TaskManagementModule20250101123456';

  public async up(queryRunner: QueryRunner): Promise<void> {


    // Create task_statuses table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task_statuses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(50) NOT NULL,
        "color" VARCHAR(7) DEFAULT '#FFFFFF',
        "is_past_due_protected" BOOLEAN DEFAULT FALSE,
        "is_default" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_task_statuses_name" UNIQUE ("name")
      );
    `);

     // Create task_types table
     await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task_types" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) NOT NULL,
        "client_id" uuid REFERENCES "clients"("id") ON DELETE CASCADE,
        "is_default" BOOLEAN DEFAULT FALSE,
        "paired_service_fee_id" uuid REFERENCES "services"("id") ON DELETE SET NULL,
        "paired_service_fee_quantity_required" BOOLEAN DEFAULT FALSE,
        "task_weight" INTEGER,
        "base_task_work_time" INTEGER,
        "categories" VARCHAR(50),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_task_types_name_client_id" UNIQUE ("name", "client_id")
      );
    `);

    // Create indexes on task_types
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_types_client_id" ON "task_types" ("client_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_types_paired_service_fee_id" ON "task_types" ("paired_service_fee_id");`);

    // Create tasks table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "task_id" VARCHAR(10) NOT NULL UNIQUE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
        "created_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "customer_id" uuid NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
        "task_status_id" uuid REFERENCES "task_statuses"("id") ON DELETE SET NULL,
        "task_type_id" uuid REFERENCES "task_types"("id") ON DELETE SET NULL,
        "task_priority" VARCHAR(20) CHECK (task_priority IN ('Emergency', 'High', 'Normal', 'Low')) NOT NULL DEFAULT 'Normal',
        "task_interval" VARCHAR(20) CHECK (task_interval IN ('One-Time', 'Daily', 'Bi-Monthly', 'Monthly', 'Quarterly', 'Annual')) NOT NULL DEFAULT 'One-Time',
        "task_set_id" VARCHAR(10),
        "reoccurring_end_date" TIMESTAMP,
        "due_date" TIMESTAMP NOT NULL,
        "quickbooks_invoice_number" VARCHAR(50),
        "archived" BOOLEAN DEFAULT FALSE,
        "weather" TEXT
      );
    `);

    // Create indexes on tasks table
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_tasks_client_id" ON "tasks" ("client_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_tasks_customer_id" ON "tasks" ("customer_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_tasks_created_by_user_id" ON "tasks" ("created_by_user_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_tasks_task_status_id" ON "tasks" ("task_status_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_tasks_task_type_id" ON "tasks" ("task_type_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_tasks_task_set_id" ON "tasks" ("task_set_id");`);

    

    // Create task_status_history table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task_status_history" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
        "task_status_id" uuid NOT NULL REFERENCES "task_statuses"("id") ON DELETE SET NULL,
        "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
        "created_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "location" point,
        "delayed_reason" TEXT
      );
    `);

    // Create indexes on task_status_history
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_status_history_client_id" ON "task_status_history" ("client_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_status_history_task_status_id" ON "task_status_history" ("task_status_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_status_history_task_id" ON "task_status_history" ("task_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_status_history_created_by_user_id" ON "task_status_history" ("created_by_user_id");`);

   

    // Create task_assets table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task_assets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
        "asset_id" uuid NOT NULL REFERENCES "assets"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_task_assets_task_id_asset_id" UNIQUE ("task_id", "asset_id")
      );
    `);

    // Create indexes on task_assets
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_assets_task_id" ON "task_assets" ("task_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_assets_asset_id" ON "task_assets" ("asset_id");`);

    // Create task_user_assignments table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task_user_assignments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_task_user_assignments_task_id_user_id" UNIQUE ("task_id", "user_id")
      );
    `);

    // Create indexes on task_user_assignments
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_user_assignments_task_id" ON "task_user_assignments" ("task_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_user_assignments_user_id" ON "task_user_assignments" ("user_id");`);

    // Create task_files table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "task_files" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
        "file_url" VARCHAR(255) NOT NULL,
        "file_type" VARCHAR(20) CHECK (file_type IN ('image', 'video', 'document')) NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes on task_files
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_files_task_id" ON "task_files" ("task_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_task_files_file_type" ON "task_files" ("file_type");`);

    // Create client_task_settings table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "client_task_settings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "client_id" uuid UNIQUE NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
        "auto_assign_users_to_task" BOOLEAN DEFAULT FALSE,
        "max_in_progress_tasks_per_user" INTEGER DEFAULT 0,
        "allow_users_to_complete_bill_task" BOOLEAN DEFAULT FALSE,
        "assign_user_to_task_using_schedules" BOOLEAN DEFAULT FALSE,
        "enable_task_weights" BOOLEAN DEFAULT FALSE,
        "capture_task_status_gps_location" BOOLEAN DEFAULT FALSE,
        "automatic_task_arrival_status" BOOLEAN DEFAULT FALSE,
        "automatic_task_invoice_creation" BOOLEAN DEFAULT FALSE,
        "task_invoice_theme" VARCHAR(50),
        "task_weather" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // // Update permissions table
    // await queryRunner.query(`
    //   ALTER TABLE "permissions"
    //   ADD COLUMN IF NOT EXISTS "can_create_task" BOOLEAN DEFAULT FALSE,
    //   ADD COLUMN IF NOT EXISTS "can_edit_task" BOOLEAN DEFAULT FALSE,
    //   ADD COLUMN IF NOT EXISTS "can_view_task" BOOLEAN DEFAULT FALSE,
    //   ADD COLUMN IF NOT EXISTS "can_delete_task" BOOLEAN DEFAULT FALSE,
    //   ADD COLUMN IF NOT EXISTS "can_access_task_settings" BOOLEAN DEFAULT FALSE;
    // `);

    // Update invoices table
    await queryRunner.query(`
      ALTER TABLE "invoices"
      ADD COLUMN IF NOT EXISTS "task_id" uuid REFERENCES "tasks"("id") ON DELETE SET NULL;
    `);

    // Create index on invoices.task_id
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_invoices_task_id" ON "invoices" ("task_id");`);

    // **Optional:** Insert default task statuses and task types here if required.

  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the changes made in up()

    // Drop index on invoices.task_id
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_task_id";`);

    // Remove task_id from invoices table
    await queryRunner.query(`
      ALTER TABLE "invoices"
      DROP COLUMN IF EXISTS "task_id";
    `);

    // Revert changes to permissions table
    // await queryRunner.query(`
    //   ALTER TABLE "permissions"
    //   DROP COLUMN IF EXISTS "can_create_task",
    //   DROP COLUMN IF EXISTS "can_edit_task",
    //   DROP COLUMN IF EXISTS "can_view_task",
    //   DROP COLUMN IF EXISTS "can_delete_task",
    //   DROP COLUMN IF EXISTS "can_access_task_settings";
    // `);

    // Drop client_task_settings table
    await queryRunner.query(`DROP TABLE IF EXISTS "client_task_settings";`);

    // Drop indexes and task_files table
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_task_files_file_type";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_task_files_task_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_files";`);

    // Drop indexes and task_user_assignments table
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_task_user_assignments_user_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_task_user_assignments_task_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_user_assignments";`);

    // Drop indexes and task_assets table
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_task_assets_asset_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_task_assets_task_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_assets";`);

    // Drop indexes and task_types table
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_task_types_paired_service_fee_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_task_types_client_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_types";`);

    // Drop indexes and task_status_history table
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_task_status_history_created_by_user_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_task_status_history_task_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_task_status_history_task_status_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_task_status_history_client_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "task_status_history";`);

    // Drop task_statuses table
    await queryRunner.query(`DROP TABLE IF EXISTS "task_statuses";`);

    // Drop indexes and tasks table
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tasks_task_set_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tasks_task_type_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tasks_task_status_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tasks_created_by_user_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tasks_customer_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_tasks_client_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks";`);
  }
}
