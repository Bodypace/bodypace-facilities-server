import { Controller, Get, Logger } from '@nestjs/common';
import { NfzQueuesService } from './queues.service';

@Controller('nfz')
export class NfzQueuesController {
  private readonly logger = new Logger(NfzQueuesController.name);

  constructor(private readonly nfzQueuesService: NfzQueuesService) {}

  @Get('queues')
  findAll() {
    this.logger.log('#findAll()');
    return this.nfzQueuesService.findAll();
  }
}
