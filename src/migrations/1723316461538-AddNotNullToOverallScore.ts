import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotNullToOverallScore1723316461538 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "checklists"
            ALTER COLUMN "overall_score" SET NOT NULL;
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "checklists"
            ALTER COLUMN "overall_score" DROP NOT NULL;
          `);
    }

}
