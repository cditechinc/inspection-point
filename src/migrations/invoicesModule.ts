import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoicesTableWithQuickBooksFields20240901123456 implements MigrationInterface {
  name = 'AddInvoicesTableWithQuickBooksFields20240901123456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "quickbooks_invoice_id" varchar(255) NOT NULL,
        "client_id" uuid REFERENCES "clients"("id") ON DELETE CASCADE,
        "customer_id" uuid REFERENCES "customers"("id") ON DELETE CASCADE,
        "inspection_id" uuid REFERENCES "inspections"("id") ON DELETE CASCADE,
        "status" varchar(50) CHECK (status IN ('pending', 'paid', 'canceled')) DEFAULT 'pending',
        "amount_due" decimal(10, 2) NOT NULL,
        "amount_paid" decimal(10, 2),
        "balance" decimal(10, 2),
        "due_date" TIMESTAMP,
        "paid_date" TIMESTAMP,
        "quickbooks_invoice_number" varchar(50),
        "quickbooks_invoice_url" varchar(255),
        "quickbooks_sync_status" varchar(50) CHECK (quickbooks_sync_status IN ('synced', 'failed')) DEFAULT 'synced',
        "items" jsonb DEFAULT '[]',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_inspection_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_customer_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_client_id";`);
    await queryRunner.query(`DROP TABLE IF NOT EXISTS "invoices";`);
  }
}
