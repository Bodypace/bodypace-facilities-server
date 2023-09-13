import { Injectable, Logger } from '@nestjs/common';
import { NfzQueuesApiClientService } from './modules/api-client/api-client.service';
import { NfzQueuesApiQuery } from './modules/api-client/interfaces/query.interface';
import { NfzQueuesApiQueue } from './modules/api-client/interfaces/queue.interface';

@Injectable()
export class NfzQueuesService {
  private readonly logger = new Logger(NfzQueuesService.name);

  constructor(
    private readonly nfzQueuesApiClientService: NfzQueuesApiClientService,
  ) {}

  async findAll(query: NfzQueuesApiQuery): Promise<NfzQueuesApiQueue[]> {
    this.logger.debug('#findAll()');
    return await this.nfzQueuesApiClientService.fetchAll(query);
  }
}
