import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  CachedNfzQueueStatisticsProviderData,
  CachedNfzQueueStatistics,
  CachedNfzQueueDates,
  CachedNfzQueueBenefitsProvided,
  CachedNfzQueue,
} from './modules/nfz/modules/queues/modules/cache/entities/cached-queue.entity';
import { CachedNfzQueuesQuery } from './modules/nfz/modules/queues/modules/cache/entities/cached-queues-query.entity';
import { CreateNfzQueuesCacheModuleTables1694955236774 } from './migrations/1694955236774-CreateNfzQueuesCacheModuleTables';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: false,
  logging: true,
  entities: [
    CachedNfzQueueStatisticsProviderData,
    CachedNfzQueueStatistics,
    CachedNfzQueueDates,
    CachedNfzQueueBenefitsProvided,
    CachedNfzQueue,
    CachedNfzQueuesQuery,
  ],
  migrations: [CreateNfzQueuesCacheModuleTables1694955236774],
  subscribers: [],
});
