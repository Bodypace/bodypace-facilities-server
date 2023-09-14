import { Module } from '@nestjs/common';
import { NfzQueuesCacheService } from './cache.service';

@Module({
  providers: [NfzQueuesCacheService],
  exports: [NfzQueuesCacheService],
})
export class NfzQueuesCacheModule {}
