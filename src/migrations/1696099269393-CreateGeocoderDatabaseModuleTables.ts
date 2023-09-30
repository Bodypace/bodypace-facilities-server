import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGeocoderDatabaseModuleTables1696099269393
  implements MigrationInterface
{
  name = 'CreateGeocoderDatabaseModuleTables1696099269393';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "stored_geocoded_address" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "queried_address" varchar NOT NULL, "located_address" varchar NOT NULL, "latitude" integer NOT NULL, "longitude" integer NOT NULL, "createdAt" varchar NOT NULL DEFAULT ('datetime()'))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "stored_geocoded_address"`);
  }
}
