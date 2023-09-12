import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NfzQueuesService {
  private readonly logger = new Logger(NfzQueuesService.name);

  findAll(): string {
    this.logger.debug('#findAll()');
    return 'returns all queues to healthcare benefits provided by NFZ in Poland';
  }
}
