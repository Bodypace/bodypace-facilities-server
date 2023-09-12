import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@nestjs/common';
import { NfzQueuesApiClientService } from './api-client.service';

function MockedLogger() {
  return {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

describe('NfzQueuesApiClientService ', () => {
  let nfzQueuesApiClientService: NfzQueuesApiClientService;
  let logger: LoggerService;

  beforeEach(async () => {
    logger = MockedLogger();
    const module: TestingModule = await Test.createTestingModule({
      providers: [NfzQueuesApiClientService],
    })
      .setLogger(logger)
      .compile();

    nfzQueuesApiClientService = module.get<NfzQueuesApiClientService>(
      NfzQueuesApiClientService,
    );
  });

  it('should be defined', () => {
    expect(nfzQueuesApiClientService).toBeDefined();
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

  describe('fetchAll()', () => {
    it('should return placeholder text', () => {
      expect(nfzQueuesApiClientService.fetchAll()).toBe(
        'fetch all queues to a given benefit provided by NFZ in Poland',
      );
    });

    it('should log that it was called', () => {
      nfzQueuesApiClientService.fetchAll();

      expect(logger.log).toHaveBeenCalledTimes(2);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        'RootTestModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        '#fetchAll()',
        'NfzQueuesApiClientService',
      );
    });
  });
});
