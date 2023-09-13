import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { INestApplication, LoggerService } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { mockedResponse as mockedResponseNo1 } from './mocks/httpService/mocked-response-1-false-endokryno-12-katowice-page-1';
import { mockedResponse as mockerResponseNo2Page1 } from './mocks/httpService/mocked-response-1-false-endo-06-page-1';
import { mockedResponse as mockerResponseNo2Page2 } from './mocks/httpService/mocked-response-1-false-endo-06-page-2';
import { mockedResponse as mockerResponseNo2Page3 } from './mocks/httpService/mocked-response-1-false-endo-06-page-3';
import { mockedResponse as mockerResponseNo2Page4 } from './mocks/httpService/mocked-response-1-false-endo-06-page-4';
import { mockedResponse as mockerResponseNo2Page5 } from './mocks/httpService/mocked-response-1-false-endo-06-page-5';
import { mockedResponse as mockerResponseNo2Page6 } from './mocks/httpService/mocked-response-1-false-endo-06-page-6';
import { MockedHttpService } from './mocks/httpService/http.service.mock';

function MockedLogger() {
  return {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

describe('NfzQueuesController (e2e)', () => {
  let app: INestApplication;
  let logger: LoggerService;
  let httpService: HttpService;
  let url: string;

  // TODO: network requests should be mocked in a different way
  // so that we can actually test the whole app
  // (e.g. request could be intercepted on the host and not leave the loopback network).

  beforeEach(async () => {
    logger = MockedLogger();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue(MockedHttpService())
      .setLogger(logger)
      .compile();

    app = moduleFixture.createNestApplication();
    httpService = app.get<HttpService>(HttpService);
    await app.init();
  });

  it('logger should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('httpService should be defined', () => {
    expect(httpService).toBeDefined();
  });

  it('startup should log that dependencies are initialized (testing detail)', () => {
    expect(logger.log).toHaveBeenCalledTimes(9);
    expect(logger.log).toHaveBeenNthCalledWith(
      1,
      'RootTestModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      2,
      'AppModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      3,
      'NfzModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      4,
      'HttpModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      5,
      'NfzQueuesApiClientModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      6,
      'NfzQueuesModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      7,
      'NfzQueuesController {/nfz}:',
      'RoutesResolver',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      8,
      'Mapped {/nfz/queues, GET} route',
      'RouterExplorer',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      9,
      'Nest application successfully started',
      'NestApplication',
    );
  });

  describe('/nfz/queues (GET)', () => {
    describe('case no. 1 (benefit = endokryno, province = 12, locality = KATOWICE)', () => {
      beforeEach(() => {
        url =
          '/nfz/queues?case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE';
      });

      it('should return statusCode 200 and correct response', () => {
        return request(app.getHttpServer())
          .get(url)
          .expect(200)
          .expect(mockedResponseNo1.response.data);
      });

      it('should log that request handler and queues fetcher (from NFZ api server) were called', async () => {
        await request(app.getHttpServer())
          .get(url)
          .expect(200)
          .expect(mockedResponseNo1.response.data);

        expect(logger.log).toHaveBeenCalledTimes(13);
        expect(logger.log).toHaveBeenNthCalledWith(
          1,
          'RootTestModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          2,
          'AppModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          3,
          'NfzModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          4,
          'HttpModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          5,
          'NfzQueuesApiClientModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          6,
          'NfzQueuesModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          7,
          'NfzQueuesController {/nfz}:',
          'RoutesResolver',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          8,
          'Mapped {/nfz/queues, GET} route',
          'RouterExplorer',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          9,
          'Nest application successfully started',
          'NestApplication',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          10,
          '#findAll()',
          'NfzQueuesController',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          11,
          '#fetchAll() query = {"case":"1","benefitForChildren":"false","benefit":"endokryno","province":"12","locality":"KATOWICE"}',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          12,
          '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          13,
          '#fetchAll() all queues = 14, pages = 1',
          'NfzQueuesApiClientService',
        );
      });
    });

    describe('case no. 2 (benefit = endo, province = 6)', () => {
      beforeEach(() => {
        url =
          '/nfz/queues?case=1&benefitForChildren=false&benefit=endo&province=6';
      });

      it('should return statusCode 200 and correct response', () => {
        return request(app.getHttpServer())
          .get(url)
          .expect(200)
          .expect([
            ...mockerResponseNo2Page1.response.data,
            ...mockerResponseNo2Page2.response.data,
            ...mockerResponseNo2Page3.response.data,
            ...mockerResponseNo2Page4.response.data,
            ...mockerResponseNo2Page5.response.data,
            ...mockerResponseNo2Page6.response.data,
          ]);
      });

      it('should log that request handler and queues fetcher (from NFZ api server) were called', async () => {
        await request(app.getHttpServer())
          .get(url)
          .expect(200)
          .expect([
            ...mockerResponseNo2Page1.response.data,
            ...mockerResponseNo2Page2.response.data,
            ...mockerResponseNo2Page3.response.data,
            ...mockerResponseNo2Page4.response.data,
            ...mockerResponseNo2Page5.response.data,
            ...mockerResponseNo2Page6.response.data,
          ]);

        expect(logger.log).toHaveBeenCalledTimes(18);
        expect(logger.log).toHaveBeenNthCalledWith(
          1,
          'RootTestModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          2,
          'AppModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          3,
          'NfzModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          4,
          'HttpModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          5,
          'NfzQueuesApiClientModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          6,
          'NfzQueuesModule dependencies initialized',
          'InstanceLoader',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          7,
          'NfzQueuesController {/nfz}:',
          'RoutesResolver',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          8,
          'Mapped {/nfz/queues, GET} route',
          'RouterExplorer',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          9,
          'Nest application successfully started',
          'NestApplication',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          10,
          '#findAll()',
          'NfzQueuesController',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          11,
          '#fetchAll() query = {"case":"1","benefitForChildren":"false","benefit":"endo","province":"6"}',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          12,
          '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endo&province=06',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          13,
          '#fetchAll() all queues = 142, pages = 6',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          14,
          '#fetchAll() network request no. 2, url = https://api.nfz.gov.pl/app-itl-api/queues?page=2&limit=25&format=json&case=1&province=06&benefit=endo',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          15,
          '#fetchAll() network request no. 3, url = https://api.nfz.gov.pl/app-itl-api/queues?page=3&limit=25&format=json&case=1&province=06&benefit=endo',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          16,
          '#fetchAll() network request no. 4, url = https://api.nfz.gov.pl/app-itl-api/queues?page=4&limit=25&format=json&case=1&province=06&benefit=endo',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          17,
          '#fetchAll() network request no. 5, url = https://api.nfz.gov.pl/app-itl-api/queues?page=5&limit=25&format=json&case=1&province=06&benefit=endo',
          'NfzQueuesApiClientService',
        );
        expect(logger.log).toHaveBeenNthCalledWith(
          18,
          '#fetchAll() network request no. 6, url = https://api.nfz.gov.pl/app-itl-api/queues?page=6&limit=25&format=json&case=1&province=06&benefit=endo',
          'NfzQueuesApiClientService',
        );
      });
    });
  });
});
