import { Module } from '@nestjs/common';
import { NfzQueuesApiClientModule } from './modules/api-client/api-client.module';
import { NfzQueuesController } from './queues.controller';
import { NfzQueuesService } from './queues.service';
import { NfzQueuesCacheModule } from './modules/cache/cache.module';

@Module({
  imports: [NfzQueuesApiClientModule, NfzQueuesCacheModule],
  controllers: [NfzQueuesController],
  providers: [NfzQueuesService],
})
export class NfzQueuesModule {}
