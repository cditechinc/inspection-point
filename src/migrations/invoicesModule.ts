import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoicesTableWithQuickBooksFields20240901123456 implements MigrationInterface {
  name = 'AddInvoicesTableWithQuickBooksFields20240901123456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the service_fees table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "services" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "quickbooks_service_id" VARCHAR(255) UNIQUE NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "price" DECIMAL(10, 2) NOT NULL,
        "is_taxable" BOOLEAN DEFAULT FALSE,
        "billing_io" VARCHAR(255),
        "client_id" uuid REFERENCES "clients"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE ("name", "client_id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_services_client_id" ON "services" ("client_id");
    `);

    // Create the invoices table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "quickbooks_invoice_id" VARCHAR(255) NOT NULL,
        "client_id" uuid REFERENCES "clients"("id") ON DELETE CASCADE,
        "customer_id" uuid REFERENCES "customers"("id") ON DELETE CASCADE,
        "inspection_id" uuid REFERENCES "inspections"("id") ON DELETE CASCADE,
        "status" VARCHAR(50) CHECK (status IN ('pending', 'paid', 'canceled')) DEFAULT 'pending',
        "amount_due" DECIMAL(10, 2) NOT NULL,
        "amount_paid" DECIMAL(10, 2),
        "balance" DECIMAL(10, 2),
        "due_date" TIMESTAMP,
        "paid_date" TIMESTAMP,
        "quickbooks_invoice_number" VARCHAR(50),
        "quickbooks_invoice_url" VARCHAR(255),
        "quickbooks_sync_status" VARCHAR(50) CHECK (quickbooks_sync_status IN ('synced', 'failed')) DEFAULT 'synced',
        "items" JSONB DEFAULT '[]',
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_invoices_client_id" ON "invoices" ("client_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_invoices_customer_id" ON "invoices" ("customer_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_invoices_inspection_id" ON "invoices" ("inspection_id");
    `);

    // Create the invoice_items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoice_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "invoice_id" uuid REFERENCES "invoices"("id") ON DELETE CASCADE,
        "service_fee_id" uuid REFERENCES "service_fees"("id") ON DELETE CASCADE,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "unit_price" DECIMAL(10, 2) NOT NULL,
        "total_price" DECIMAL(10, 2) NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_invoice_items_invoice_id" ON "invoice_items" ("invoice_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_invoice_items_services_id" ON "invoice_items" ("services_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes and tables in reverse order to prevent foreign key constraint issues

    // Drop invoice_items table
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoice_items_services_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoice_items_invoice_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_items";`);

    // Drop invoices table
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_inspection_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_customer_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_client_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoices";`);

    // Drop service_fees table
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_services_client_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "services";`);
  }
}
