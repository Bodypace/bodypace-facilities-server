import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, LoggerService } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

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

  beforeEach(async () => {
    logger = MockedLogger();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .setLogger(logger)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('logger should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('startup should log that dependencies are initialized (testing detail)', () => {
    expect(logger.log).toHaveBeenCalledTimes(8);
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
      'NfzQueuesApiClientModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      5,
      'NfzQueuesModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      6,
      'NfzQueuesController {/nfz}:',
      'RoutesResolver',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      7,
      'Mapped {/nfz/queues, GET} route',
      'RouterExplorer',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      8,
      'Nest application successfully started',
      'NestApplication',
    );
  });

  describe('/nfz/queues (GET)', () => {
    it('should return statusCode 200 and correct response', () => {
      return request(app.getHttpServer())
        .get('/nfz/queues')
        .expect(200)
        .expect(
          'fetch all queues to a given benefit provided by NFZ in Poland',
        );
    });
    it('should log that request handler and queues fetcher (from NFZ api server) were called', async () => {
      await request(app.getHttpServer())
        .get('/nfz/queues')
        .expect(200)
        .expect(
          'fetch all queues to a given benefit provided by NFZ in Poland',
        );

      expect(logger.log).toHaveBeenCalledTimes(10);
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
        'NfzQueuesApiClientModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        5,
        'NfzQueuesModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        6,
        'NfzQueuesController {/nfz}:',
        'RoutesResolver',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        7,
        'Mapped {/nfz/queues, GET} route',
        'RouterExplorer',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        8,
        'Nest application successfully started',
        'NestApplication',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        9,
        '#findAll()',
        'NfzQueuesController',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        10,
        '#fetchAll() query = {"case":1,"benefitForChildren":"false","benefit":"endokrynolog"}',
        'NfzQueuesApiClientService',
      );
    });
  });
});
