import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNameToInspections20240820143000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "inspections"
            ADD COLUMN "name" varchar(255) NOT NULL DEFAULT 'Unnamed Inspection';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "inspections"
            DROP COLUMN "name";
        `);
    }
}
