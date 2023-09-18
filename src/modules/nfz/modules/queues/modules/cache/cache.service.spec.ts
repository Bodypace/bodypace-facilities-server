import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NfzQueuesCacheService } from './cache.service';
import { NfzQueuesApiQuery } from '../api-client/interfaces/query.interface';
import { NfzQueuesApiQueue } from '../api-client/interfaces/queue.interface';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CachedNfzQueueStatisticsProviderData,
  CachedNfzQueueStatistics,
  CachedNfzQueueDates,
  CachedNfzQueueBenefitsProvided,
  CachedNfzQueue,
} from './entities/cached-queue.entity';
import { CachedNfzQueuesQuery } from './entities/cached-queues-query.entity';
import { mockedResponse } from '../../../../../../../test/mocks/httpService/mocked-response-1-false-endo-06-page-4';
import { unlink } from 'node:fs/promises';
import { fromCachedNfzQueue } from './utils/from-cached-nfz-queue.util';

function MockedLogger() {
  return {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

describe('NfzQueuesCacheService', () => {
  const databaseName = 'test-nfz-queues-cache-service-database.sqlite';
  let nfzQueuesCacheService: NfzQueuesCacheService;
  let logger: LoggerService;
  let dataSource: DataSource;
  const sourceQuery: NfzQueuesApiQuery = {
    case: 1,
    benefitForChildren: 'false',
    benefit: 'laryngolog',
    province: 4,
    locality: 'MARS BASE no.3',
  };
  let query: NfzQueuesApiQuery;
  let queues: NfzQueuesApiQueue[];

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

  describe('with no data stored', () => {
    it('database should be empty', async () => {});

    describe('with database available', () => {
      describe('get()', () => {
        describe('for not stored query', () => {
          beforeEach(() => {
            query = structuredClone(sourceQuery);
          });

          it('query should be defined', () => {
            expect(query).toEqual(sourceQuery);
            expect(query).not.toBe(sourceQuery);
          });

          it('should return null', async () => {
            await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();
          });
        });
      });

      describe('store()', () => {
        describe('for valid query and queues', () => {
          beforeEach(() => {
            query = structuredClone(sourceQuery);
            queues = structuredClone(mockedResponse.response.data);
          });

          it('query should be defined', () => {
            expect(query).toEqual(sourceQuery);
            expect(query).not.toBe(sourceQuery);
          });

          it('queues should be defined', () => {
            expect(queues).toEqual(mockedResponse.response.data);
            expect(queues).not.toBe(mockedResponse.response.data);
          });

          it('should resolve to undefined', async () => {
            await expect(
              nfzQueuesCacheService.store(query, queues),
            ).resolves.toBeUndefined();
          });

          it('should save query and all queues to database', async () => {
            await expect(
              nfzQueuesCacheService.store(query, queues),
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
            }).toStrictEqual(sourceQuery);

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
              mockedResponse.response.data.length,
            );

            const cachedQueuesParsed = cachedQueues.map((cachedQueue) =>
              fromCachedNfzQueue(cachedQueue),
            );
            expect(cachedQueuesParsed).toStrictEqual(
              mockedResponse.response.data,
            );
            expect(cachedQueuesParsed).not.toBe(mockedResponse.response.data);
          });

          it('should save queues and get() should return those queues for the same query', async () => {
            await expect(
              nfzQueuesCacheService.store(query, queues),
            ).resolves.toBeUndefined();
            await expect(nfzQueuesCacheService.get(query)).resolves.toEqual(
              queues,
            );
          });
        });

        describe('for valid query and invalid queues', () => {
          beforeEach(() => {
            query = Object.assign({}, sourceQuery);
            queues = structuredClone(mockedResponse.response.data);
            Reflect.deleteProperty(queues[4].attributes, 'toilet');
          });

          it('query should be defined', () => {
            expect(query).toStrictEqual(sourceQuery);
            expect(query).not.toBe(sourceQuery);
          });

          it('queues should be defined with one queue invalid (missing NOT NULL toilet value)', () => {
            expect({
              ...queues[4],
              attributes: {
                ...queues[4].attributes,
                toilet: 'Y',
              },
            }).toEqual(mockedResponse.response.data[4]);
            expect(queues[4]).not.toEqual(mockedResponse.response.data[4]);
          });

          it('should resolve to undefined', async () => {
            await expect(
              nfzQueuesCacheService.store(query, queues),
            ).resolves.toBeUndefined();
          });

          it('should log warning that query and queues could not be saved due to invalid queue', async () => {
            await expect(
              nfzQueuesCacheService.store(query, queues),
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
              nfzQueuesCacheService.store(query, queues),
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
              nfzQueuesCacheService.store(query, queues),
            ).resolves.toBeUndefined();
            await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();
          });
        });

        describe.each([
          ['missing case', 'case'],
          ['missing benefitForChildren', 'benefitForChildren'],
        ])(
          'for invalid query (%s) and valid queues',
          (_, missingFieldInQuery: 'case' | 'benefitForChildren') => {
            beforeEach(() => {
              query = Object.assign({}, sourceQuery);
              queues = mockedResponse.response.data;
              Reflect.deleteProperty(query, missingFieldInQuery);
            });

            it(`query should be defined and missing a field`, () => {
              expect({
                ...query,
                [missingFieldInQuery]: sourceQuery[missingFieldInQuery],
              }).toEqual(sourceQuery);
              expect(query).not.toEqual(sourceQuery);
            });

            it('queues should be defined', () => {
              expect(queues).toStrictEqual(mockedResponse.response.data);
            });

            it('should resolve to undefined', async () => {
              await expect(
                nfzQueuesCacheService.store(query, queues),
              ).resolves.toBeUndefined();
            });

            it('should log warning that query and queues could not be saved due to invalid query', async () => {
              await expect(
                nfzQueuesCacheService.store(query, queues),
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
                nfzQueuesCacheService.store(query, queues),
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
                nfzQueuesCacheService.store(query, queues),
              ).resolves.toBeUndefined();
              await expect(
                nfzQueuesCacheService.get(query),
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
            query = structuredClone(sourceQuery);
          });

          it('query should be defined', () => {
            expect(query).toEqual(sourceQuery);
            expect(query).not.toBe(sourceQuery);
          });

          it('should return null', async () => {
            await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();
          });

          it('should log warning that database could not be read', async () => {
            await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();

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
            query = structuredClone(sourceQuery);
            queues = structuredClone(mockedResponse.response.data);
          });

          it('query should be defined', () => {
            expect(query).toEqual(sourceQuery);
            expect(query).not.toBe(sourceQuery);
          });

          it('queues should be defined', () => {
            expect(queues).toEqual(mockedResponse.response.data);
            expect(queues).not.toBe(mockedResponse.response.data);
          });

          it('should resolve to undefined', async () => {
            await expect(
              nfzQueuesCacheService.store(query, queues),
            ).resolves.toBeUndefined();
          });

          it('should log warning that database could not be accessed', async () => {
            await expect(
              nfzQueuesCacheService.store(query, queues),
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
              nfzQueuesCacheService.store(query, queues),
            ).resolves.toBeUndefined();
            await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();
          });
        });
      });
    });
  });

  describe('with already data stored', () => {
    describe.each([
      ['queues being empty array', []],
      ['queues being actual data', mockedResponse.response.data],
    ])('stored %s', (_, storedQueues) => {
      describe.each([
        ['query with all fields', null],
        ['query without benefit', 'benefit'],
        ['query without province', 'province'],
        ['query without locality', 'locality'],
      ])(
        'stored %s',
        (_, missingFieldInStoredQuery: 'benefit' | 'province' | 'locality') => {
          beforeEach(async () => {
            query = Object.assign({}, sourceQuery);
            if (missingFieldInStoredQuery) {
              delete query[missingFieldInStoredQuery];
            }
            queues = storedQueues;
            await nfzQueuesCacheService.store(query, queues);
          });

          describe('with database available', () => {
            describe('get()', () => {
              describe('for correct query', () => {
                it('should return stored queues', async () => {
                  await expect(
                    nfzQueuesCacheService.get(query),
                  ).resolves.toStrictEqual(queues);
                });

                it('should return stored queues for benefitForChildren which is not strict-case equal', async () => {
                  await expect(
                    nfzQueuesCacheService.get({
                      ...query,
                      benefitForChildren: 'FalSE',
                    }),
                  ).resolves.toStrictEqual(queues);
                });

                if (missingFieldInStoredQuery !== 'benefit') {
                  it('should return stored queues for benefit which is not strict-case equal', async () => {
                    await expect(
                      nfzQueuesCacheService.get({
                        ...query,
                        benefit: 'laRYNGOloG',
                      }),
                    ).resolves.toStrictEqual(queues);
                  });
                }

                if (missingFieldInStoredQuery !== 'locality') {
                  it('should return stored queues for locality which is not strict-case equal', async () => {
                    await expect(
                      nfzQueuesCacheService.get({
                        ...query,
                        locality: 'MARS base NO.3',
                      }),
                    ).resolves.toStrictEqual(queues);
                  });
                }
              });

              describe('for incorrect query', () => {
                it('should return null when called with different case', async () => {
                  await expect(
                    nfzQueuesCacheService.get({ ...query, case: 2 }),
                  ).resolves.toBeNull();
                });

                it('should return null when called with different benefitForChildren', async () => {
                  await expect(
                    nfzQueuesCacheService.get({
                      ...query,
                      benefitForChildren: 'true',
                    }),
                  ).resolves.toBeNull();
                });

                if (missingFieldInStoredQuery !== 'benefit') {
                  it('should return null when called with different benefit', async () => {
                    await expect(
                      nfzQueuesCacheService.get({
                        ...query,
                        benefit: 'laryngo',
                      }),
                    ).resolves.toBeNull();
                  });
                }

                if (missingFieldInStoredQuery !== 'province') {
                  it('should return null when called with different province', async () => {
                    await expect(
                      nfzQueuesCacheService.get({ ...query, province: 5 }),
                    ).resolves.toBeNull();
                  });
                }

                if (missingFieldInStoredQuery !== 'locality') {
                  it('should return null when called with different locality', async () => {
                    await expect(
                      nfzQueuesCacheService.get({
                        ...query,
                        locality: 'MARS BASE no 3',
                      }),
                    ).resolves.toBeNull();
                  });
                }

                if (missingFieldInStoredQuery !== 'benefit') {
                  it('should return null when called with no benefit', async () => {
                    delete query.benefit;
                    await expect(
                      nfzQueuesCacheService.get(query),
                    ).resolves.toBeNull();
                  });
                } else {
                  it('should return null when called with benefit', async () => {
                    expect(sourceQuery.benefit).toBeDefined();
                    await expect(
                      nfzQueuesCacheService.get({
                        ...query,
                        benefit: sourceQuery.benefit,
                      }),
                    ).resolves.toBeNull();
                  });
                }

                if (missingFieldInStoredQuery !== 'province') {
                  it('should return null when called with no province', async () => {
                    delete query.province;
                    await expect(
                      nfzQueuesCacheService.get(query),
                    ).resolves.toBeNull();
                  });
                } else {
                  it('should return null when called with province', async () => {
                    expect(sourceQuery.province).toBeDefined();
                    await expect(
                      nfzQueuesCacheService.get({
                        ...query,
                        province: sourceQuery.province,
                      }),
                    ).resolves.toBeNull();
                  });
                }

                if (missingFieldInStoredQuery !== 'locality') {
                  it('should return null when called with no locality', async () => {
                    delete query.locality;
                    await expect(
                      nfzQueuesCacheService.get(query),
                    ).resolves.toBeNull();
                  });
                } else {
                  it('should return null when called with locality', async () => {
                    expect(sourceQuery.locality).toBeDefined();
                    await expect(
                      nfzQueuesCacheService.get({
                        ...query,
                        locality: sourceQuery.locality,
                      }),
                    ).resolves.toBeNull();
                  });
                }
              });
            });
          });

          describe('with database not available', () => {
            // TODO: implement it if it makes sense (idk)
          });
        },
      );
    });
  });
});
