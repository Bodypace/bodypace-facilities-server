import { Controller, Get, Logger, Query, ValidationPipe } from '@nestjs/common';
import { NfzQueuesService } from './queues.service';
import { NfzQueuesQuery } from './dto/query.dto';

function ValidateQuery() {
  return new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  });
}

@Controller('nfz')
export class NfzQueuesController {
  private readonly logger = new Logger(NfzQueuesController.name);

  constructor(private readonly nfzQueuesService: NfzQueuesService) {}

  @Get('queues')
  findAll(@Query(ValidateQuery()) query: NfzQueuesQuery) {
    this.logger.log('#findAll()');
    return this.nfzQueuesService.findAll(query);
  }
}
