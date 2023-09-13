import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@nestjs/common';
import { NfzQueuesApiClientService } from './api-client.service';
import { NfzQueuesApiQuery } from './interfaces/query.interface';

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
  let query: NfzQueuesApiQuery;

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
    describe('called with query that is valid', () => {
      beforeEach(() => {
        query = {
          case: 1,
          benefitForChildren: 'false',
          benefit: 'endokrynolog',
        };
      });

      it('should return placeholder text', () => {
        expect(nfzQueuesApiClientService.fetchAll(query)).toBe(
          'fetch all queues to a given benefit provided by NFZ in Poland',
        );
      });

      it('should log that it was called and include query argument in log', () => {
        nfzQueuesApiClientService.fetchAll(query);

        expect(logger.log).toHaveBeenCalledTimes(2);
        expect(logger.log).toHaveBeenNthCalledWith(
          1,
          'RootTestModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          2,
          `#fetchAll() query = ${JSON.stringify(query)}`,
          'NfzQueuesApiClientService',
        );
      });
    });

    describe('called with query that is invald - specifying locality but not province', () => {
      beforeEach(() => {
        query = {
          case: 1,
          benefitForChildren: 'false',
          benefit: 'endokrynolog',
          locality: 'KATOWICE',
        };
      });

      it('should throw an error which explains that province has to be specified when locality is specified', () => {
        expect(() => nfzQueuesApiClientService.fetchAll(query)).toThrow(
          'query passed to NfzQueuesApiClientService#fetchAll() must specify province when locality is specified.',
        );
      });

      it('should log that it was called and include query argument in log', () => {
        expect(() => nfzQueuesApiClientService.fetchAll(query)).toThrow();

        expect(logger.log).toHaveBeenCalledTimes(2);
        expect(logger.log).toHaveBeenNthCalledWith(
          1,
          'RootTestModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          2,
          `#fetchAll() query = ${JSON.stringify(query)}`,
          'NfzQueuesApiClientService',
        );
      });
    });

    describe('called with query that is invalid - province code is below range [1,16]', () => {
      beforeEach(() => {
        query = {
          case: 1,
          benefitForChildren: 'false',
          benefit: 'endokrynolog',
          locality: 'KATOWICE',
          province: 0,
        };
      });

      it('should throw an error which explains that province code cannot be greater than 16', () => {
        expect(() => nfzQueuesApiClientService.fetchAll(query)).toThrow(
          'query passed to NfzQueuesApiClientService#fetchAll() has province that is not in range [1, 16] (inclusive)',
        );
      });

      it('should log that it was called and include query argument in log', () => {
        expect(() => nfzQueuesApiClientService.fetchAll(query)).toThrow();

        expect(logger.log).toHaveBeenCalledTimes(2);
        expect(logger.log).toHaveBeenNthCalledWith(
          1,
          'RootTestModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          2,
          `#fetchAll() query = ${JSON.stringify(query)}`,
          'NfzQueuesApiClientService',
        );
      });
    });

    describe('called with query that is invalid - province code is above range [1,16]', () => {
      beforeEach(() => {
        query = {
          case: 1,
          benefitForChildren: 'false',
          benefit: 'endokrynolog',
          locality: 'KATOWICE',
          province: 17,
        };
      });

      it('should throw an error which explains that province code cannot be lesser than 1', () => {
        expect(() => nfzQueuesApiClientService.fetchAll(query)).toThrow(
          'query passed to NfzQueuesApiClientService#fetchAll() has province that is not in range [1, 16] (inclusive)',
        );
      });

      it('should log that it was called and include query argument in log', () => {
        expect(() => nfzQueuesApiClientService.fetchAll(query)).toThrow();

        expect(logger.log).toHaveBeenCalledTimes(2);
        expect(logger.log).toHaveBeenNthCalledWith(
          1,
          'RootTestModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          2,
          `#fetchAll() query = ${JSON.stringify(query)}`,
          'NfzQueuesApiClientService',
        );
      });
    });
  });
});
