import { Injectable } from '@nestjs/common';

@Injectable()
export class NfzQueuesService {
  findAll(): string {
    return 'returns all queues to healthcare benefits provided by NFZ in Poland';
  }
}
