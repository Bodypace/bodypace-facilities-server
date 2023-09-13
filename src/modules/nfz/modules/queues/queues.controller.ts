import { Controller, Get, Logger, Query } from '@nestjs/common';
import { NfzQueuesService } from './queues.service';
import { NfzQueuesQuery } from './dto/query.dto';

@Controller('nfz')
export class NfzQueuesController {
  private readonly logger = new Logger(NfzQueuesController.name);

  constructor(private readonly nfzQueuesService: NfzQueuesService) {}

  @Get('queues')
  findAll(@Query() query: NfzQueuesQuery) {
    this.logger.log('#findAll()');
    return this.nfzQueuesService.findAll(query);
  }
}
