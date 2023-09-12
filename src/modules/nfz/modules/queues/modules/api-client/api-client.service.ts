import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NfzQueuesApiClientService {
  private readonly logger = new Logger(NfzQueuesApiClientService.name);

  fetchAll() {
    this.logger.log('#fetchAll()');
    return 'fetch all queues to a given benefit provided by NFZ in Poland';
  }
}
