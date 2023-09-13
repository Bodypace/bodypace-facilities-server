import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NfzQueuesApiClientService } from './api-client.service';

@Module({
  imports: [HttpModule],
  providers: [NfzQueuesApiClientService],
  exports: [NfzQueuesApiClientService],
})
export class NfzQueuesApiClientModule {}
