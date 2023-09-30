import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { StoredGeocodedAddress } from './modules/geocoder/modules/database/entities/geocoded-address.entity';
import {
  CachedNfzQueueStatisticsProviderData,
  CachedNfzQueueStatistics,
  CachedNfzQueueDates,
  CachedNfzQueueBenefitsProvided,
  CachedNfzQueue,
} from './modules/nfz/modules/queues/modules/cache/entities/cached-queue.entity';
import { CachedNfzQueuesQuery } from './modules/nfz/modules/queues/modules/cache/entities/cached-queues-query.entity';
import { CreateGeocoderDatabaseModuleTables1696099269393 } from './migrations/1696099269393-CreateGeocoderDatabaseModuleTables';
import { CreateNfzQueuesCacheModuleTables1694955236774 } from './migrations/1694955236774-CreateNfzQueuesCacheModuleTables';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: false,
  logging: true,
  entities: [
    StoredGeocodedAddress,
    CachedNfzQueueStatisticsProviderData,
    CachedNfzQueueStatistics,
    CachedNfzQueueDates,
    CachedNfzQueueBenefitsProvided,
    CachedNfzQueue,
    CachedNfzQueuesQuery,
  ],
  migrations: [
    CreateGeocoderDatabaseModuleTables1696099269393,
    CreateNfzQueuesCacheModuleTables1694955236774,
  ],
  subscribers: [],
});
