import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfzQueuesService } from './queues.service';
import { NfzQueuesApiClientModule } from './modules/api-client/api-client.module';
import { NfzQueuesApiClientService } from './modules/api-client/api-client.service';
import { NfzQueuesCacheModule } from './modules/cache/cache.module';
import { NfzQueuesCacheService } from './modules/cache/cache.service';
import { NfzQueuesApiQuery } from './modules/api-client/interfaces/query.interface';
import { req_1_page_1 } from '../../../../../test/mocks/httpService/responses/req_1/response-page-1';
import { DataSource } from 'typeorm';
import { unlink } from 'node:fs/promises';

function MockedLogger() {
  return {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

const mockedValues = {
  api: {
    fetchAll: req_1_page_1.data,
  },
};

function MockedNfzQueuesApiClientService() {
  return {
    fetchAll: jest.fn().mockResolvedValue(mockedValues.api.fetchAll),
  };
}

describe('NfzQueuesService', () => {
  const databaseName = 'test-nfz-queues-service-database.sqlite';
  let nfzQueuesService: NfzQueuesService;
  let nfzQueuesApiClientService: NfzQueuesApiClientService;
  let nfzQueuesCacheService: NfzQueuesCacheService;
  let dataSource: DataSource;
  let logger: LoggerService;
  let query: NfzQueuesApiQuery;

  beforeEach(async () => {
    logger = MockedLogger();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: databaseName,
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        NfzQueuesApiClientModule,
        NfzQueuesCacheModule,
      ],
      providers: [NfzQueuesService],
    })
      .overrideProvider(NfzQueuesApiClientService)
      .useValue(MockedNfzQueuesApiClientService())
      .setLogger(logger)
      .compile();

    nfzQueuesService = module.get<NfzQueuesService>(NfzQueuesService);
    nfzQueuesApiClientService = module.get<NfzQueuesApiClientService>(
      NfzQueuesApiClientService,
    );
    nfzQueuesCacheService = module.get<NfzQueuesCacheService>(
      NfzQueuesCacheService,
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await dataSource.destroy();
    await unlink(databaseName);
  });

  it('service should be defined', () => {
    expect(nfzQueuesService).toBeDefined();
  });

  it('nfzQueuesApiClientService should be defined', () => {
    expect(nfzQueuesApiClientService).toBeDefined();
  });

  it('nfzQueuesCacheService is defined', () => {
    expect(nfzQueuesCacheService).toBeDefined();
  });

  it('dataSource should be defined', () => {
    expect(dataSource).toBeDefined();
  });

  it('logger should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('startup should log that dependencies are initialized (testing detail)', () => {
    expect(logger.log).toHaveBeenCalledTimes(7);
    expect(logger.log).toHaveBeenNthCalledWith(
      1,
      'TypeOrmModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      2,
      'NfzQueuesApiClientModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      3,
      'HttpModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      4,
      'TypeOrmCoreModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      5,
      'TypeOrmModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      6,
      'NfzQueuesCacheModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      7,
      'RootTestModule dependencies initialized',
      'InstanceLoader',
    );
  });

  describe('findAll()', () => {
    beforeEach(() => {
      query = {
        case: 1,
        benefitForChildren: 'FALSE',
        benefit: 'ENDOKRYNO',
        province: 12,
        locality: 'KATOWICE',
      };
    });

    it('should call NfzQueuesApiClientService#fetchAll() with the same query it got as argument', async () => {
      await nfzQueuesService.findAll(query);
      expect(nfzQueuesApiClientService.fetchAll).toHaveBeenCalledTimes(1);
      expect(nfzQueuesApiClientService.fetchAll).toHaveBeenCalledWith(query);
    });

    it('should return result of NfzQueuesApiClientService#fetchAll()', async () => {
      await expect(nfzQueuesService.findAll(query)).resolves.toBe(
        mockedValues.api.fetchAll,
      );
    });

    it('should cache value to avoid calling NfzQueuesApiClientService#fetchAll() twice with same query', async () => {
      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAll,
      );
      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAll,
      );
      expect(nfzQueuesApiClientService.fetchAll).toHaveBeenCalledTimes(1);
      expect(nfzQueuesApiClientService.fetchAll).toHaveBeenCalledWith(query);
    });

    it('should log cache miss on first call with a given query', async () => {
      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAll,
      );
      // 1
      expect(logger.log).toHaveBeenCalledTimes(7 + 1);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        'TypeOrmModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        'NfzQueuesApiClientModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        3,
        'HttpModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        4,
        'TypeOrmCoreModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        5,
        'TypeOrmModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        6,
        'NfzQueuesCacheModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        7,
        'RootTestModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        8,
        '#findAll() - cache miss',
        'NfzQueuesService',
      );
    });

    it('should log one cache miss and one cache hit on two calls with the same query', async () => {
      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAll,
      );
      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAll,
      );
      expect(logger.log).toHaveBeenCalledTimes(7 + 2);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        'TypeOrmModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        'NfzQueuesApiClientModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        3,
        'HttpModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        4,
        'TypeOrmCoreModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        5,
        'TypeOrmModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        6,
        'NfzQueuesCacheModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        7,
        'RootTestModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        8,
        '#findAll() - cache miss',
        'NfzQueuesService',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        9,
        '#findAll() - cache hit',
        'NfzQueuesService',
      );
    });

    it('should log cache miss two times on two calls, second call with different query', async () => {
      expect(query.case).not.toBe(2);

      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAll,
      );
      await expect(
        nfzQueuesService.findAll({ ...query, case: 2 }),
      ).resolves.toStrictEqual(mockedValues.api.fetchAll);

      expect(logger.log).toHaveBeenCalledTimes(7 + 2);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        'TypeOrmModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        'NfzQueuesApiClientModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        3,
        'HttpModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        4,
        'TypeOrmCoreModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        5,
        'TypeOrmModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        6,
        'NfzQueuesCacheModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        7,
        'RootTestModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        8,
        '#findAll() - cache miss',
        'NfzQueuesService',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        9,
        '#findAll() - cache miss',
        'NfzQueuesService',
      );
    });

    it('should not order cache to write the same query and queues twice', async () => {
      const getMethod = jest.spyOn(nfzQueuesCacheService, 'get');
      const storeMethod = jest.spyOn(nfzQueuesCacheService, 'store');

      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAll,
      );
      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAll,
      );

      expect(getMethod).toHaveBeenCalledTimes(2);
      expect(getMethod).toHaveBeenNthCalledWith(1, query);
      expect(getMethod).toHaveBeenNthCalledWith(2, query);

      expect(storeMethod).toHaveBeenCalledTimes(1);
      expect(storeMethod).toHaveBeenNthCalledWith(
        1,
        query,
        mockedValues.api.fetchAll,
      );
    });

    it.each([
      ['benefitForChildren is same but lowercase', 'benefitForChildren'],
      ['benefit is same but lowercase', 'benefit'],
      ['locality is same but lowercase', 'locality'],
    ])(
      'should not order cache to write the same query and queues twice - %s',
      async (
        _,
        fieldToLowerCase: 'benefitForChildren' | 'benefit' | 'locality',
      ) => {
        const getMethod = jest.spyOn(nfzQueuesCacheService, 'get');
        const storeMethod = jest.spyOn(nfzQueuesCacheService, 'store');

        expect(query[fieldToLowerCase]).toBeTruthy();
        expect(query[fieldToLowerCase]?.toLowerCase()).not.toEqual(
          query[fieldToLowerCase],
        );

        await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
          mockedValues.api.fetchAll,
        );
        await expect(
          nfzQueuesService.findAll({
            ...query,
            [fieldToLowerCase]: query[fieldToLowerCase]?.toLowerCase(),
          }),
        ).resolves.toStrictEqual(mockedValues.api.fetchAll);

        expect(getMethod).toHaveBeenCalledTimes(2);
        expect(getMethod).toHaveBeenNthCalledWith(1, query);
        expect(getMethod).toHaveBeenNthCalledWith(2, {
          ...query,
          [fieldToLowerCase]: query[fieldToLowerCase]?.toLowerCase(),
        });

        expect(storeMethod).toHaveBeenCalledTimes(1);
        expect(storeMethod).toHaveBeenNthCalledWith(
          1,
          query,
          mockedValues.api.fetchAll,
        );
      },
    );

    it('should order cache to write same queues second time when query is different - case is different', async () => {
      const getMethod = jest.spyOn(nfzQueuesCacheService, 'get');
      const storeMethod = jest.spyOn(nfzQueuesCacheService, 'store');

      expect(query.case).not.toBe(2);

      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAll,
      );
      await expect(
        nfzQueuesService.findAll({ ...query, case: 2 }),
      ).resolves.toStrictEqual(mockedValues.api.fetchAll);

      expect(getMethod).toHaveBeenCalledTimes(2);
      expect(getMethod).toHaveBeenNthCalledWith(1, query);
      expect(getMethod).toHaveBeenNthCalledWith(2, { ...query, case: 2 });

      expect(storeMethod).toHaveBeenCalledTimes(2);
      expect(storeMethod).toHaveBeenNthCalledWith(
        1,
        query,
        mockedValues.api.fetchAll,
      );
      expect(storeMethod).toHaveBeenNthCalledWith(
        2,
        { ...query, case: 2 },
        mockedValues.api.fetchAll,
      );
    });
  });
});
