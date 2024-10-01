import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSecurityGroupsAndPermissions20240905123456 implements MigrationInterface {
  name = 'AddSecurityGroupsAndPermissions20240905123456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // User Groups Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_groups" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(255) NOT NULL,
        "color" VARCHAR(7) DEFAULT '#FFFFFF';
        "client_id" uuid REFERENCES "clients"("id") ON DELETE CASCADE,
        "description" TEXT,
        "is_default_admin_group" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "uq_user_groups_name_client_id" UNIQUE (name, client_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_groups_client_id" ON "user_groups" ("client_id");
    `);

    // User Group Permissions Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_group_permissions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_group_id" uuid REFERENCES "user_groups"("id") ON DELETE CASCADE,
        "permission_name" VARCHAR(255),
        "can_view" BOOLEAN DEFAULT FALSE,
        "can_edit" BOOLEAN DEFAULT FALSE,
        "can_create" BOOLEAN DEFAULT FALSE,
        "can_delete" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_group_permissions_user_group_id" ON "user_group_permissions" ("user_group_id");
    `);

    // User Group Memberships Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_group_memberships" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
        "user_group_id" uuid REFERENCES "user_groups"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_group_memberships_user_id" ON "user_group_memberships" ("user_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_group_memberships_user_group_id" ON "user_group_memberships" ("user_group_id");
    `);

    // Permissions Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "permissions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
        "can_create_user" BOOLEAN DEFAULT FALSE,
        "can_edit_user" BOOLEAN DEFAULT FALSE,
        "can_delete_user" BOOLEAN DEFAULT FALSE,
        "can_create_asset" BOOLEAN DEFAULT FALSE,
        "can_edit_asset" BOOLEAN DEFAULT FALSE,
        "can_delete_asset" BOOLEAN DEFAULT FALSE,
        "can_create_inspection" BOOLEAN DEFAULT FALSE,
        "can_edit_inspection" BOOLEAN DEFAULT FALSE,
        "can_delete_inspection" BOOLEAN DEFAULT FALSE,
        "can_create_customer" BOOLEAN DEFAULT FALSE,
        "can_edit_customer" BOOLEAN DEFAULT FALSE,
        "can_delete_customer" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_permissions_user_id" ON "permissions" ("user_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_permissions_user_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions";`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_group_memberships_user_group_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_group_memberships_user_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_group_memberships";`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_group_permissions_user_group_id";`);
    await queryRunner.query(`DROP TABLE IF NOT EXISTS "user_group_permissions";`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_user_groups_client_id";`);
    await queryRunner.query(`DROP TABLE IF NOT EXISTS "user_groups";`);
  }
}
