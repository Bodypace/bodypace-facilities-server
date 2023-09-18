import { Injectable, Logger } from '@nestjs/common';
import { NfzQueuesApiClientService } from './modules/api-client/api-client.service';
import { NfzQueuesApiQuery } from './modules/api-client/interfaces/query.interface';
import { NfzQueuesApiQueue } from './modules/api-client/interfaces/queue.interface';
import { NfzQueuesCacheService } from './modules/cache/cache.service';

@Injectable()
export class NfzQueuesService {
  private readonly logger = new Logger(NfzQueuesService.name);

  constructor(
    private readonly nfzQueuesApiClientService: NfzQueuesApiClientService,
    private readonly nfzQueuesCacheService: NfzQueuesCacheService,
  ) {}

  async findAll(query: NfzQueuesApiQuery): Promise<NfzQueuesApiQueue[]> {
    this.logger.debug('#findAll()');

    let queues = await this.nfzQueuesCacheService.get(query);
    if (queues) {
      this.logger.log('#findAll() - cache hit');
      return queues;
    }

    this.logger.log('#findAll() - cache miss');
    queues = await this.nfzQueuesApiClientService.fetchAll(query);
    await this.nfzQueuesCacheService.store(query, queues);
    return queues;
  }
}
