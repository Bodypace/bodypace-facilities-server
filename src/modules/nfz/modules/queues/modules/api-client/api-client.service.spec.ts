import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { LoggerService } from '@nestjs/common';
import { NfzQueuesApiClientService } from './api-client.service';
import { NfzQueuesApiQuery } from './interfaces/query.interface';
import { MockedHttpService } from '../../../../../../../test/mocks/httpService/http.service.mock';

function MockedLogger() {
  return {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

describe('NfzQueuesApiClientService ', () => {
  let nfzQueuesApiClientService: NfzQueuesApiClientService;
  let httpService: HttpService;
  let logger: LoggerService;
  let query: NfzQueuesApiQuery;

  beforeEach(async () => {
    logger = MockedLogger();
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpService, NfzQueuesApiClientService],
    })
      .overrideProvider(HttpService)
      .useValue(MockedHttpService())
      .setLogger(logger)
      .compile();

    nfzQueuesApiClientService = module.get<NfzQueuesApiClientService>(
      NfzQueuesApiClientService,
    );
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(nfzQueuesApiClientService).toBeDefined();
  });

  it('httpService should be defined', () => {
    expect(httpService).toBeDefined();
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
    describe('called with query that is valid - no. 1', () => {
      beforeEach(() => {
        query = {
          case: 1,
          benefitForChildren: 'false',
          benefit: 'endokryno',
          province: 12,
          locality: 'KATOWICE',
        };
      });

      it('should call HttpService#axiosRef#get with correct url', async () => {
        await nfzQueuesApiClientService.fetchAll(query);

        expect(httpService.axiosRef.get).toHaveBeenCalledTimes(1);
        expect(httpService.axiosRef.get).toHaveBeenCalledWith(
          'https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE',
        );
      });

      it('should return correct list of queues', () => {
        expect(
          nfzQueuesApiClientService.fetchAll(query),
        ).resolves.toMatchSnapshot();
      });

      it('should log that it was called and include query argument in log', async () => {
        await nfzQueuesApiClientService.fetchAll(query);

        expect(logger.log).toHaveBeenCalledTimes(4);
        expect(logger.log).toHaveBeenNthCalledWith(
          1,
          'RootTestModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          2,
          '#fetchAll() query = {"case":1,"benefitForChildren":"false","benefit":"endokryno","province":12,"locality":"KATOWICE"}',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          3,
          '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          4,
          '#fetchAll() all queues = 14, pages = 1',
          'NfzQueuesApiClientService',
        );
      });
    });

    describe('called with query that is valid - no. 2', () => {
      beforeEach(() => {
        query = {
          case: 1,
          benefitForChildren: 'false',
          benefit: 'endo',
          province: 6,
        };
      });

      it('should call HttpService#axiosRef#get with correct url', async () => {
        await nfzQueuesApiClientService.fetchAll(query);

        // NOTE: yes, pagination links given by NFZ API do not mention `benefitForChildren` and `api-version` (which is as their docs say required in every request)
        // TODO: handle it (above NOTE)
        expect(httpService.axiosRef.get).toHaveBeenCalledTimes(6);
        expect(httpService.axiosRef.get).toHaveBeenNthCalledWith(
          1,
          'https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endo&province=06',
        );
        expect(httpService.axiosRef.get).toHaveBeenNthCalledWith(
          2,
          'https://api.nfz.gov.pl/app-itl-api/queues?page=2&limit=25&format=json&case=1&province=06&benefit=endo',
        );
        expect(httpService.axiosRef.get).toHaveBeenNthCalledWith(
          3,
          'https://api.nfz.gov.pl/app-itl-api/queues?page=3&limit=25&format=json&case=1&province=06&benefit=endo',
        );
        expect(httpService.axiosRef.get).toHaveBeenNthCalledWith(
          4,
          'https://api.nfz.gov.pl/app-itl-api/queues?page=4&limit=25&format=json&case=1&province=06&benefit=endo',
        );
        expect(httpService.axiosRef.get).toHaveBeenNthCalledWith(
          5,
          'https://api.nfz.gov.pl/app-itl-api/queues?page=5&limit=25&format=json&case=1&province=06&benefit=endo',
        );
        expect(httpService.axiosRef.get).toHaveBeenNthCalledWith(
          6,
          'https://api.nfz.gov.pl/app-itl-api/queues?page=6&limit=25&format=json&case=1&province=06&benefit=endo',
        );
      });

      it('should return correct list of queues', () => {
        expect(
          nfzQueuesApiClientService.fetchAll(query),
        ).resolves.toMatchSnapshot();
      });

      it('should log that it was called and include query argument in log', async () => {
        await nfzQueuesApiClientService.fetchAll(query);

        expect(logger.log).toHaveBeenCalledTimes(9);
        expect(logger.log).toHaveBeenNthCalledWith(
          1,
          'RootTestModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          2,
          '#fetchAll() query = {"case":1,"benefitForChildren":"false","benefit":"endo","province":6}',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          3,
          '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endo&province=06',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          4,
          '#fetchAll() all queues = 142, pages = 6',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          5,
          '#fetchAll() network request no. 2, url = https://api.nfz.gov.pl/app-itl-api/queues?page=2&limit=25&format=json&case=1&province=06&benefit=endo',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          6,
          '#fetchAll() network request no. 3, url = https://api.nfz.gov.pl/app-itl-api/queues?page=3&limit=25&format=json&case=1&province=06&benefit=endo',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          7,
          '#fetchAll() network request no. 4, url = https://api.nfz.gov.pl/app-itl-api/queues?page=4&limit=25&format=json&case=1&province=06&benefit=endo',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          8,
          '#fetchAll() network request no. 5, url = https://api.nfz.gov.pl/app-itl-api/queues?page=5&limit=25&format=json&case=1&province=06&benefit=endo',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          9,
          '#fetchAll() network request no. 6, url = https://api.nfz.gov.pl/app-itl-api/queues?page=6&limit=25&format=json&case=1&province=06&benefit=endo',
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

      it('should reject with error which explains that province has to be specified when locality is specified', () => {
        expect(nfzQueuesApiClientService.fetchAll(query)).rejects.toBe(
          'query passed to NfzQueuesApiClientService#fetchAll() must specify province when locality is specified.',
        );
      });

      it('should log that it was called and include query argument in log', () => {
        expect(nfzQueuesApiClientService.fetchAll(query)).rejects.toBe(
          'query passed to NfzQueuesApiClientService#fetchAll() must specify province when locality is specified.',
        );

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
        expect(nfzQueuesApiClientService.fetchAll(query)).rejects.toBe(
          'query passed to NfzQueuesApiClientService#fetchAll() has province that is not in range [1, 16] (inclusive)',
        );
      });

      it('should log that it was called and include query argument in log', () => {
        expect(nfzQueuesApiClientService.fetchAll(query)).rejects.toBe(
          'query passed to NfzQueuesApiClientService#fetchAll() has province that is not in range [1, 16] (inclusive)',
        );

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
        expect(nfzQueuesApiClientService.fetchAll(query)).rejects.toBe(
          'query passed to NfzQueuesApiClientService#fetchAll() has province that is not in range [1, 16] (inclusive)',
        );
      });

      it('should log that it was called and include query argument in log', () => {
        expect(nfzQueuesApiClientService.fetchAll(query)).rejects.toBe(
          'query passed to NfzQueuesApiClientService#fetchAll() has province that is not in range [1, 16] (inclusive)',
        );

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

    describe('called with query that is invalid - case that is neither 1 nor 2', () => {
      beforeEach(() => {
        query = {
          case: 3,
          benefitForChildren: 'false',
          benefit: 'endokrynolog',
          locality: 'KATOWICE',
          province: 6,
        };
      });

      it('should throw an error which explains that case has to be either 1 or 2', () => {
        expect(nfzQueuesApiClientService.fetchAll(query)).rejects.toBe(
          'query passed to NfzQueuesApiClientService#fetchAll() has case that is neither 1 nor 2',
        );
        expect(
          nfzQueuesApiClientService.fetchAll({ ...query, case: 0 }),
        ).rejects.toBe(
          'query passed to NfzQueuesApiClientService#fetchAll() has case that is neither 1 nor 2',
        );
        expect(
          nfzQueuesApiClientService.fetchAll({ ...query, case: -1 }),
        ).rejects.toBe(
          'query passed to NfzQueuesApiClientService#fetchAll() has case that is neither 1 nor 2',
        );
      });

      it('should log that it was called and include query argument in log', () => {
        expect(nfzQueuesApiClientService.fetchAll(query)).rejects.toBe(
          'query passed to NfzQueuesApiClientService#fetchAll() has case that is neither 1 nor 2',
        );

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
