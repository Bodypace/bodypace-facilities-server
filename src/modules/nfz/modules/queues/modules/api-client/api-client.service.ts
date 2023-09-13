import { Injectable, Logger } from '@nestjs/common';
import { NfzQueuesApiQuery } from './interfaces/query.interface';

@Injectable()
export class NfzQueuesApiClientService {
  private readonly logger = new Logger(NfzQueuesApiClientService.name);

  private validateQuery(query: NfzQueuesApiQuery): void {
    this.logger.debug(`#validateQuery() query = ${JSON.stringify(query)}`);

    if (query.locality && !query.province) {
      throw 'query passed to NfzQueuesApiClientService#fetchAll() must specify province when locality is specified.';
    }
  }

  fetchAll(query: NfzQueuesApiQuery) {
    this.logger.log(`#fetchAll() query = ${JSON.stringify(query)}`);
    this.validateQuery(query);
    return 'fetch all queues to a given benefit provided by NFZ in Poland';
  }
}
