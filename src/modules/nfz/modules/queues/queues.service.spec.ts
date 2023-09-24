import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeocoderModule } from '../../../geocoder/geocoder.module';
import { GeocoderService } from '../../../geocoder/geocoder.service';
import { GeocodedAddress } from '../../../geocoder/interfaces/geocoded-address.interface';
import { NfzQueuesService } from './queues.service';
import { NfzQueuesApiClientModule } from './modules/api-client/api-client.module';
import { NfzQueuesApiClientService } from './modules/api-client/api-client.service';
import { NfzQueuesApiQueue } from './modules/api-client/interfaces/queue.interface';
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

interface MockedValues {
  api: {
    fetchAll: NfzQueuesApiQueue[];
    fetchAllGeocoded: NfzQueuesApiQueue[];
  };
  geocoder: {
    geocode: GeocodedAddress;
  };
}

const mockedValues: MockedValues = {
  api: {
    fetchAll: structuredClone(req_1_page_1.data),
    fetchAllGeocoded: structuredClone(req_1_page_1.data),
  },
  geocoder: {
    geocode: {
      queried_address: 'fake queried address',
      located_address: 'fake located address',
      longitude: 7331,
      latitude: 24,
    },
  },
};

for (const queue of mockedValues.api.fetchAllGeocoded) {
  queue.attributes.longitude = mockedValues.geocoder.geocode.longitude;
  queue.attributes.latitude = mockedValues.geocoder.geocode.latitude;
}

function MockedNfzQueuesApiClientService() {
  return {
    fetchAll: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(structuredClone(mockedValues.api.fetchAll)),
      ),
  };
}

function MockedGeocoderService() {
  return {
    geocode: jest
      .fn()
      .mockImplementation(() => structuredClone(mockedValues.geocoder.geocode)),
  };
}

// https://stackoverflow.com/questions/77165249/how-can-i-make-jest-spied-function-internally-store-arguments-that-the-function
function spyOnUsingDeepCopyForArguments(
  object: any,
  prop: string,
  callArguments: any[],
) {
  const originalMethod = object[prop];
  object[prop] = jest.fn().mockImplementation((...args) => {
    callArguments.push(structuredClone(args));
    return originalMethod.apply(object, args);
  });
  return object[prop];
}

