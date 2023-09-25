import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { INestApplication, LoggerService } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { req_1_page_1 } from './mocks/httpService/responses/req_1/response-page-1';
import { req_2_page_1 } from './mocks/httpService/responses/req_2/response-page-1';
import { req_2_page_2 } from './mocks/httpService/responses/req_2/response-page-2';
import { req_2_page_3 } from './mocks/httpService/responses/req_2/response-page-3';
import { req_2_page_4 } from './mocks/httpService/responses/req_2/response-page-4';
import { req_2_page_5 } from './mocks/httpService/responses/req_2/response-page-5';
import { req_2_page_6 } from './mocks/httpService/responses/req_2/response-page-6';
import { MockedHttpService } from './mocks/httpService/http.service.mock';
import { unlink, copyFile, constants } from 'node:fs/promises';
import { expectToHaveBeenCalledWith } from './utils/expect-logs-to-equal.util';

function MockedLogger() {
  const aggregator = jest.fn();
  return {
    aggregator: aggregator,
    log: jest.fn().mockImplementation((...args) => aggregator('log', ...args)),
    warn: jest
      .fn()
      .mockImplementation((...args) => aggregator('warn', ...args)),
    error: jest
      .fn()
      .mockImplementation((...args) => aggregator('error', ...args)),
  };
}

interface TestableLoggerService extends LoggerService {
  aggregator: (...args: any[]) => undefined;
}

