import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfzQueuesService } from './queues.service';
import { NfzQueuesApiClientModule } from './modules/api-client/api-client.module';
import { NfzQueuesApiClientService } from './modules/api-client/api-client.service';
import { NfzQueuesCacheModule } from './modules/cache/cache.module';
import { NfzQueuesCacheService } from './modules/cache/cache.service';
import { NfzQueuesApiQuery } from './modules/api-client/interfaces/query.interface';
import { mockedResponse } from '../../../../../test/mocks/httpService/mocked-response-1-false-endo-06-page-2';
import { DataSource } from 'typeorm';
import { unlink } from 'node:fs/promises';

const mockedValues = {
  api: {
    fetchAll: mockedResponse.response.data,
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
  let query: NfzQueuesApiQuery;

  beforeEach(async () => {
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

    it('should not order cache to write the same query and queues twice - benefit is same but uppercase', async () => {
      const getMethod = jest.spyOn(nfzQueuesCacheService, 'get');
      const storeMethod = jest.spyOn(nfzQueuesCacheService, 'store');

      expect(query.benefit).toBeTruthy();
      expect(query.benefit?.toUpperCase()).not.toEqual(query.benefit);

      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAll,
      );
      await expect(
        nfzQueuesService.findAll({
          ...query,
          benefit: query.benefit?.toUpperCase(),
        }),
      ).resolves.toStrictEqual(mockedValues.api.fetchAll);

      expect(getMethod).toHaveBeenCalledTimes(2);
      expect(getMethod).toHaveBeenNthCalledWith(1, query);
      expect(getMethod).toHaveBeenNthCalledWith(2, {
        ...query,
        benefit: query.benefit?.toUpperCase(),
      });

      expect(storeMethod).toHaveBeenCalledTimes(1);
      expect(storeMethod).toHaveBeenNthCalledWith(
        1,
        query,
        mockedValues.api.fetchAll,
      );
    });

    it('should order cache to write same queues second time when query is different - case is different', async () => {
      const getMethod = jest.spyOn(nfzQueuesCacheService, 'get');
      const storeMethod = jest.spyOn(nfzQueuesCacheService, 'store');

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
