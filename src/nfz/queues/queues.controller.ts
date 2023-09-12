import { Controller, Get } from '@nestjs/common';
import { NfzQueuesService } from './queues.service';

@Controller('nfz')
export class NfzQueuesController {
  constructor(private readonly nfzQueuesService: NfzQueuesService) {}

  @Get('queues')
  findAll() {
    return this.nfzQueuesService.findAll();
  }
}
