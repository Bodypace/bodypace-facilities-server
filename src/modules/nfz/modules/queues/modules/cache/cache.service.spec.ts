import { Test, TestingModule } from '@nestjs/testing';
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

describe('NfzQueuesCacheService', () => {
  const databaseName = 'test-nfz-queues-cache-service-database.sqlite';
  let nfzQueuesCacheService: NfzQueuesCacheService;
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
    }).compile();

    nfzQueuesCacheService = module.get<NfzQueuesCacheService>(
      NfzQueuesCacheService,
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await dataSource.destroy();
    await unlink(databaseName);
  });

  it('service should be defined', () => {
    expect(nfzQueuesCacheService).toBeDefined();
  });

  it('dataSource should be defined', () => {
    expect(dataSource).toBeDefined();
  });

  describe('store() and get()', () => {
    describe('get() - with no data stored', () => {
      beforeEach(() => {
        query = Object.assign({}, sourceQuery);
      });

      it('should return null when called random query', async () => {
        await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();
      });
    });

    // describe('get() - with data stored', () => {
    describe.each([
      ['with queues - empty array', []],
      ['with queues - actual data', mockedResponse.response.data],
    ])('get() - with data stored (%s)', (_, currentQueues) => {
      describe.each([
        ['with query full', null],
        ['with query without benefit', 'benefit'],
        ['with query without province', 'province'],
        ['with query without locality', 'locality'],
      ])('%s', (_, fieldToRemove: 'benefit' | 'province' | 'locality') => {
        beforeEach(async () => {
          query = Object.assign({}, sourceQuery);

          if (fieldToRemove) {
            delete query[fieldToRemove];
          }

          queues = currentQueues;

          await nfzQueuesCacheService.store(query, queues);
        });

        it('should return stored queues for correct query', async () => {
          await expect(nfzQueuesCacheService.get(query)).resolves.toStrictEqual(
            queues,
          );
        });

        it('should return stored queues for correct query but benefitForChildren is not strict-case equal', async () => {
          await expect(
            nfzQueuesCacheService.get({
              ...query,
              benefitForChildren: 'FalSE',
            }),
          ).resolves.toStrictEqual(queues);
        });

        if (fieldToRemove !== 'benefit') {
          it('should return stored queues for correct query but benefit is not strict-case equal', async () => {
            await expect(
              nfzQueuesCacheService.get({ ...query, benefit: 'laRYNGOloG' }),
            ).resolves.toStrictEqual(queues);
          });
        }

        if (fieldToRemove !== 'locality') {
          it('should return stored queues for correct query but locality is not strict-case equal', async () => {
            await expect(
              nfzQueuesCacheService.get({
                ...query,
                locality: 'MARS base NO.3',
              }),
            ).resolves.toStrictEqual(queues);
          });
        }

        it('should return null when called with different case', async () => {
          await expect(
            nfzQueuesCacheService.get({ ...query, case: 2 }),
          ).resolves.toBeNull();
        });

        it('should return null when called with different benefitForChildren', async () => {
          await expect(
            nfzQueuesCacheService.get({ ...query, benefitForChildren: 'true' }),
          ).resolves.toBeNull();
        });

        if (fieldToRemove !== 'benefit') {
          it('should return null when called with different benefit', async () => {
            await expect(
              nfzQueuesCacheService.get({ ...query, benefit: 'laryngo' }),
            ).resolves.toBeNull();
          });
        }

        if (fieldToRemove !== 'province') {
          it('should return null when called with different province', async () => {
            await expect(
              nfzQueuesCacheService.get({ ...query, province: 5 }),
            ).resolves.toBeNull();
          });
        }

        if (fieldToRemove !== 'locality') {
          it('should return null when called with different locality', async () => {
            await expect(
              nfzQueuesCacheService.get({
                ...query,
                locality: 'MARS BASE no 3',
              }),
            ).resolves.toBeNull();
          });
        }

        if (fieldToRemove !== 'benefit') {
          it('should return null when called with no benefit', async () => {
            delete query.benefit;
            await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();
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

        if (fieldToRemove !== 'province') {
          it('should return null when called with no province', async () => {
            delete query.province;
            await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();
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

        if (fieldToRemove !== 'locality') {
          it('should return null when called with no locality', async () => {
            delete query.locality;
            await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();
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

    describe('store()', () => {
      describe('storage usage', () => {
        beforeEach(() => {
          query = structuredClone(sourceQuery);
          queues = structuredClone(mockedResponse.response.data);
        });

        it('query should be defined and valid', () => {
          expect(query).toEqual(sourceQuery);
          expect(query).not.toBe(sourceQuery);
        });

        it('queues should be defined and valid', () => {
          expect(queues).toEqual(mockedResponse.response.data);
          expect(queues).not.toBe(mockedResponse.response.data);
        });

        it('should write query and all queues to database', async () => {
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
          expect(cachedQueues.length).toBe(mockedResponse.response.data.length);

          const cachedQueuesParsed = cachedQueues.map((cachedQueue) =>
            fromCachedNfzQueue(cachedQueue),
          );
          expect(cachedQueuesParsed).toStrictEqual(
            mockedResponse.response.data,
          );
          expect(cachedQueuesParsed).not.toBe(mockedResponse.response.data);
        });
      });

      describe('transactional behavior', () => {
        describe.each([
          ['missing case', 'case'],
          ['missing benefitForChildren', 'benefitForChildren'],
        ])(
          'with incorrect query - %s',
          (_, queryFieldToRemove: 'case' | 'benefitForChildren') => {
            beforeEach(() => {
              query = Object.assign({}, sourceQuery);
              queues = mockedResponse.response.data;
              Reflect.deleteProperty(query, queryFieldToRemove);
            });

            it(`query should be missing a field`, () => {
              expect({
                ...query,
                [queryFieldToRemove]: sourceQuery[queryFieldToRemove],
              }).toEqual(sourceQuery);
              expect(query).not.toEqual(sourceQuery);
            });

            it('queues should be defined and correct', () => {
              expect(queues).toStrictEqual(mockedResponse.response.data);
            });

            it('should resolve to undefined', async () => {
              await expect(
                nfzQueuesCacheService.store(query, queues),
              ).resolves.toBeUndefined();
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

            it('should not save queues get() should return null for the same query', async () => {
              await expect(
                nfzQueuesCacheService.store(query, queues),
              ).resolves.toBeUndefined();
              await expect(
                nfzQueuesCacheService.get(query),
              ).resolves.toBeNull();
            });
          },
        );

        describe('with incorrect queue', () => {
          beforeEach(() => {
            query = Object.assign({}, sourceQuery);
            queues = structuredClone(mockedResponse.response.data);
            Reflect.deleteProperty(queues[4].attributes, 'toilet');
          });

          it('query should be defined and correct', () => {
            expect(query).toStrictEqual(sourceQuery);
            expect(query).not.toBe(sourceQuery);
          });

          it('queue element should be missing toilet value', () => {
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

          it('should not save queues get() should return null for the same query', async () => {
            await expect(
              nfzQueuesCacheService.store(query, queues),
            ).resolves.toBeUndefined();
            await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();
          });
        });
      });
    });
  });
});
