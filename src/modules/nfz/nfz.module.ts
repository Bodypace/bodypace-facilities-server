import { Module } from '@nestjs/common';
import { NfzQueuesModule } from './modules/queues/queues.module';

@Module({
  imports: [NfzQueuesModule],
})
export class NfzModule {}
