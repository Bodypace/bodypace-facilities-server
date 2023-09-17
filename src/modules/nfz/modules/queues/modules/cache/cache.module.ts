import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfzQueuesCacheService } from './cache.service';
import {
  CachedNfzQueueStatisticsProviderData,
  CachedNfzQueueStatistics,
  CachedNfzQueueDates,
  CachedNfzQueueBenefitsProvided,
  CachedNfzQueue,
} from './entities/cached-queue.entity';
import { CachedNfzQueuesQuery } from './entities/cached-queues-query.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CachedNfzQueueStatisticsProviderData,
      CachedNfzQueueStatistics,
      CachedNfzQueueDates,
      CachedNfzQueueBenefitsProvided,
      CachedNfzQueue,
      CachedNfzQueuesQuery,
    ]),
  ],
  providers: [NfzQueuesCacheService],
  exports: [NfzQueuesCacheService],
})
export class NfzQueuesCacheModule {}
