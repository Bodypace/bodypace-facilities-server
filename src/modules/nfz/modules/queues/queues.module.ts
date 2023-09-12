import { Module } from '@nestjs/common';
import { NfzQueuesApiClientModule } from './modules/api-client/api-client.module';
import { NfzQueuesController } from './queues.controller';
import { NfzQueuesService } from './queues.service';

@Module({
  imports: [NfzQueuesApiClientModule],
  controllers: [NfzQueuesController],
  providers: [NfzQueuesService],
})
export class NfzQueuesModule {}
