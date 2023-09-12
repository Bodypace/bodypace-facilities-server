import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@nestjs/common';
import { NfzQueuesController } from './queues.controller';
import { NfzQueuesService } from './queues.service';

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
    findAll: jest.fn().mockReturnValue(mockedValues.service.findAll),
  };
}

describe('NfzQueuesController', () => {
  let nfzQueuesController: NfzQueuesController;
  let nfzQueuesService: NfzQueuesService;
  let logger: LoggerService;

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
    it('should call nfzQueuesService#findAll()', () => {
      nfzQueuesController.findAll();
      expect(nfzQueuesService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return result of nfzQueuesService#findAll()', () => {
      expect(nfzQueuesController.findAll()).toBe(mockedValues.service.findAll);
    });

    it('should log that it was called', () => {
      nfzQueuesController.findAll();

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
