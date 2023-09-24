import { Module } from '@nestjs/common';
import { NfzQueuesApiClientModule } from './modules/api-client/api-client.module';
import { NfzQueuesController } from './queues.controller';
import { NfzQueuesService } from './queues.service';
import { NfzQueuesCacheModule } from './modules/cache/cache.module';
import { GeocoderModule } from '../../../geocoder/geocoder.module';

@Module({
  imports: [NfzQueuesApiClientModule, NfzQueuesCacheModule, GeocoderModule],
  controllers: [NfzQueuesController],
  providers: [NfzQueuesService],
})
export class NfzQueuesModule {}