describe('NfzQueuesController (e2e)', () => {
  let app: INestApplication;
  let logger: TestableLoggerService;
  let httpService: HttpService;
  let dataSource: DataSource;
  let url: string;
  let url_1: string;
  let url_2: string;

  const logInfo = {
    startupLogLength: 14,
    startupLog: [
      ['RootTestModule dependencies initialized', 'InstanceLoader'],
      ['AppModule dependencies initialized', 'InstanceLoader'],
      ['TypeOrmModule dependencies initialized', 'InstanceLoader'],
      ['GeocoderModule dependencies initialized', 'InstanceLoader'],
      ['NfzModule dependencies initialized', 'InstanceLoader'],
      ['HttpModule dependencies initialized', 'InstanceLoader'],
      ['NfzQueuesApiClientModule dependencies initialized', 'InstanceLoader'],
      ['TypeOrmCoreModule dependencies initialized', 'InstanceLoader'],
      ['TypeOrmModule dependencies initialized', 'InstanceLoader'],
      ['NfzQueuesCacheModule dependencies initialized', 'InstanceLoader'],
      ['NfzQueuesModule dependencies initialized', 'InstanceLoader'],
      ['NfzQueuesController {/nfz}:', 'RoutesResolver'],
      ['Mapped {/nfz/queues, GET} route', 'RouterExplorer'],
      ['Nest application successfully started', 'NestApplication'],
    ],
  };

  // TODO: network requests should be mocked in a different way
  // so that we can actually test the whole app
  // (e.g. request could be intercepted on the host and not leave the loopback network).

  beforeEach(async () => {
    await unlink('database.sqlite');
    await copyFile(
      'e2e-database.sqlite',
      'database.sqlite',
      constants.COPYFILE_EXCL,
    );

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
    dataSource = app.get<DataSource>(DataSource);
    await app.init();
  });

  it('logger should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('httpService should be defined', () => {
    expect(httpService).toBeDefined();
  });

  it('dataSource should be defined', () => {
    expect(dataSource).toBeDefined();
  });

  it('startup should log that dependencies are initialized (testing detail)', () => {
    expect(logger.log).toHaveBeenCalledTimes(logInfo.startupLogLength);
    expectToHaveBeenCalledWith(logger.log, 1, logInfo.startupLogLength, [
      ...logInfo.startupLog,
    ]);
  });

  describe('/nfz/queues (GET)', () => {
    describe('with query that is valid - case no. 1 (benefit = endokryno, province = 12, locality = KATOWICE)', () => {
      beforeEach(() => {
        url =
          '/nfz/queues?case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE';
      });

      it('should return statusCode 200 and correct response', () => {
        return request(app.getHttpServer())
          .get(url)
          .expect(200)
          .expect(req_1_page_1.data);
      });

      it('should log that request handler and queues fetcher (from NFZ api server) were called', async () => {
        await request(app.getHttpServer())
          .get(url)
          .expect(200)
          .expect(req_1_page_1.data);

        expect(logger.log).toHaveBeenCalledTimes(logInfo.startupLogLength + 5);
        expectToHaveBeenCalledWith(
          logger.log,
          1,
          logInfo.startupLogLength + 5,
          [
            ...logInfo.startupLog,
            ['#findAll()', 'NfzQueuesController'],
            ['#findAll() - cache miss', 'NfzQueuesService'],
            [
              '#fetchAll() query = {"case":1,"benefitForChildren":"false","benefit":"endokryno","province":"12","locality":"KATOWICE"}',
              'NfzQueuesApiClientService',
            ],
            [
              '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE',
              'NfzQueuesApiClientService',
            ],
            [
              '#fetchAll() all queues = 14, pages = 1',
              'NfzQueuesApiClientService',
            ],
          ],
        );
      });
    });

    describe('with query that is valid - case no. 1 (changed: benefitForChildren = "FalSe")', () => {
      beforeEach(() => {
        url =
          '/nfz/queues?case=1&benefitForChildren=FalSe&benefit=endokryno&province=12&locality=KATOWICE';
      });

      it('should return statusCode 200 and correct response', () => {
        return request(app.getHttpServer())
          .get(url)
          .expect(200)
          .expect(req_1_page_1.data);
      });

      it('should log that request handler and queues fetcher (from NFZ api server) were called', async () => {
        await request(app.getHttpServer())
          .get(url)
          .expect(200)
          .expect(req_1_page_1.data);

        expect(logger.log).toHaveBeenCalledTimes(logInfo.startupLogLength + 5);
        expectToHaveBeenCalledWith(
          logger.log,
          1,
          logInfo.startupLogLength + 5,
          [
            ...logInfo.startupLog,
            ['#findAll()', 'NfzQueuesController'],
            ['#findAll() - cache miss', 'NfzQueuesService'],
            [
              '#fetchAll() query = {"case":1,"benefitForChildren":"false","benefit":"endokryno","province":"12","locality":"KATOWICE"}',
              'NfzQueuesApiClientService',
            ],
            [
              '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE',
              'NfzQueuesApiClientService',
            ],
            [
              '#fetchAll() all queues = 14, pages = 1',
              'NfzQueuesApiClientService',
            ],
          ],
        );
      });
    });

    describe('with query that is valid - case no. 2 (benefit = endo, province = 6)', () => {
      beforeEach(() => {
        url =
          '/nfz/queues?case=1&benefitForChildren=false&benefit=endo&province=6';
      });

      it('should return statusCode 200 and correct response', () => {
        return request(app.getHttpServer())
          .get(url)
          .expect(200)
          .expect([
            ...req_2_page_1.data,
            ...req_2_page_2.data,
            ...req_2_page_3.data,
            ...req_2_page_4.data,
            ...req_2_page_5.data,
            ...req_2_page_6.data,
          ]);
      });

      it('should log that request handler and queues fetcher (from NFZ api server) were called', async () => {
        await request(app.getHttpServer())
          .get(url)
          .expect(200)
          .expect([
            ...req_2_page_1.data,
            ...req_2_page_2.data,
            ...req_2_page_3.data,
            ...req_2_page_4.data,
            ...req_2_page_5.data,
            ...req_2_page_6.data,
          ]);

        expect(logger.log).toHaveBeenCalledTimes(logInfo.startupLogLength + 10);
        expectToHaveBeenCalledWith(
          logger.log,
          1,
          logInfo.startupLogLength + 10,
          [
            ...logInfo.startupLog,
            ['#findAll()', 'NfzQueuesController'],
            ['#findAll() - cache miss', 'NfzQueuesService'],
            [
              '#fetchAll() query = {"case":1,"benefitForChildren":"false","benefit":"endo","province":"6"}',
              'NfzQueuesApiClientService',
            ],
            [
              '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endo&province=06',
              'NfzQueuesApiClientService',
            ],
            [
              '#fetchAll() all queues = 142, pages = 6',
              'NfzQueuesApiClientService',
            ],
            [
              '#fetchAll() network request no. 2, url = https://api.nfz.gov.pl/app-itl-api/queues?page=2&limit=25&format=json&case=1&province=06&benefit=endo',
              'NfzQueuesApiClientService',
            ],
            [
              '#fetchAll() network request no. 3, url = https://api.nfz.gov.pl/app-itl-api/queues?page=3&limit=25&format=json&case=1&province=06&benefit=endo',
              'NfzQueuesApiClientService',
            ],
            [
              '#fetchAll() network request no. 4, url = https://api.nfz.gov.pl/app-itl-api/queues?page=4&limit=25&format=json&case=1&province=06&benefit=endo',
              'NfzQueuesApiClientService',
            ],
            [
              '#fetchAll() network request no. 5, url = https://api.nfz.gov.pl/app-itl-api/queues?page=5&limit=25&format=json&case=1&province=06&benefit=endo',
              'NfzQueuesApiClientService',
            ],
            [
              '#fetchAll() network request no. 6, url = https://api.nfz.gov.pl/app-itl-api/queues?page=6&limit=25&format=json&case=1&province=06&benefit=endo',
              'NfzQueuesApiClientService',
            ],
          ],
        );
      });
    });

    describe('with query that is invalid - case is neither 1 nor 2', () => {
      beforeEach(() => {
        url =
          '/nfz/queues?case=3&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE';
      });

      it('should return statusCode 400 and response which explains that case is invalid', () => {
        return request(app.getHttpServer())
          .get(url)
          .expect(400)
          .expect({
            message: ['case must be one of the following values: 1, 2'],
            error: 'Bad Request',
            statusCode: 400,
          });
      });

      it('should not log that request handler was called', async () => {
        // NOTE: this behaviour is probably not correct, as it could be useful to log
        // that request was received with incorrect query. Maybe add it in the future.

        await request(app.getHttpServer())
          .get(url)
          .expect(400)
          .expect({
            message: ['case must be one of the following values: 1, 2'],
            error: 'Bad Request',
            statusCode: 400,
          });

        expect(logger.log).toHaveBeenCalledTimes(logInfo.startupLogLength);
        expectToHaveBeenCalledWith(logger.log, 1, logInfo.startupLogLength, [
          ...logInfo.startupLog,
        ]);
      });
    });

    describe('with query that is invalid - benefitForChildren is neither "true" nor "false"', () => {
      beforeEach(() => {
        url =
          '/nfz/queues?case=1&benefitForChildren=FalSee&benefit=endokryno&province=12&locality=KATOWICE';
      });

      it('should return statusCode 400 and response which explains that benefitForChildren is invalid', () => {
        return request(app.getHttpServer())
          .get(url)
          .expect(400)
          .expect({
            message: [
              'benefitForChildren must be one of the following values: true, false',
            ],
            error: 'Bad Request',
            statusCode: 400,
          });
      });

      it('should not log that request handler was called', async () => {
        // NOTE: this behaviour is probably not correct, as it could be useful to log
        // that request was received with incorrect query. Maybe add it in the future.

        await request(app.getHttpServer())
          .get(url)
          .expect(400)
          .expect({
            message: [
              'benefitForChildren must be one of the following values: true, false',
            ],
            error: 'Bad Request',
            statusCode: 400,
          });

        expect(logger.log).toHaveBeenCalledTimes(logInfo.startupLogLength);
        expectToHaveBeenCalledWith(logger.log, 1, logInfo.startupLogLength, [
          ...logInfo.startupLog,
        ]);
      });
    });

    describe('with two requests - both times query is valid and the same', () => {
      beforeEach(() => {
        url =
          '/nfz/queues?case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE';
      });

      describe('with database accessible for the whole time', () => {
        it('should return statusCode 200 and correct response two times', async () => {
          await request(app.getHttpServer())
            .get(url)
            .expect(200)
            .expect(req_1_page_1.data);

          await request(app.getHttpServer())
            .get(url)
            .expect(200)
            .expect(req_1_page_1.data);
        });

        it('should first log one cache miss and data fetchinng, and then one cache hit and no data fetching', async () => {
          await request(app.getHttpServer())
            .get(url)
            .expect(200)
            .expect(req_1_page_1.data);

          await request(app.getHttpServer())
            .get(url)
            .expect(200)
            .expect(req_1_page_1.data);

          expect(logger.log).toHaveBeenCalledTimes(
            logInfo.startupLogLength + 7,
          );
          expectToHaveBeenCalledWith(
            logger.log,
            1,
            logInfo.startupLogLength + 7,
            [
              ...logInfo.startupLog,
              ['#findAll()', 'NfzQueuesController'],
              ['#findAll() - cache miss', 'NfzQueuesService'],
              [
                '#fetchAll() query = {"case":1,"benefitForChildren":"false","benefit":"endokryno","province":"12","locality":"KATOWICE"}',
                'NfzQueuesApiClientService',
              ],
              [
                '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE',
                'NfzQueuesApiClientService',
              ],
              [
                '#fetchAll() all queues = 14, pages = 1',
                'NfzQueuesApiClientService',
              ],
              ['#findAll()', 'NfzQueuesController'],
              ['#findAll() - cache hit', 'NfzQueuesService'],
            ],
          );
        });
      });

      describe('with database not accessible while performing second request', () => {
        it('should return statusCode 200 and correct response two times', async () => {
          await request(app.getHttpServer())
            .get(url)
            .expect(200)
            .expect(req_1_page_1.data);

          await dataSource.destroy();

          await request(app.getHttpServer())
            .get(url)
            .expect(200)
            .expect(req_1_page_1.data);
        });

        it('should first log one cache miss and data fetchinng, and then again cache miss with data fetching, and warnings about database read and write failures', async () => {
          await request(app.getHttpServer())
            .get(url)
            .expect(200)
            .expect(req_1_page_1.data);

          await dataSource.destroy();

          await request(app.getHttpServer())
            .get(url)
            .expect(200)
            .expect(req_1_page_1.data);

          expect(logger.aggregator).toHaveBeenCalledTimes(
            logInfo.startupLogLength + 12,
          );
          expectToHaveBeenCalledWith(
            logger.aggregator,
            1,
            logInfo.startupLogLength + 12,
            [
              ...logInfo.startupLog.map(([a, b]) => ['log', a, b]),
              ['log', '#findAll()', 'NfzQueuesController'],
              ['log', '#findAll() - cache miss', 'NfzQueuesService'],
              [
                'log',
                '#fetchAll() query = {"case":1,"benefitForChildren":"false","benefit":"endokryno","province":"12","locality":"KATOWICE"}',
                'NfzQueuesApiClientService',
              ],
              [
                'log',
                '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE',
                'NfzQueuesApiClientService',
              ],
              [
                'log',
                '#fetchAll() all queues = 14, pages = 1',
                'NfzQueuesApiClientService',
              ],
              ['log', '#findAll()', 'NfzQueuesController'],
              [
                'warn',
                'could not read data from database: Connection with sqlite database is not established. Check connection configuration.',
                'NfzQueuesCacheService',
              ],
              ['log', '#findAll() - cache miss', 'NfzQueuesService'],
              [
                'log',
                '#fetchAll() query = {"case":1,"benefitForChildren":"false","benefit":"endokryno","province":"12","locality":"KATOWICE"}',
                'NfzQueuesApiClientService',
              ],
              [
                'log',
                '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE',
                'NfzQueuesApiClientService',
              ],
              [
                'log',
                '#fetchAll() all queues = 14, pages = 1',
                'NfzQueuesApiClientService',
              ],
              [
                'warn',
                'could not create a transaction for database: Connection with sqlite database is not established. Check connection configuration.',
                'NfzQueuesCacheService',
              ],
            ],
          );
        });
      });
    });

    describe('with two requests - both times query is valid but different', () => {
      beforeEach(() => {
        url_1 =
          '/nfz/queues?case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE';
        url_2 =
          '/nfz/queues?case=1&benefitForChildren=false&benefit=endo&province=6';
      });

      describe('with database accessible for the whole time', () => {
        it('should return statusCode 200 and correct response two times', async () => {
          await request(app.getHttpServer())
            .get(url_1)
            .expect(200)
            .expect(req_1_page_1.data);

          await request(app.getHttpServer())
            .get(url_2)
            .expect(200)
            .expect([
              ...req_2_page_1.data,
              ...req_2_page_2.data,
              ...req_2_page_3.data,
              ...req_2_page_4.data,
              ...req_2_page_5.data,
              ...req_2_page_6.data,
            ]);
        });

        it('should first log one cache miss and data fetchinng, and then again cache miss data fetching', async () => {
          await request(app.getHttpServer())
            .get(url_1)
            .expect(200)
            .expect(req_1_page_1.data);

          await request(app.getHttpServer())
            .get(url_2)
            .expect(200)
            .expect([
              ...req_2_page_1.data,
              ...req_2_page_2.data,
              ...req_2_page_3.data,
              ...req_2_page_4.data,
              ...req_2_page_5.data,
              ...req_2_page_6.data,
            ]);

          expect(logger.log).toHaveBeenCalledTimes(
            logInfo.startupLogLength + 15,
          );
          expectToHaveBeenCalledWith(
            logger.log,
            1,
            logInfo.startupLogLength + 15,
            [
              ...logInfo.startupLog,
              ['#findAll()', 'NfzQueuesController'],
              ['#findAll() - cache miss', 'NfzQueuesService'],
              [
                '#fetchAll() query = {"case":1,"benefitForChildren":"false","benefit":"endokryno","province":"12","locality":"KATOWICE"}',
                'NfzQueuesApiClientService',
              ],
              [
                '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE',
                'NfzQueuesApiClientService',
              ],
              [
                '#fetchAll() all queues = 14, pages = 1',
                'NfzQueuesApiClientService',
              ],
              ['#findAll()', 'NfzQueuesController'],
              ['#findAll() - cache miss', 'NfzQueuesService'],
              [
                '#fetchAll() query = {"case":1,"benefitForChildren":"false","benefit":"endo","province":"6"}',
                'NfzQueuesApiClientService',
              ],
              [
                '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endo&province=06',
                'NfzQueuesApiClientService',
              ],
              [
                '#fetchAll() all queues = 142, pages = 6',
                'NfzQueuesApiClientService',
              ],
              [
                '#fetchAll() network request no. 2, url = https://api.nfz.gov.pl/app-itl-api/queues?page=2&limit=25&format=json&case=1&province=06&benefit=endo',
                'NfzQueuesApiClientService',
              ],
              [
                '#fetchAll() network request no. 3, url = https://api.nfz.gov.pl/app-itl-api/queues?page=3&limit=25&format=json&case=1&province=06&benefit=endo',
                'NfzQueuesApiClientService',
              ],
              [
                '#fetchAll() network request no. 4, url = https://api.nfz.gov.pl/app-itl-api/queues?page=4&limit=25&format=json&case=1&province=06&benefit=endo',
                'NfzQueuesApiClientService',
              ],
              [
                '#fetchAll() network request no. 5, url = https://api.nfz.gov.pl/app-itl-api/queues?page=5&limit=25&format=json&case=1&province=06&benefit=endo',
                'NfzQueuesApiClientService',
              ],
              [
                '#fetchAll() network request no. 6, url = https://api.nfz.gov.pl/app-itl-api/queues?page=6&limit=25&format=json&case=1&province=06&benefit=endo',
                'NfzQueuesApiClientService',
              ],
            ],
          );
        });
      });

      describe('with database not accessible while performing second request', () => {
        it('should return statusCode 200 and correct response two times', async () => {
          await request(app.getHttpServer())
            .get(url_1)
            .expect(200)
            .expect(req_1_page_1.data);

          await dataSource.destroy();

          await request(app.getHttpServer())
            .get(url_2)
            .expect(200)
            .expect([
              ...req_2_page_1.data,
              ...req_2_page_2.data,
              ...req_2_page_3.data,
              ...req_2_page_4.data,
              ...req_2_page_5.data,
              ...req_2_page_6.data,
            ]);
        });

        it('should first log one cache miss and data fetchinng, and then again cache miss with data fetching and warnings about database read and write failures', async () => {
          await request(app.getHttpServer())
            .get(url_1)
            .expect(200)
            .expect(req_1_page_1.data);

          await dataSource.destroy();

          await request(app.getHttpServer())
            .get(url_2)
            .expect(200)
            .expect([
              ...req_2_page_1.data,
              ...req_2_page_2.data,
              ...req_2_page_3.data,
              ...req_2_page_4.data,
              ...req_2_page_5.data,
              ...req_2_page_6.data,
            ]);

          expect(logger.aggregator).toHaveBeenCalledTimes(
            logInfo.startupLogLength + 17,
          );
          expectToHaveBeenCalledWith(
            logger.aggregator,
            1,
            logInfo.startupLogLength + 17,
            [
              ...logInfo.startupLog.map(([a, b]) => ['log', a, b]),
              ['log', '#findAll()', 'NfzQueuesController'],
              ['log', '#findAll() - cache miss', 'NfzQueuesService'],
              [
                'log',
                '#fetchAll() query = {"case":1,"benefitForChildren":"false","benefit":"endokryno","province":"12","locality":"KATOWICE"}',
                'NfzQueuesApiClientService',
              ],
              [
                'log',
                '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE',
                'NfzQueuesApiClientService',
              ],
              [
                'log',
                '#fetchAll() all queues = 14, pages = 1',
                'NfzQueuesApiClientService',
              ],
              ['log', '#findAll()', 'NfzQueuesController'],
              [
                'warn',
                'could not read data from database: Connection with sqlite database is not established. Check connection configuration.',
                'NfzQueuesCacheService',
              ],
              ['log', '#findAll() - cache miss', 'NfzQueuesService'],
              [
                'log',
                '#fetchAll() query = {"case":1,"benefitForChildren":"false","benefit":"endo","province":"6"}',
                'NfzQueuesApiClientService',
              ],
              [
                'log',
                '#fetchAll() network request no. 1, url = https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endo&province=06',
                'NfzQueuesApiClientService',
              ],
              [
                'log',
                '#fetchAll() all queues = 142, pages = 6',
                'NfzQueuesApiClientService',
              ],
              [
                'log',
                '#fetchAll() network request no. 2, url = https://api.nfz.gov.pl/app-itl-api/queues?page=2&limit=25&format=json&case=1&province=06&benefit=endo',
                'NfzQueuesApiClientService',
              ],
              [
                'log',
                '#fetchAll() network request no. 3, url = https://api.nfz.gov.pl/app-itl-api/queues?page=3&limit=25&format=json&case=1&province=06&benefit=endo',
                'NfzQueuesApiClientService',
              ],
              [
                'log',
                '#fetchAll() network request no. 4, url = https://api.nfz.gov.pl/app-itl-api/queues?page=4&limit=25&format=json&case=1&province=06&benefit=endo',
                'NfzQueuesApiClientService',
              ],
              [
                'log',
                '#fetchAll() network request no. 5, url = https://api.nfz.gov.pl/app-itl-api/queues?page=5&limit=25&format=json&case=1&province=06&benefit=endo',
                'NfzQueuesApiClientService',
              ],
              [
                'log',
                '#fetchAll() network request no. 6, url = https://api.nfz.gov.pl/app-itl-api/queues?page=6&limit=25&format=json&case=1&province=06&benefit=endo',
                'NfzQueuesApiClientService',
              ],
              [
                'warn',
                'could not create a transaction for database: Connection with sqlite database is not established. Check connection configuration.',
                'NfzQueuesCacheService',
              ],
            ],
          );
        });
      });
    });
  });
});
