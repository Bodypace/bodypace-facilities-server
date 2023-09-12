import { Injectable, Logger } from '@nestjs/common';
import { NfzQueuesApiClientService } from './modules/api-client/api-client.service';

@Injectable()
export class NfzQueuesService {
  private readonly logger = new Logger(NfzQueuesService.name);

  constructor(
    private readonly nfzQueuesApiClientService: NfzQueuesApiClientService,
  ) {}

  findAll(): string {
    this.logger.debug('#findAll()');
    return this.nfzQueuesApiClientService.fetchAll();
  }
}
