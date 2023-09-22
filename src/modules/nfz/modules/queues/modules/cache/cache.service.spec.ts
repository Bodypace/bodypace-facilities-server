import { LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { unlink } from 'node:fs/promises';
import { DataSource } from 'typeorm';
import { req_1_page_1 } from '../../../../../../../test/mocks/httpService/responses/req_1/response-page-1';
import { req_2_page_1 } from '../../../../../../../test/mocks/httpService/responses/req_2/response-page-1';
import { req_2_page_2 } from '../../../../../../../test/mocks/httpService/responses/req_2/response-page-2';
import { req_2_page_3 } from '../../../../../../../test/mocks/httpService/responses/req_2/response-page-3';
import { req_2_page_4 } from '../../../../../../../test/mocks/httpService/responses/req_2/response-page-4';
import { req_2_page_5 } from '../../../../../../../test/mocks/httpService/responses/req_2/response-page-5';
import { req_2_page_6 } from '../../../../../../../test/mocks/httpService/responses/req_2/response-page-6';
import { req_3_page_1 } from '../../../../../../../test/mocks/httpService/responses/req_3/response-page-1';
import { req_3_page_2 } from '../../../../../../../test/mocks/httpService/responses/req_3/response-page-2';
import { req_3_page_3 } from '../../../../../../../test/mocks/httpService/responses/req_3/response-page-3';
import { NfzQueuesApiQuery } from '../api-client/interfaces/query.interface';
import { NfzQueuesApiQueue } from '../api-client/interfaces/queue.interface';
import { NfzQueuesCacheService } from './cache.service';
import {
  CachedNfzQueue,
  CachedNfzQueueBenefitsProvided,
  CachedNfzQueueDates,
  CachedNfzQueueStatistics,
  CachedNfzQueueStatisticsProviderData,
} from './entities/cached-queue.entity';
import { CachedNfzQueuesQuery } from './entities/cached-queues-query.entity';
import { fromCachedNfzQueue } from './utils/from-cached-nfz-queue.util';
import {
  nfzQuesesCacheServiceGeneratedTestsSetEmpty,
  NfzQueuesCacheServiceTestsGenerator,
} from './__tests__/tests-generator.util';

function MockedLogger() {
  return {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

interface Fixtures {
  endokrynoKatowice: {
    sourceQuery: NfzQueuesApiQuery;
    sourceQueues: NfzQueuesApiQueue[];
  };
  endoPoland: {
    sourceQuery: NfzQueuesApiQuery;
    sourceQueues: NfzQueuesApiQueue[];
  };
  query?: NfzQueuesApiQuery;
  queues?: NfzQueuesApiQueue[];
  includedFieldFilter?: (queue: NfzQueuesApiQueue) => boolean;
}

describe('NfzQueuesCacheService', () => {
  const databaseName = 'test-nfz-queues-cache-service-database.sqlite';
  let nfzQueuesCacheService: NfzQueuesCacheService;
  let logger: LoggerService;
  let dataSource: DataSource;

  const skipGenerated = process.env.SKIP_GENERATED_TESTS;
  const generated = skipGenerated
    ? nfzQuesesCacheServiceGeneratedTestsSetEmpty
    : NfzQueuesCacheServiceTestsGenerator.generate();

  const describeGenerated = skipGenerated ? describe.skip : describe;
  const itGenerated = skipGenerated ? it.skip : it;
  if (skipGenerated) {
    console.warn(
      'skipping generated tests (use is for faster local development but run them before push)',
    );
  }

  const fixtures: Fixtures = {
    endokrynoKatowice: {
      sourceQuery: {
        case: 1,
        benefitForChildren: 'false',
        benefit: 'endokryno',
        province: 12,
        locality: 'KATOWICE',
      },
      sourceQueues: [...req_1_page_1.data],
    },
    endoPoland: {
      sourceQuery: {
        case: 1,
        benefitForChildren: 'false',
        benefit: 'endo',
      },
      sourceQueues: [
        ...req_2_page_1.data,
        ...req_2_page_2.data,
        ...req_2_page_3.data,
        ...req_2_page_4.data,
        ...req_2_page_5.data,
        ...req_2_page_6.data,
        ...req_3_page_1.data,
        ...req_3_page_2.data,
        ...req_3_page_3.data,
      ],
    },
  };

  beforeEach(async () => {
    logger = MockedLogger();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: databaseName,
          synchronize: true,
          dropSchema: true,
          entities: [
            CachedNfzQueueStatisticsProviderData,
            CachedNfzQueueStatistics,
            CachedNfzQueueDates,
            CachedNfzQueueBenefitsProvided,
            CachedNfzQueue,
            CachedNfzQueuesQuery,
          ],
        }),
      ],
      providers: [NfzQueuesCacheService],
    })
      .setLogger(logger)
      .compile();

    nfzQueuesCacheService = module.get<NfzQueuesCacheService>(
      NfzQueuesCacheService,
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    await unlink(databaseName);
  });

  it('service should be defined', () => {
    expect(nfzQueuesCacheService).toBeDefined();
  });

  it('dataSource should be defined', () => {
    expect(dataSource).toBeDefined();
  });

  it('logger should be defined', () => {
    expect(logger).toBeDefined();
  });

  itGenerated('generated should contain 3240 tests', () => {
    expect(generated.length).toBe(27);
    for (const item of generated) {
      const generatedTests = item[1];
      expect(generatedTests.tests.length).toBe(120);
    }
  });

  describe('with no data stored', () => {
    it('database should be empty', async () => {});

    describe('with database available', () => {
      describe('get()', () => {
        describe('for not stored query', () => {
          beforeEach(() => {
            fixtures.query = structuredClone(
              fixtures.endokrynoKatowice.sourceQuery,
            );
          });

          it('query should be defined', () => {
            expect(fixtures.query).toEqual(
              fixtures.endokrynoKatowice.sourceQuery,
            );
            expect(fixtures.query).not.toBe(
              fixtures.endokrynoKatowice.sourceQuery,
            );
          });

          it('should return null', async () => {
            await expect(
              nfzQueuesCacheService.get(fixtures.query!),
            ).resolves.toBeNull();
          });
        });
      });

      describe('store()', () => {
        describe('for valid query and queues', () => {
          beforeEach(() => {
            fixtures.query = structuredClone(
              fixtures.endokrynoKatowice.sourceQuery,
            );
            fixtures.queues = structuredClone(
              fixtures.endokrynoKatowice.sourceQueues,
            );
          });

          it('query should be defined', () => {
            expect(fixtures.query).toEqual(
              fixtures.endokrynoKatowice.sourceQuery,
            );
            expect(fixtures.query).not.toBe(
              fixtures.endokrynoKatowice.sourceQuery,
            );
          });

          it('queues should be defined', () => {
            expect(fixtures.queues).toEqual(
              fixtures.endokrynoKatowice.sourceQueues,
            );
            expect(fixtures.queues).not.toBe(
              fixtures.endokrynoKatowice.sourceQueues,
            );
          });

          it('should resolve to undefined', async () => {
            await expect(
              nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
            ).resolves.toBeUndefined();
          });

          it('should save query and all queues to database', async () => {
            await expect(
              nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
            ).resolves.toBeUndefined();

            const queriesRepository =
              dataSource.getRepository(CachedNfzQueuesQuery);
            const cachedQueries = await queriesRepository.find();
            expect(cachedQueries.length).toBe(1);
            expect({
              case: cachedQueries[0].case,
              benefitForChildren: cachedQueries[0].benefitForChildren,
              benefit: cachedQueries[0].benefit,
              province: cachedQueries[0].province,
              locality: cachedQueries[0].locality,
            }).toStrictEqual(fixtures.endokrynoKatowice.sourceQuery);

            const queuesRepository = dataSource.getRepository(CachedNfzQueue);
            const cachedQueues = await queuesRepository.find({
              relations: {
                statistics: {
                  providerData: true,
                },
                dates: true,
                benefitsProvided: true,
              },
            });
            expect(cachedQueues.length).toBe(
              fixtures.endokrynoKatowice.sourceQueues.length,
            );

            const cachedQueuesParsed = cachedQueues.map((cachedQueue) =>
              fromCachedNfzQueue(cachedQueue),
            );
            expect(cachedQueuesParsed).toStrictEqual(
              fixtures.endokrynoKatowice.sourceQueues,
            );
            expect(cachedQueuesParsed).not.toBe(
              fixtures.endokrynoKatowice.sourceQueues,
            );
          });

          it('should save queues and get() should return those queues for the same query', async () => {
            await expect(
              nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
            ).resolves.toBeUndefined();
            await expect(
              nfzQueuesCacheService.get(fixtures.query!),
            ).resolves.toEqual(fixtures.queues);
          });
        });

        describe('for valid query and invalid queues', () => {
          beforeEach(() => {
            fixtures.query = Object.assign(
              {},
              fixtures.endokrynoKatowice.sourceQuery,
            );
            fixtures.queues = structuredClone(
              fixtures.endokrynoKatowice.sourceQueues,
            );
            Reflect.deleteProperty(fixtures.queues[4].attributes, 'toilet');
          });

          it('query should be defined', () => {
            expect(fixtures.query).toStrictEqual(
              fixtures.endokrynoKatowice.sourceQuery,
            );
            expect(fixtures.query).not.toBe(
              fixtures.endokrynoKatowice.sourceQuery,
            );
          });

          it('queues should be defined with one queue invalid (missing NOT NULL toilet value)', () => {
            expect({
              ...fixtures.queues![4],
              attributes: {
                ...fixtures.queues![4].attributes,
                toilet: 'Y',
              },
            }).toEqual(fixtures.endokrynoKatowice.sourceQueues[4]);
            expect(fixtures.queues![4]).not.toEqual(
              fixtures.endokrynoKatowice.sourceQueues[4],
            );
          });

          it('should resolve to undefined', async () => {
            await expect(
              nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
            ).resolves.toBeUndefined();
          });

          it('should log warning that query and queues could not be saved due to invalid queue', async () => {
            await expect(
              nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
            ).resolves.toBeUndefined();

            expect(logger.warn).toBeCalledTimes(1);
            expect(logger.warn).toHaveBeenNthCalledWith(
              1,
              'could not store data: SQLITE_CONSTRAINT: NOT NULL constraint failed: cached_nfz_queue.toilet',
              'NfzQueuesCacheService',
            );
          });

          it('should leave database empty', async () => {
            await expect(
              nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
            ).resolves.toBeUndefined();

            const entities = dataSource.entityMetadatas.map(
              (entityMetadata) => entityMetadata.target,
            );
            for (const entity of entities) {
              const repository = dataSource.getRepository(entity);
              await expect(repository.find()).resolves.toStrictEqual([]);
            }
          });

          it('should not save queues and get() should return null for the same query', async () => {
            await expect(
              nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
            ).resolves.toBeUndefined();
            await expect(
              nfzQueuesCacheService.get(fixtures.query!),
            ).resolves.toBeNull();
          });
        });

        describe.each([
          ['missing case', 'case'],
          ['missing benefitForChildren', 'benefitForChildren'],
        ])(
          'for invalid query (%s) and valid queues',
          (_, missingFieldInQuery: 'case' | 'benefitForChildren') => {
            beforeEach(() => {
              fixtures.query = Object.assign(
                {},
                fixtures.endokrynoKatowice.sourceQuery,
              );
              fixtures.queues = fixtures.endokrynoKatowice.sourceQueues;
              Reflect.deleteProperty(fixtures.query, missingFieldInQuery);
            });

            it(`query should be defined and missing a field`, () => {
              expect({
                ...fixtures.query,
                [missingFieldInQuery]:
                  fixtures.endokrynoKatowice.sourceQuery[missingFieldInQuery],
              }).toEqual(fixtures.endokrynoKatowice.sourceQuery);
              expect(fixtures.query).not.toEqual(
                fixtures.endokrynoKatowice.sourceQuery,
              );
            });

            it('queues should be defined', () => {
              expect(fixtures.queues).toStrictEqual(
                fixtures.endokrynoKatowice.sourceQueues,
              );
            });

            it('should resolve to undefined', async () => {
              await expect(
                nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
              ).resolves.toBeUndefined();
            });

            it('should log warning that query and queues could not be saved due to invalid query', async () => {
              await expect(
                nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
              ).resolves.toBeUndefined();

              expect(logger.warn).toBeCalledTimes(1);
              expect(logger.warn).toHaveBeenNthCalledWith(
                1,
                `could not store data: SQLITE_CONSTRAINT: NOT NULL constraint failed: cached_nfz_queues_query.${missingFieldInQuery}`,
                'NfzQueuesCacheService',
              );
            });

            it('should leave database empty', async () => {
              await expect(
                nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
              ).resolves.toBeUndefined();

              const entities = dataSource.entityMetadatas.map(
                (entityMetadata) => entityMetadata.target,
              );
              for (const entity of entities) {
                const repository = dataSource.getRepository(entity);
                await expect(repository.find()).resolves.toStrictEqual([]);
              }
            });

            it('should not save queues and get() should return null for the same query', async () => {
              await expect(
                nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
              ).resolves.toBeUndefined();
              await expect(
                nfzQueuesCacheService.get(fixtures.query!),
              ).resolves.toBeNull();
            });
          },
        );
      });
    });

    describe('with database not available', () => {
      beforeEach(async () => {
        await dataSource.destroy();
      });

      it('dataSource should not be initialized', () => {
        expect(dataSource.isInitialized).toBeFalsy();
      });

      describe('get()', () => {
        describe('for not stored query', () => {
          beforeEach(() => {
            fixtures.query = structuredClone(
              fixtures.endokrynoKatowice.sourceQuery,
            );
          });

          it('query should be defined', () => {
            expect(fixtures.query).toEqual(
              fixtures.endokrynoKatowice.sourceQuery,
            );
            expect(fixtures.query).not.toBe(
              fixtures.endokrynoKatowice.sourceQuery,
            );
          });

          it('should return null', async () => {
            await expect(
              nfzQueuesCacheService.get(fixtures.query!),
            ).resolves.toBeNull();
          });

          it('should log warning that database could not be read', async () => {
            await expect(
              nfzQueuesCacheService.get(fixtures.query!),
            ).resolves.toBeNull();

            expect(logger.warn).toHaveBeenCalledTimes(1);
            expect(logger.warn).toHaveBeenNthCalledWith(
              1,
              'could not read data from database: Connection with sqlite database is not established. Check connection configuration.',
              'NfzQueuesCacheService',
            );
          });
        });
      });

      describe('store()', () => {
        describe('for valid query and queues', () => {
          beforeEach(() => {
            fixtures.query = structuredClone(
              fixtures.endokrynoKatowice.sourceQuery,
            );
            fixtures.queues = structuredClone(
              fixtures.endokrynoKatowice.sourceQueues,
            );
          });

          it('query should be defined', () => {
            expect(fixtures.query).toEqual(
              fixtures.endokrynoKatowice.sourceQuery,
            );
            expect(fixtures.query).not.toBe(
              fixtures.endokrynoKatowice.sourceQuery,
            );
          });

          it('queues should be defined', () => {
            expect(fixtures.queues).toEqual(
              fixtures.endokrynoKatowice.sourceQueues,
            );
            expect(fixtures.queues).not.toBe(
              fixtures.endokrynoKatowice.sourceQueues,
            );
          });

          it('should resolve to undefined', async () => {
            await expect(
              nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
            ).resolves.toBeUndefined();
          });

          it('should log warning that database could not be accessed', async () => {
            await expect(
              nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
            ).resolves.toBeUndefined();

            expect(logger.warn).toHaveBeenCalledTimes(1);
            expect(logger.warn).toHaveBeenNthCalledWith(
              1,
              'could not create a transaction for database: Connection with sqlite database is not established. Check connection configuration.',
              'NfzQueuesCacheService',
            );
          });

          it('should not save queues and get() should return null for the same query', async () => {
            await expect(
              nfzQueuesCacheService.store(fixtures.query!, fixtures.queues!),
            ).resolves.toBeUndefined();
            await expect(
              nfzQueuesCacheService.get(fixtures.query!),
            ).resolves.toBeNull();
          });
        });
      });
    });
  });

  describe('with data stored', () => {
    describe.each([
      ['queues being empty array', [], 1],
      ['queues being actual data', fixtures.endokrynoKatowice.sourceQueues, 2],
      ['queues being actual data', fixtures.endoPoland.sourceQueues, 3],
    ])('stored %s', (_, storedQueues, setNo) => {
      if (setNo !== 3) {
        describe.each([
          ['query with all fields', null],
          ['query without benefit', 'benefit'],
          ['query without province', 'province'],
          ['query without locality', 'locality'],
        ])(
          'stored %s',
          (
            _,
            missingFieldInStoredQuery: 'benefit' | 'province' | 'locality',
          ) => {
            beforeEach(async () => {
              fixtures.query = Object.assign(
                {},
                fixtures.endokrynoKatowice.sourceQuery,
              );
              if (missingFieldInStoredQuery) {
                delete fixtures.query[missingFieldInStoredQuery];
              }
              fixtures.queues = storedQueues;
              await nfzQueuesCacheService.store(
                fixtures.query,
                fixtures.queues,
              );
            });

            describe('with database available', () => {
              describe('get()', () => {
                describe('for correct query', () => {
                  it('should return stored queues', async () => {
                    await expect(
                      nfzQueuesCacheService.get(fixtures.query!),
                    ).resolves.toStrictEqual(fixtures.queues);
                  });

                  it('should return stored queues for benefitForChildren which is not strict-case equal', async () => {
                    await expect(
                      nfzQueuesCacheService.get({
                        ...fixtures.query!,
                        benefitForChildren: 'FalSE',
                      }),
                    ).resolves.toStrictEqual(fixtures.queues);
                  });

                  if (missingFieldInStoredQuery !== 'benefit') {
                    it('should return stored queues for benefit which is not strict-case equal', async () => {
                      await expect(
                        nfzQueuesCacheService.get({
                          ...fixtures.query!,
                          benefit: 'EnDOKryNO',
                        }),
                      ).resolves.toStrictEqual(fixtures.queues!);
                    });
                  }

                  if (missingFieldInStoredQuery !== 'locality') {
                    it('should return stored queues for locality which is not strict-case equal', async () => {
                      await expect(
                        nfzQueuesCacheService.get({
                          ...fixtures.query!,
                          locality: 'KaTOwice',
                        }),
                      ).resolves.toStrictEqual(fixtures.queues);
                    });
                  }
                });

                describe('for incorrect query', () => {
                  it('should return null when called with different case', async () => {
                    await expect(
                      nfzQueuesCacheService.get({
                        ...fixtures.query!,
                        case: 2,
                      }),
                    ).resolves.toBeNull();
                  });

                  it('should return null when called with different benefitForChildren', async () => {
                    await expect(
                      nfzQueuesCacheService.get({
                        ...fixtures.query!,
                        benefitForChildren: 'true',
                      }),
                    ).resolves.toBeNull();
                  });

                  if (missingFieldInStoredQuery !== 'benefit') {
                    it('should return null when called with different benefit', async () => {
                      await expect(
                        nfzQueuesCacheService.get({
                          ...fixtures.query!,
                          benefit: 'endo',
                        }),
                      ).resolves.toBeNull();
                    });
                  }

                  if (missingFieldInStoredQuery !== 'province') {
                    it('should return null when called with different province', async () => {
                      await expect(
                        nfzQueuesCacheService.get({
                          ...fixtures.query!,
                          province: 5,
                        }),
                      ).resolves.toBeNull();
                    });
                  }

                  if (missingFieldInStoredQuery !== 'locality') {
                    it('should return null when called with different locality', async () => {
                      await expect(
                        nfzQueuesCacheService.get({
                          ...fixtures.query!,
                          locality: '.Katowice',
                        }),
                      ).resolves.toBeNull();
                    });
                  }

                  if (missingFieldInStoredQuery !== 'benefit') {
                    it('should return null when called with no benefit', async () => {
                      delete fixtures.query!.benefit;
                      await expect(
                        nfzQueuesCacheService.get(fixtures.query!),
                      ).resolves.toBeNull();
                    });
                  } else {
                    it('should return all stored queues when called with missing benefit', async () => {
                      expect(
                        fixtures.endokrynoKatowice.sourceQuery.benefit,
                      ).toBeDefined();
                      await expect(
                        nfzQueuesCacheService.get({
                          ...fixtures.query!,
                          benefit:
                            fixtures.endokrynoKatowice.sourceQuery.benefit,
                        }),
                      ).resolves.toStrictEqual(fixtures.queues);
                    });
                    it('should return empty array when called with incorrect benefit', async () => {
                      await expect(
                        nfzQueuesCacheService.get({
                          ...fixtures.query!,
                          benefit:
                            'LECZENIE STANU ZAPALNEGO EKSPERYMANTALNEGO STAWU MOCUJĄCEGO SKRZYDŁO SERII rs363050',
                        }),
                      ).resolves.toStrictEqual([]);
                    });
                  }

                  if (missingFieldInStoredQuery !== 'province') {
                    it('should return null when called with no province', async () => {
                      delete fixtures.query!.province;
                      await expect(
                        nfzQueuesCacheService.get(fixtures.query!),
                      ).resolves.toBeNull();
                    });
                  } else {
                    it('should return all stored queues when called with missing province', async () => {
                      expect(
                        fixtures.endokrynoKatowice.sourceQuery.province,
                      ).toBeDefined();
                      await expect(
                        nfzQueuesCacheService.get({
                          ...fixtures.query!,
                          province:
                            fixtures.endokrynoKatowice.sourceQuery.province,
                        }),
                      ).resolves.toStrictEqual(fixtures.queues);
                    });
                    it('should return empty array when called with incorrect province', async () => {
                      await expect(
                        nfzQueuesCacheService.get({
                          ...fixtures.query!,
                          province: 6,
                        }),
                      ).resolves.toStrictEqual([]);
                    });
                  }

                  if (missingFieldInStoredQuery !== 'locality') {
                    it('should return null when called with no locality', async () => {
                      delete fixtures.query!.locality;
                      await expect(
                        nfzQueuesCacheService.get(fixtures.query!),
                      ).resolves.toBeNull();
                    });
                  } else {
                    it('should return all stored queues when called with missing locality', async () => {
                      expect(
                        fixtures.endokrynoKatowice.sourceQuery.locality,
                      ).toBeDefined();
                      await expect(
                        nfzQueuesCacheService.get({
                          ...fixtures.query!,
                          locality:
                            fixtures.endokrynoKatowice.sourceQuery.locality,
                        }),
                      ).resolves.toStrictEqual(fixtures.queues);
                    });
                    it('should return empty array when called with incorrect locality', async () => {
                      await expect(
                        nfzQueuesCacheService.get({
                          ...fixtures.query!,
                          locality: 'KRAK',
                        }),
                      ).resolves.toStrictEqual([]);
                    });
                  }
                });
              });

              describe('write()', () => {
                // TODO: this could use a third scenario where actual queues are shadowed by another set of actual queues
                // to check that all of them are in db, now there is always req_2_page_3.data + [] (nothing) in db
                const oppositeQueues =
                  storedQueues.length === 0
                    ? fixtures.endokrynoKatowice.sourceQueues
                    : [];
                const oppositeQueuesDescription =
                  storedQueues.length === 0
                    ? 'queues being actual data'
                    : 'queues being empty array';

                describe(`for the same query but ${oppositeQueuesDescription}`, () => {
                  it('queue should be defined and not the one already stored', () => {
                    expect(oppositeQueues).toBeDefined();
                    expect(oppositeQueues).not.toEqual(fixtures.queues);
                  });

                  it('should resolve to undefined', async () => {
                    await expect(
                      nfzQueuesCacheService.store(
                        fixtures.query!,
                        oppositeQueues,
                      ),
                    ).resolves.toBeUndefined();
                  });

                  it('should leave database with query stored two times and both old and new queues', async () => {
                    await expect(
                      nfzQueuesCacheService.store(
                        fixtures.query!,
                        oppositeQueues,
                      ),
                    ).resolves.toBeUndefined();

                    const queriesRepository =
                      dataSource.getRepository(CachedNfzQueuesQuery);
                    const cachedQueries = await queriesRepository.find();
                    expect(cachedQueries.length).toBe(2);
                    const createExpectedQuery = (no: number) => {
                      const expectedQuery = {
                        case: cachedQueries[no].case,
                        benefitForChildren:
                          cachedQueries[no].benefitForChildren,
                        benefit: cachedQueries[no].benefit,
                        province: cachedQueries[no].province,
                        locality: cachedQueries[no].locality,
                      };
                      if (missingFieldInStoredQuery === 'benefit') {
                        delete expectedQuery.benefit;
                      }
                      if (missingFieldInStoredQuery === 'province') {
                        delete expectedQuery.province;
                      }
                      if (missingFieldInStoredQuery === 'locality') {
                        delete expectedQuery.locality;
                      }
                      return expectedQuery;
                    };
                    expect(createExpectedQuery(0)).toStrictEqual(
                      fixtures.query,
                    );
                    expect(createExpectedQuery(1)).toStrictEqual(
                      fixtures.query,
                    );

                    const queuesRepository =
                      dataSource.getRepository(CachedNfzQueue);
                    const cachedQueues = await queuesRepository.find({
                      relations: {
                        statistics: {
                          providerData: true,
                        },
                        dates: true,
                        benefitsProvided: true,
                      },
                    });
                    expect(cachedQueues.length).toBe(
                      fixtures.queues!.length + oppositeQueues.length,
                    );

                    const cachedQueuesParsed = cachedQueues.map((cachedQueue) =>
                      fromCachedNfzQueue(cachedQueue),
                    );
                    expect(cachedQueuesParsed).toStrictEqual([
                      ...fixtures.queues!,
                      ...oppositeQueues,
                    ]);
                  });

                  it('should save queues and get() should return new queues for the same query', async () => {
                    await expect(
                      nfzQueuesCacheService.store(
                        fixtures.query!,
                        oppositeQueues,
                      ),
                    ).resolves.toBeUndefined();

                    await expect(
                      nfzQueuesCacheService.get(fixtures.query!),
                    ).resolves.toStrictEqual(oppositeQueues);
                  });
                });
              });
            });

            describe('with database not available', () => {
              // TODO: implement it if it makes sense (idk)
            });
          },
        );
      }

      if (setNo === 3) {
        describe('stored query is not matching stored queues', () => {
          beforeEach(async () => {
            fixtures.query = {
              case: 1,
              benefitForChildren: 'false',
              benefit: 'laryngolog',
            };
            fixtures.queues = storedQueues;
            await nfzQueuesCacheService.store(fixtures.query, fixtures.queues);
          });

          it('stored query is not for endoPoland and mentions different benefit', () => {
            expect(fixtures.query).not.toEqual(fixtures.endoPoland.sourceQuery);
            expect(fixtures.query?.benefit).toContain('laryngolog');
            expect(fixtures.query?.benefit).not.toContain('endo');
            expect(fixtures.query?.benefit).not.toContain(
              fixtures.endoPoland.sourceQuery.benefit,
            );
          });

          it('stored queues are for endoPoland', () => {
            expect(fixtures.queues).toStrictEqual(
              fixtures.endoPoland.sourceQueues,
            );
          });

          describe('with database available', () => {
            describe('get()', () => {
              describe('for correct query (adequate to stored queues and actual query that was sent to NFZ API)', () => {
                it('should return null', async () => {
                  await expect(
                    nfzQueuesCacheService.get(fixtures.endoPoland.sourceQuery),
                  ).resolves.toBeNull();
                });
              });

              describe('for stored query (not adequate to queues)', () => {
                it('should return empty array', async () => {
                  await expect(
                    nfzQueuesCacheService.get(fixtures.query!),
                  ).resolves.toStrictEqual([]);
                });
              });
            });
          });
        });
      }

      if (setNo !== 2) {
        describe.each([
          ['query without optional fields', null],
          ['query with benefit ', 'benefit'],
          ['query with province', 'province'],
          ['query with locality', 'locality'],
        ])(
          'stored %s',
          (
            _,
            includedFieldInStoredQuery:
              | 'benefit'
              | 'province'
              | 'locality'
              | null,
          ) => {
            beforeEach(async () => {
              fixtures.query = Object.assign(
                {},
                {
                  case: fixtures.endoPoland.sourceQuery.case,
                  benefitForChildren:
                    fixtures.endoPoland.sourceQuery.benefitForChildren,
                },
              );
              if (includedFieldInStoredQuery === null) {
                fixtures.includedFieldFilter = () => true;
              }
              if (includedFieldInStoredQuery === 'benefit') {
                fixtures.query.benefit = 'ENDOPROTEZOPLASTYKA';
                fixtures.includedFieldFilter = (queue) =>
                  queue.attributes.benefit
                    .toUpperCase()
                    .includes('ENDOPROTEZOPLASTYKA');
              }
              if (includedFieldInStoredQuery === 'province') {
                fixtures.query.province = 6;
                fixtures.includedFieldFilter = (queue) =>
                  Number(queue.attributes['teryt-place'].slice(0, 2)) / 2 === 6;
              }
              if (includedFieldInStoredQuery === 'locality') {
                fixtures.query.locality = 'KRAKÓW';
                fixtures.includedFieldFilter = (queue) =>
                  queue.attributes.locality.toUpperCase().includes('KRAKÓW');
              }
              fixtures.queues = storedQueues;
              await nfzQueuesCacheService.store(
                fixtures.query,
                fixtures.queues,
              );
            });

            it('query should be missing fields', () => {
              if (includedFieldInStoredQuery !== 'benefit') {
                expect(fixtures.query!.benefit).toBeUndefined();
              } else {
                expect(fixtures.query!.benefit).toBeDefined();
              }

              if (includedFieldInStoredQuery !== 'province') {
                expect(fixtures.query!.province).toBeUndefined();
              } else {
                expect(fixtures.query!.province).toBeDefined();
              }

              if (includedFieldInStoredQuery !== 'locality') {
                expect(fixtures.query!.locality).toBeUndefined();
              } else {
                expect(fixtures.query!.locality).toBeDefined();
              }
            });

            describe('with database available', () => {
              describe('get()', () => {
                if (includedFieldInStoredQuery === null) {
                  describe('for query that additionally specified benefit', () => {
                    it('should return a subset of stored queues that match benefit', async () => {
                      const preciseQuery: NfzQueuesApiQuery = {
                        ...fixtures.query!,
                        benefit: 'ENDOPROTEZOPLASTYKA',
                      };
                      const expectedQueuesSubset = storedQueues.filter(
                        (storedQueue) => {
                          return storedQueue.attributes.benefit
                            .toUpperCase()
                            .includes('ENDOPROTEZOPLASTYKA');
                        },
                      );
                      await expect(
                        nfzQueuesCacheService.get(preciseQuery),
                      ).resolves.toStrictEqual(expectedQueuesSubset);
                    });
                  });

                  describe('for query that additionally specified province', () => {
                    it('should return a subset of stored queues that match province', async () => {
                      const preciseQuery: NfzQueuesApiQuery = {
                        ...fixtures.query!,
                        province: 13,
                      };
                      const expectedQueuesSubset = storedQueues.filter(
                        (storedQueue) => {
                          return (
                            Number(
                              storedQueue.attributes['teryt-place'].slice(0, 2),
                            ) /
                              2 ===
                            13
                          );
                        },
                      );
                      await expect(
                        nfzQueuesCacheService.get(preciseQuery),
                      ).resolves.toStrictEqual(expectedQueuesSubset);
                    });
                  });

                  describe('for query that additionally specified locality', () => {
                    it('should return a subset of stored queues that match province', async () => {
                      const preciseQuery: NfzQueuesApiQuery = {
                        ...fixtures.query!,
                        locality: 'KRAKÓW',
                      };
                      const expectedQueuesSubset = storedQueues.filter(
                        (storedQueue) => {
                          return storedQueue.attributes.locality
                            .toUpperCase()
                            .includes('KRAKÓW');
                        },
                      );
                      await expect(
                        nfzQueuesCacheService.get(preciseQuery),
                      ).resolves.toStrictEqual(expectedQueuesSubset);
                    });
                  });

                  describe('for query that additionally specified benefit and province', () => {
                    it('should return a subset of stored queues that match both benefit and province', async () => {
                      const preciseQuery: NfzQueuesApiQuery = {
                        ...fixtures.query!,
                        benefit: 'ENDOPROTEZOPLASTYKA',
                        province: 6,
                      };
                      const expectedQueuesSubset = storedQueues.filter(
                        (storedQueue) => {
                          return (
                            storedQueue.attributes.benefit
                              .toUpperCase()
                              .includes('ENDOPROTEZOPLASTYKA') &&
                            Number(
                              storedQueue.attributes['teryt-place'].slice(0, 2),
                            ) /
                              2 ===
                              6
                          );
                        },
                      );
                      await expect(
                        nfzQueuesCacheService.get(preciseQuery),
                      ).resolves.toStrictEqual(expectedQueuesSubset);
                    });
                  });

                  describe('for query that additionally specified benefit and locality', () => {
                    it('should return a subset of stored queues that match both benefit and locality', async () => {
                      const preciseQuery: NfzQueuesApiQuery = {
                        ...fixtures.query!,
                        benefit: 'ENDOPROTEZOPLASTYKA',
                        locality: 'KRAKÓW',
                      };
                      const expectedQueuesSubset = storedQueues.filter(
                        (storedQueue) => {
                          return (
                            storedQueue.attributes.benefit
                              .toUpperCase()
                              .includes('ENDOPROTEZOPLASTYKA') &&
                            storedQueue.attributes.locality
                              .toUpperCase()
                              .includes('KRAKÓW')
                          );
                        },
                      );
                      await expect(
                        nfzQueuesCacheService.get(preciseQuery),
                      ).resolves.toStrictEqual(expectedQueuesSubset);
                    });
                  });

                  describe('for query that additionally specified province and locality', () => {
                    it('should return a subset of stored queues that match both province and locality', async () => {
                      const preciseQuery: NfzQueuesApiQuery = {
                        ...fixtures.query!,
                        province: 6,
                        locality: 'KRAKÓW',
                      };
                      const expectedQueuesSubset = storedQueues.filter(
                        (storedQueue) => {
                          return (
                            Number(
                              storedQueue.attributes['teryt-place'].slice(0, 2),
                            ) /
                              2 ===
                              6 &&
                            storedQueue.attributes.locality
                              .toUpperCase()
                              .includes('KRAKÓW')
                          );
                        },
                      );
                      await expect(
                        nfzQueuesCacheService.get(preciseQuery),
                      ).resolves.toStrictEqual(expectedQueuesSubset);
                    });
                  });

                  describe('for query that additionally specified benefit, province and locality', () => {
                    it('should return a subset of stored queues that match all: benefit, province and locality', async () => {
                      const preciseQuery: NfzQueuesApiQuery = {
                        ...fixtures.query!,
                        benefit: 'ENDOPROTEZOPLASTYKA',
                        province: 6,
                        locality: 'KRAKÓW',
                      };
                      const expectedQueuesSubset = storedQueues.filter(
                        (storedQueue) => {
                          return (
                            storedQueue.attributes.benefit
                              .toUpperCase()
                              .includes('ENDOPROTEZOPLASTYKA') &&
                            Number(
                              storedQueue.attributes['teryt-place'].slice(0, 2),
                            ) /
                              2 ===
                              6 &&
                            storedQueue.attributes.locality
                              .toUpperCase()
                              .includes('KRAKÓW')
                          );
                        },
                      );
                      await expect(
                        nfzQueuesCacheService.get(preciseQuery),
                      ).resolves.toStrictEqual(expectedQueuesSubset);
                    });
                  });
                }

                if (includedFieldInStoredQuery !== 'benefit') {
                  describe('for query that additionally specifies benefit', () => {
                    if (storedQueues.length !== 0) {
                      it('should return a subset of stored queues that match given benefit', async () => {
                        const benefit = 'ENDOPROTEZOPLASTYKA STAWU KOLANOWEGO';
                        const preciseQuery: NfzQueuesApiQuery = {
                          ...fixtures.query!,
                          benefit,
                        };
                        const expectedQueuesSubset = storedQueues.filter(
                          (storedQueue) =>
                            storedQueue.attributes.benefit
                              .toUpperCase()
                              .includes(benefit) &&
                            fixtures.includedFieldFilter!(storedQueue),
                        );
                        await expect(
                          nfzQueuesCacheService.get(preciseQuery),
                        ).resolves.toStrictEqual(expectedQueuesSubset);
                      });
                      it('should return an empty array if nothing matches benefit', async () => {
                        const benefit =
                          'LECZENIE STANU ZAPALNEGO EKSPERYMANTALNEGO STAWU MOCUJĄCEGO SKRZYDŁO SERII rs363050';
                        const preciseQuery: NfzQueuesApiQuery = {
                          ...fixtures.query!,
                          benefit,
                        };
                        await expect(
                          nfzQueuesCacheService.get(preciseQuery),
                        ).resolves.toStrictEqual([]);
                      });
                    } else {
                      it('should return an empty array', async () => {
                        const benefit = 'ENDOPROTEZOPLASTYKA STAWU KOLANOWEGO';
                        const preciseQuery: NfzQueuesApiQuery = {
                          ...fixtures.query!,
                          benefit,
                        };
                        await expect(
                          nfzQueuesCacheService.get(preciseQuery),
                        ).resolves.toStrictEqual([]);
                      });
                    }
                  });
                }

                if (includedFieldInStoredQuery !== 'province') {
                  describe('for query that additionally specifies province', () => {
                    if (storedQueues.length !== 0) {
                      it('should return a subset of stored queues that matches province (by TERYT code)', async () => {
                        const province = 6;
                        const preciseQuery: NfzQueuesApiQuery = {
                          ...fixtures.query!,
                          province,
                        };
                        const expectedQueuesSubset = storedQueues.filter(
                          (storedQueue) =>
                            // because TERYT codes (part related to state/voivodeship) happens to be the `nfz province code` * 2
                            // in this case, this req_2 has province 6, which has TERYT code '12XXXXX'
                            Number(
                              storedQueue.attributes['teryt-place'].slice(0, 2),
                            ) ===
                              province * 2 &&
                            fixtures.includedFieldFilter!(storedQueue),
                        );
                        await expect(
                          nfzQueuesCacheService.get(preciseQuery),
                        ).resolves.toStrictEqual(expectedQueuesSubset);
                      });
                      it('should return an empty array if nothing matches province', async () => {
                        const province = 12;
                        const preciseQuery: NfzQueuesApiQuery = {
                          ...fixtures.query!,
                          province,
                        };
                        await expect(
                          nfzQueuesCacheService.get(preciseQuery),
                        ).resolves.toStrictEqual([]);
                      });
                    } else {
                      it('should return an empty array', async () => {
                        const province = 6;
                        const preciseQuery: NfzQueuesApiQuery = {
                          ...fixtures.query!,
                          province,
                        };
                        await expect(
                          nfzQueuesCacheService.get(preciseQuery),
                        ).resolves.toStrictEqual([]);
                      });
                    }
                  });
                }

                if (includedFieldInStoredQuery !== 'locality') {
                  describe('for query that additionally specifies locality', () => {
                    if (storedQueues.length !== 0) {
                      it('should return a subset of stored queues that matches locality', async () => {
                        const locality = 'KRAKÓW';
                        const preciseQuery: NfzQueuesApiQuery = {
                          ...fixtures.query!,
                          locality,
                        };
                        const expectedQueuesSubset = storedQueues.filter(
                          (storedQueue) =>
                            storedQueue.attributes.locality
                              .toUpperCase()
                              .includes(locality) &&
                            fixtures.includedFieldFilter!(storedQueue),
                        );
                        await expect(
                          nfzQueuesCacheService.get(preciseQuery),
                        ).resolves.toStrictEqual(expectedQueuesSubset);
                      });
                      it('should return an empty array if nothing matches locality', async () => {
                        const locality = 'KATOWICE';
                        const preciseQuery: NfzQueuesApiQuery = {
                          ...fixtures.query!,
                          locality,
                        };
                        await expect(
                          nfzQueuesCacheService.get(preciseQuery),
                        ).resolves.toStrictEqual([]);
                      });
                    } else {
                      it('should return an empty array', async () => {
                        const locality = 'KRAKÓW';
                        const preciseQuery: NfzQueuesApiQuery = {
                          ...fixtures.query!,
                          locality,
                        };
                        await expect(
                          nfzQueuesCacheService.get(preciseQuery),
                        ).resolves.toStrictEqual([]);
                      });
                    }
                  });
                }
              });
            });
          },
        );
      }

      if (setNo !== 2) {
        describeGenerated('generated tests', () => {
          describe.each(generated)('%s', (_, generatedTests) => {
            beforeEach(async () => {
              fixtures.query = {
                case: 1,
                benefitForChildren: 'false',
                ...generatedTests.stored.query,
              };
              fixtures.queues = storedQueues;
              await nfzQueuesCacheService.store(
                fixtures.query,
                fixtures.queues,
              );
            });

            describe('with database available', () => {
              describe('get()', () => {
                describe.each(generatedTests.tests)(
                  'for generated query:',
                  (shouldText, generatedTest) => {
                    describe(`query with benefit = ${generatedTest.for.benefit}, province = ${generatedTest.for.province}, locality = ${generatedTest.for.locality}`, () => {
                      it(shouldText, async () => {
                        const query: NfzQueuesApiQuery = {
                          case: 1,
                          benefitForChildren: 'false',
                          ...generatedTest.for,
                        };

                        if (generatedTest.getCallResolvesTo === null) {
                          await expect(
                            nfzQueuesCacheService.get(query),
                          ).resolves.toBeNull();
                        } else {
                          const expectedQueuesSubset = storedQueues.filter(
                            generatedTest.getCallResolvesTo,
                          );
                          await expect(
                            nfzQueuesCacheService.get(query),
                          ).resolves.toStrictEqual(expectedQueuesSubset);
                        }
                      });
                    });
                  },
                );
              });
            });
          });
        });
      }
    });
  });
});
