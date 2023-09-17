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
import { unlink } from 'node:fs/promises';

describe('NfzQueuesCacheService', () => {
  const databaseName = 'test-nfz-queues-cache-service-database.sqlite';
  let nfzQueuesCacheService: NfzQueuesCacheService;
  let dataSource: DataSource;
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
        query = {
          case: 1,
          benefitForChildren: 'false',
          benefit: 'laryngolog',
          province: 4,
          locality: 'MARS BASE no.3',
        };
      });

      it('should return null when called random query', async () => {
        await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();
      });
    });

    describe('get() - with data stored', () => {
      beforeEach(async () => {
        query = {
          case: 1,
          benefitForChildren: 'false',
          benefit: 'laryngolog',
          province: 4,
          locality: 'MARS BASE no.3',
        };
        queues = [];

        await nfzQueuesCacheService.store(query, queues);
      });

      it('should return stored queues for correct query', async () => {
        await expect(nfzQueuesCacheService.get(query)).resolves.toStrictEqual(
          queues,
        );
      });

      it('should return stored queues for correct query but benefitForChildren is not strict-case equal', async () => {
        await expect(
          nfzQueuesCacheService.get({ ...query, benefitForChildren: 'FalSE' }),
        ).resolves.toStrictEqual(queues);
      });

      it('should return stored queues for correct query but benefit is not strict-case equal', async () => {
        await expect(
          nfzQueuesCacheService.get({ ...query, benefit: 'laRYNGOloG' }),
        ).resolves.toStrictEqual(queues);
      });

      it('should return stored queues for correct query but locality is not strict-case equal', async () => {
        await expect(
          nfzQueuesCacheService.get({ ...query, locality: 'MARS base NO.3' }),
        ).resolves.toStrictEqual(queues);
      });

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

      it('should return null when called with different benefit', async () => {
        await expect(
          nfzQueuesCacheService.get({ ...query, benefit: 'laryngo' }),
        ).resolves.toBeNull();
      });

      it('should return null when called with different province', async () => {
        await expect(
          nfzQueuesCacheService.get({ ...query, province: 5 }),
        ).resolves.toBeNull();
      });

      it('should return null when called with different locality', async () => {
        await expect(
          nfzQueuesCacheService.get({ ...query, locality: 'MARS BASE no 3' }),
        ).resolves.toBeNull();
      });

      it('should return null when called with no benefit', async () => {
        delete query.benefit;
        await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();
      });

      it('should return null when called with no province', async () => {
        delete query.province;
        await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();
      });

      it('should return null when called with no locality', async () => {
        delete query.locality;
        await expect(nfzQueuesCacheService.get(query)).resolves.toBeNull();
      });
    });
  });
});
