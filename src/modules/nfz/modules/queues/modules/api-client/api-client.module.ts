import { Module } from '@nestjs/common';
import { NfzQueuesApiClientService } from './api-client.service';

@Module({
  providers: [NfzQueuesApiClientService],
  exports: [NfzQueuesApiClientService],
})
export class NfzQueuesApiClientModule {}
