import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@nestjs/common';
import { NfzQueuesController } from './queues.controller';
import { NfzQueuesService } from './queues.service';
import { NfzQueuesQuery } from './dto/query.dto';

function MockedLogger() {
  return {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

const mockedValues = {
  service: {
    findAll: 'findAll mocked value',
  },
};

function MockedNfzQueuesService() {
  return {
    findAll: jest.fn().mockResolvedValue(mockedValues.service.findAll),
  };
}

describe('NfzQueuesController', () => {
  let nfzQueuesController: NfzQueuesController;
  let nfzQueuesService: NfzQueuesService;
  let logger: LoggerService;
  let query: NfzQueuesQuery;

  beforeEach(async () => {
    logger = MockedLogger();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NfzQueuesController],
      providers: [NfzQueuesService],
    })
      .overrideProvider(NfzQueuesService)
      .useValue(MockedNfzQueuesService())
      .setLogger(logger)
      .compile();

    nfzQueuesController = app.get<NfzQueuesController>(NfzQueuesController);
    nfzQueuesService = app.get<NfzQueuesService>(NfzQueuesService);
  });

  it('controller should be defined', () => {
    expect(nfzQueuesController).toBeDefined();
  });

  it('service should be defined', () => {
    expect(nfzQueuesService).toBeDefined();
  });

  it('logger should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('startup should log that dependencies are initialized (testing detail)', () => {
    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenNthCalledWith(
      1,
      'RootTestModule dependencies initialized',
      'InstanceLoader',
    );
  });

  describe('findAll()', () => {
    beforeEach(() => {
      query = {
        case: 1,
        benefitForChildren: 'false',
        benefit: 'endokrynolog',
        province: 12,
        locality: 'gliwice',
      };
    });

    it('should call nfzQueuesService#findAll() with the query it got as argument', async () => {
      await nfzQueuesController.findAll(query);
      expect(nfzQueuesService.findAll).toHaveBeenCalledTimes(1);
      expect(nfzQueuesService.findAll).toHaveBeenCalledWith(query);
    });

    it('should return result of nfzQueuesService#findAll()', () => {
      expect(nfzQueuesController.findAll(query)).resolves.toBe(
        mockedValues.service.findAll,
      );
    });

    it('should log that it was called', async () => {
      await nfzQueuesController.findAll(query);

      expect(logger.log).toHaveBeenCalledTimes(2);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        'RootTestModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        '#findAll()',
        'NfzQueuesController',
      );
    });
  });
});
