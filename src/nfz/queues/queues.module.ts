import { Module } from '@nestjs/common';
import { NfzQueuesController } from './queues.controller';
import { NfzQueuesService } from './queues.service';

@Module({
  controllers: [NfzQueuesController],
  providers: [NfzQueuesService],
})
export class NfzQueuesModule {}
