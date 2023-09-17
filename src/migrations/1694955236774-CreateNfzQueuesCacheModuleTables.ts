import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNfzQueuesCacheModuleTables1694955236774
  implements MigrationInterface
{
  name = 'CreateNfzQueuesCacheModuleTables1694955236774';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cached_nfz_queues_query" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "case" integer NOT NULL, "benefitForChildren" varchar NOT NULL, "benefit" varchar, "province" integer, "locality" varchar, "createdAt" varchar NOT NULL DEFAULT ('datetime()'))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cached_nfz_queue_statistics_provider_data" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "awaiting" integer NOT NULL, "removed" integer NOT NULL, "averagePeriod" integer NOT NULL, "update" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "cached_nfz_queue_statistics" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "computedData" varchar, "providerDataId" integer, CONSTRAINT "REL_d97938d703b7ebdc722254e90e" UNIQUE ("providerDataId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cached_nfz_queue_benefits_provided" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "typeOfBenefit" integer NOT NULL, "year" integer NOT NULL, "amount" integer NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "cached_nfz_queue_dates" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "applicable" boolean NOT NULL, "date" varchar NOT NULL, "dateSituationAsAt" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "cached_nfz_queue" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "queueId" varchar NOT NULL, "case" integer NOT NULL, "benefit" varchar NOT NULL, "manyPlaces" varchar NOT NULL, "provider" varchar NOT NULL, "providerCode" varchar NOT NULL, "regonProvider" varchar NOT NULL, "nipProvider" varchar NOT NULL, "terytProvider" varchar NOT NULL, "place" varchar NOT NULL, "address" varchar NOT NULL, "locality" varchar NOT NULL, "phone" varchar NOT NULL, "terytPlace" varchar NOT NULL, "registryNumber" varchar NOT NULL, "idResortPartVII" varchar NOT NULL, "idResortPartVIII" varchar NOT NULL, "benefitsForChildren" varchar, "covid19" varchar NOT NULL, "toilet" varchar NOT NULL, "ramp" varchar NOT NULL, "carPark" varchar NOT NULL, "elevator" varchar NOT NULL, "longitude" varchar, "latitude" varchar, "createdAt" varchar NOT NULL DEFAULT ('datetime()'), "statisticsId" integer, "datesId" integer, "benefitsProvidedId" integer, "cachedQueryId" integer NOT NULL, CONSTRAINT "REL_884de471a47df3f34199f9f148" UNIQUE ("statisticsId"), CONSTRAINT "REL_4d51c64921ba21379fe20e50b2" UNIQUE ("datesId"), CONSTRAINT "REL_d90605ddfdc178382c3b49426f" UNIQUE ("benefitsProvidedId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_cached_nfz_queue_statistics" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "computedData" varchar, "providerDataId" integer, CONSTRAINT "REL_d97938d703b7ebdc722254e90e" UNIQUE ("providerDataId"), CONSTRAINT "FK_d97938d703b7ebdc722254e90ea" FOREIGN KEY ("providerDataId") REFERENCES "cached_nfz_queue_statistics_provider_data" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_cached_nfz_queue_statistics"("id", "computedData", "providerDataId") SELECT "id", "computedData", "providerDataId" FROM "cached_nfz_queue_statistics"`,
    );
    await queryRunner.query(`DROP TABLE "cached_nfz_queue_statistics"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_cached_nfz_queue_statistics" RENAME TO "cached_nfz_queue_statistics"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_cached_nfz_queue" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "queueId" varchar NOT NULL, "case" integer NOT NULL, "benefit" varchar NOT NULL, "manyPlaces" varchar NOT NULL, "provider" varchar NOT NULL, "providerCode" varchar NOT NULL, "regonProvider" varchar NOT NULL, "nipProvider" varchar NOT NULL, "terytProvider" varchar NOT NULL, "place" varchar NOT NULL, "address" varchar NOT NULL, "locality" varchar NOT NULL, "phone" varchar NOT NULL, "terytPlace" varchar NOT NULL, "registryNumber" varchar NOT NULL, "idResortPartVII" varchar NOT NULL, "idResortPartVIII" varchar NOT NULL, "benefitsForChildren" varchar, "covid19" varchar NOT NULL, "toilet" varchar NOT NULL, "ramp" varchar NOT NULL, "carPark" varchar NOT NULL, "elevator" varchar NOT NULL, "longitude" varchar, "latitude" varchar, "createdAt" varchar NOT NULL DEFAULT ('datetime()'), "statisticsId" integer, "datesId" integer, "benefitsProvidedId" integer, "cachedQueryId" integer NOT NULL, CONSTRAINT "REL_884de471a47df3f34199f9f148" UNIQUE ("statisticsId"), CONSTRAINT "REL_4d51c64921ba21379fe20e50b2" UNIQUE ("datesId"), CONSTRAINT "REL_d90605ddfdc178382c3b49426f" UNIQUE ("benefitsProvidedId"), CONSTRAINT "FK_884de471a47df3f34199f9f148c" FOREIGN KEY ("statisticsId") REFERENCES "cached_nfz_queue_statistics" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_4d51c64921ba21379fe20e50b2e" FOREIGN KEY ("datesId") REFERENCES "cached_nfz_queue_dates" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_d90605ddfdc178382c3b49426fd" FOREIGN KEY ("benefitsProvidedId") REFERENCES "cached_nfz_queue_benefits_provided" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_1c91bdbf25bf127942ab11b78a8" FOREIGN KEY ("cachedQueryId") REFERENCES "cached_nfz_queues_query" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_cached_nfz_queue"("id", "type", "queueId", "case", "benefit", "manyPlaces", "provider", "providerCode", "regonProvider", "nipProvider", "terytProvider", "place", "address", "locality", "phone", "terytPlace", "registryNumber", "idResortPartVII", "idResortPartVIII", "benefitsForChildren", "covid19", "toilet", "ramp", "carPark", "elevator", "longitude", "latitude", "createdAt", "statisticsId", "datesId", "benefitsProvidedId", "cachedQueryId") SELECT "id", "type", "queueId", "case", "benefit", "manyPlaces", "provider", "providerCode", "regonProvider", "nipProvider", "terytProvider", "place", "address", "locality", "phone", "terytPlace", "registryNumber", "idResortPartVII", "idResortPartVIII", "benefitsForChildren", "covid19", "toilet", "ramp", "carPark", "elevator", "longitude", "latitude", "createdAt", "statisticsId", "datesId", "benefitsProvidedId", "cachedQueryId" FROM "cached_nfz_queue"`,
    );
    await queryRunner.query(`DROP TABLE "cached_nfz_queue"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_cached_nfz_queue" RENAME TO "cached_nfz_queue"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cached_nfz_queue" RENAME TO "temporary_cached_nfz_queue"`,
    );
    await queryRunner.query(
      `CREATE TABLE "cached_nfz_queue" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "queueId" varchar NOT NULL, "case" integer NOT NULL, "benefit" varchar NOT NULL, "manyPlaces" varchar NOT NULL, "provider" varchar NOT NULL, "providerCode" varchar NOT NULL, "regonProvider" varchar NOT NULL, "nipProvider" varchar NOT NULL, "terytProvider" varchar NOT NULL, "place" varchar NOT NULL, "address" varchar NOT NULL, "locality" varchar NOT NULL, "phone" varchar NOT NULL, "terytPlace" varchar NOT NULL, "registryNumber" varchar NOT NULL, "idResortPartVII" varchar NOT NULL, "idResortPartVIII" varchar NOT NULL, "benefitsForChildren" varchar, "covid19" varchar NOT NULL, "toilet" varchar NOT NULL, "ramp" varchar NOT NULL, "carPark" varchar NOT NULL, "elevator" varchar NOT NULL, "longitude" varchar, "latitude" varchar, "createdAt" varchar NOT NULL DEFAULT ('datetime()'), "statisticsId" integer, "datesId" integer, "benefitsProvidedId" integer, "cachedQueryId" integer NOT NULL, CONSTRAINT "REL_884de471a47df3f34199f9f148" UNIQUE ("statisticsId"), CONSTRAINT "REL_4d51c64921ba21379fe20e50b2" UNIQUE ("datesId"), CONSTRAINT "REL_d90605ddfdc178382c3b49426f" UNIQUE ("benefitsProvidedId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "cached_nfz_queue"("id", "type", "queueId", "case", "benefit", "manyPlaces", "provider", "providerCode", "regonProvider", "nipProvider", "terytProvider", "place", "address", "locality", "phone", "terytPlace", "registryNumber", "idResortPartVII", "idResortPartVIII", "benefitsForChildren", "covid19", "toilet", "ramp", "carPark", "elevator", "longitude", "latitude", "createdAt", "statisticsId", "datesId", "benefitsProvidedId", "cachedQueryId") SELECT "id", "type", "queueId", "case", "benefit", "manyPlaces", "provider", "providerCode", "regonProvider", "nipProvider", "terytProvider", "place", "address", "locality", "phone", "terytPlace", "registryNumber", "idResortPartVII", "idResortPartVIII", "benefitsForChildren", "covid19", "toilet", "ramp", "carPark", "elevator", "longitude", "latitude", "createdAt", "statisticsId", "datesId", "benefitsProvidedId", "cachedQueryId" FROM "temporary_cached_nfz_queue"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_cached_nfz_queue"`);
    await queryRunner.query(
      `ALTER TABLE "cached_nfz_queue_statistics" RENAME TO "temporary_cached_nfz_queue_statistics"`,
    );
    await queryRunner.query(
      `CREATE TABLE "cached_nfz_queue_statistics" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "computedData" varchar, "providerDataId" integer, CONSTRAINT "REL_d97938d703b7ebdc722254e90e" UNIQUE ("providerDataId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "cached_nfz_queue_statistics"("id", "computedData", "providerDataId") SELECT "id", "computedData", "providerDataId" FROM "temporary_cached_nfz_queue_statistics"`,
    );
    await queryRunner.query(
      `DROP TABLE "temporary_cached_nfz_queue_statistics"`,
    );
    await queryRunner.query(`DROP TABLE "cached_nfz_queue"`);
    await queryRunner.query(`DROP TABLE "cached_nfz_queue_dates"`);
    await queryRunner.query(`DROP TABLE "cached_nfz_queue_benefits_provided"`);
    await queryRunner.query(`DROP TABLE "cached_nfz_queue_statistics"`);
    await queryRunner.query(
      `DROP TABLE "cached_nfz_queue_statistics_provider_data"`,
    );
    await queryRunner.query(`DROP TABLE "cached_nfz_queues_query"`);
  }
}