describe('NfzQueuesService', () => {
  const databaseName = 'test-nfz-queues-q-service-database.sqlite';
  let nfzQueuesService: NfzQueuesService;
  let nfzQueuesApiClientService: NfzQueuesApiClientService;
  let nfzQueuesCacheService: NfzQueuesCacheService;
  let dataSource: DataSource;
  let geocoderService: GeocoderService;
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
        GeocoderModule,
        NfzQueuesApiClientModule,
        NfzQueuesCacheModule,
      ],
      providers: [NfzQueuesService],
    })
      .overrideProvider(NfzQueuesApiClientService)
      .useValue(MockedNfzQueuesApiClientService())
      .overrideProvider(GeocoderService)
      .useValue(MockedGeocoderService())
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
    geocoderService = module.get<GeocoderService>(GeocoderService);
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

  it('geocoderService should be defined', () => {
    expect(geocoderService).toBeDefined();
  });

  it('logger should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('startup should log that dependencies are initialized (testing detail)', () => {
    expect(logger.log).toHaveBeenCalledTimes(8);
    expect(logger.log).toHaveBeenNthCalledWith(
      1,
      'TypeOrmModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      2,
      'GeocoderModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      3,
      'NfzQueuesApiClientModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      4,
      'HttpModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      5,
      'TypeOrmCoreModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      6,
      'TypeOrmModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      7,
      'NfzQueuesCacheModule dependencies initialized',
      'InstanceLoader',
    );
    expect(logger.log).toHaveBeenNthCalledWith(
      8,
      'RootTestModule dependencies initialized',
      'InstanceLoader',
    );
  });

  it('mocked api fetchAll and fetchAllGeocoded should differ by Lng and Lat', () => {
    expect(mockedValues.api.fetchAll).not.toBe(
      mockedValues.api.fetchAllGeocoded,
    );
    expect(mockedValues.api.fetchAll).not.toEqual(
      mockedValues.api.fetchAllGeocoded,
    );
    const all = structuredClone(mockedValues.api.fetchAll);
    const allGeocoded = structuredClone(mockedValues.api.fetchAllGeocoded);
    for (const queue of all) {
      queue.attributes.longitude = 9000;
      queue.attributes.latitude = 3000;
    }
    for (const queue of allGeocoded) {
      queue.attributes.longitude = 9000;
      queue.attributes.latitude = 3000;
    }
    expect(all).toStrictEqual(allGeocoded);
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

    it('should return result of NfzQueuesApiClientService#fetchAll() with longitude and latitude changed using geocoder', async () => {
      await expect(nfzQueuesService.findAll(query)).resolves.toEqual(
        mockedValues.api.fetchAllGeocoded,
      );
    });

    it('should cache value to avoid calling NfzQueuesApiClientService#fetchAll() twice with same query', async () => {
      await expect(nfzQueuesService.findAll(query)).resolves.toEqual(
        mockedValues.api.fetchAllGeocoded,
      );
      await expect(nfzQueuesService.findAll(query)).resolves.toEqual(
        mockedValues.api.fetchAllGeocoded,
      );

      expect(nfzQueuesApiClientService.fetchAll).toHaveBeenCalledTimes(1);
      expect(nfzQueuesApiClientService.fetchAll).toHaveBeenCalledWith(query);
    });

    it('should log cache miss on first call with a given query', async () => {
      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAllGeocoded,
      );
      // 1
      expect(logger.log).toHaveBeenCalledTimes(8 + 1);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        'TypeOrmModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        'GeocoderModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        3,
        'NfzQueuesApiClientModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        4,
        'HttpModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        5,
        'TypeOrmCoreModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        6,
        'TypeOrmModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        7,
        'NfzQueuesCacheModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        8,
        'RootTestModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        9,
        '#findAll() - cache miss',
        'NfzQueuesService',
      );
    });

    it('should log one cache miss and one cache hit on two calls with the same query', async () => {
      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAllGeocoded,
      );
      await expect(nfzQueuesService.findAll(query)).resolves.toEqual(
        mockedValues.api.fetchAllGeocoded,
      );

      expect(logger.log).toHaveBeenCalledTimes(8 + 2);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        'TypeOrmModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        'GeocoderModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        3,
        'NfzQueuesApiClientModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        4,
        'HttpModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        5,
        'TypeOrmCoreModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        6,
        'TypeOrmModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        7,
        'NfzQueuesCacheModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        8,
        'RootTestModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        9,
        '#findAll() - cache miss',
        'NfzQueuesService',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        10,
        '#findAll() - cache hit',
        'NfzQueuesService',
      );
    });

    it('should log cache miss two times on two calls, second call with different query', async () => {
      expect(query.case).not.toBe(2);

      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAllGeocoded,
      );
      await expect(
        nfzQueuesService.findAll({ ...query, case: 2 }),
      ).resolves.toStrictEqual(mockedValues.api.fetchAllGeocoded);

      expect(logger.log).toHaveBeenCalledTimes(8 + 2);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        'TypeOrmModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        2,
        'GeocoderModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        3,
        'NfzQueuesApiClientModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        4,
        'HttpModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        5,
        'TypeOrmCoreModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        6,
        'TypeOrmModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        7,
        'NfzQueuesCacheModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        8,
        'RootTestModule dependencies initialized',
        'InstanceLoader',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        9,
        '#findAll() - cache miss',
        'NfzQueuesService',
      );
      expect(logger.log).toHaveBeenNthCalledWith(
        10,
        '#findAll() - cache miss',
        'NfzQueuesService',
      );
    });

    it('should not order cache to write the same query and queues twice', async () => {
      const getMethod = jest.spyOn(nfzQueuesCacheService, 'get');
      const storeMethodArguments: any[] = [];
      const storeMethod = spyOnUsingDeepCopyForArguments(
        nfzQueuesCacheService,
        'store',
        storeMethodArguments,
      );

      await expect(nfzQueuesService.findAll(query)).resolves.toEqual(
        mockedValues.api.fetchAllGeocoded,
      );
      await expect(nfzQueuesService.findAll(query)).resolves.toEqual(
        mockedValues.api.fetchAllGeocoded,
      );

      expect(getMethod).toHaveBeenCalledTimes(2);
      expect(getMethod).toHaveBeenNthCalledWith(1, query);
      expect(getMethod).toHaveBeenNthCalledWith(2, query);

      expect(storeMethod).toHaveBeenCalledTimes(1);
      expect(storeMethodArguments.length).toBe(1);
      expect(storeMethodArguments[0]).toEqual([
        query,
        mockedValues.api.fetchAll,
      ]);
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
        const storeMethodArguments: any[] = [];
        const storeMethod = spyOnUsingDeepCopyForArguments(
          nfzQueuesCacheService,
          'store',
          storeMethodArguments,
        );

        expect(query[fieldToLowerCase]).toBeTruthy();
        expect(query[fieldToLowerCase]?.toLowerCase()).not.toEqual(
          query[fieldToLowerCase],
        );

        await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
          mockedValues.api.fetchAllGeocoded,
        );
        await expect(
          nfzQueuesService.findAll({
            ...query,
            [fieldToLowerCase]: query[fieldToLowerCase]?.toLowerCase(),
          }),
        ).resolves.toEqual(mockedValues.api.fetchAllGeocoded);

        expect(getMethod).toHaveBeenCalledTimes(2);
        expect(getMethod).toHaveBeenNthCalledWith(1, query);
        expect(getMethod).toHaveBeenNthCalledWith(2, {
          ...query,
          [fieldToLowerCase]: query[fieldToLowerCase]?.toLowerCase(),
        });

        expect(storeMethod).toHaveBeenCalledTimes(1);
        expect(storeMethodArguments.length).toBe(1);
        expect(storeMethodArguments[0]).toEqual([
          query,
          mockedValues.api.fetchAll,
        ]);
      },
    );

    it('should order cache to write same queues second time when query is different - case is different', async () => {
      const getMethod = jest.spyOn(nfzQueuesCacheService, 'get');
      const storeMethodArguments: any[] = [];
      const storeMethod = spyOnUsingDeepCopyForArguments(
        nfzQueuesCacheService,
        'store',
        storeMethodArguments,
      );

      expect(query.case).not.toBe(2);

      await expect(nfzQueuesService.findAll(query)).resolves.toStrictEqual(
        mockedValues.api.fetchAllGeocoded,
      );
      await expect(
        nfzQueuesService.findAll({ ...query, case: 2 }),
      ).resolves.toStrictEqual(mockedValues.api.fetchAllGeocoded);

      expect(getMethod).toHaveBeenCalledTimes(2);
      expect(getMethod).toHaveBeenNthCalledWith(1, query);
      expect(getMethod).toHaveBeenNthCalledWith(2, { ...query, case: 2 });

      expect(storeMethod).toHaveBeenCalledTimes(2);
      expect(storeMethodArguments.length).toBe(2);
      expect(storeMethodArguments[0]).toEqual([
        query,
        mockedValues.api.fetchAll,
      ]);
      expect(storeMethodArguments[1]).toEqual([
        { ...query, case: 2 },
        mockedValues.api.fetchAll,
      ]);
    });

    it('should call GeocoderService#geocode() for each queue it returned with addresses specified in those queues', async () => {
      const queues = await nfzQueuesService.findAll(query);
      expect(queues).toStrictEqual(mockedValues.api.fetchAllGeocoded);

      expect(geocoderService.geocode).toHaveBeenCalledTimes(queues.length);
      for (let i = 0; i < queues.length; ++i) {
        const queue = queues[i];
        const queriedAddress =
          queue.attributes.address +
          ', ' +
          queue.attributes.locality +
          ', ŚLĄSK';

        expect(geocoderService.geocode).toHaveBeenNthCalledWith(
          i + 1,
          queriedAddress,
        );
      }
    });

    it.each([
      ['including when cache is used', 1],
      ['including when cache is not used', 2],
    ])(
      'should call GeocoderService#geocode() for each queue it returns each time, %s',
      async (_, expectedCachableCalls) => {
        const getMethod = jest.spyOn(nfzQueuesCacheService, 'get');
        const storeMethod = jest.spyOn(nfzQueuesCacheService, 'store');

        const queues = await nfzQueuesService.findAll(query);
        expect(queues).toStrictEqual(mockedValues.api.fetchAllGeocoded);

        expect(geocoderService.geocode).toHaveBeenCalledTimes(queues.length);
        for (let i = 0; i < queues.length; ++i) {
          const queue = queues[i];
          const queriedAddress =
            queue.attributes.address +
            ', ' +
            queue.attributes.locality +
            ', ŚLĄSK';

          expect(geocoderService.geocode).toHaveBeenNthCalledWith(
            i + 1,
            queriedAddress,
          );
        }

        expect(getMethod).toHaveBeenCalledTimes(1);
        expect(storeMethod).toHaveBeenCalledTimes(1);

        if (expectedCachableCalls === 2) {
          expect(query.case).not.toBe(2);
          query = {
            ...query,
            case: 2,
          };
        }

        const queues2 = await nfzQueuesService.findAll(query);
        expect(queues2).toEqual(mockedValues.api.fetchAllGeocoded);

        expect(queues).toEqual(queues2);

        expect(geocoderService.geocode).toHaveBeenCalledTimes(
          queues2.length * 2,
        );
        for (let i = 0; i < queues2.length; ++i) {
          const queue = queues2[i];
          const queriedAddress =
            queue.attributes.address +
            ', ' +
            queue.attributes.locality +
            ', ŚLĄSK';

          expect(geocoderService.geocode).toHaveBeenNthCalledWith(
            queues.length + i + 1,
            queriedAddress,
          );
        }

        expect(getMethod).toHaveBeenCalledTimes(2);
        expect(storeMethod).toHaveBeenCalledTimes(expectedCachableCalls);
        expect(nfzQueuesApiClientService.fetchAll).toHaveBeenCalledTimes(
          expectedCachableCalls,
        );
      },
    );
  });
});
