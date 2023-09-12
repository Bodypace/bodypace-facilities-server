import { Module } from '@nestjs/common';
import { NfzQueuesModule } from './queues/queues.module';

@Module({
  imports: [NfzQueuesModule],
})
export class NfzModule {}
