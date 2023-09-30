import { TestingModule, Test } from '@nestjs/testing';
import { GeocoderService } from './geocoder.service';
import { GoogleGeocoderClientModule } from './modules/google-client/google-client.module';
import { GoogleGeocoderClientService } from './modules/google-client/google-client.service';
import { GeocoderDatabaseModule } from './modules/database/database.module';
import { GeocoderDatabaseService } from './modules/database/database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { unlink } from 'node:fs/promises';

interface Fixtures {
  addresses: string[];
  address?: string;
  address2?: string;
}

const mockedValues = {
  googleGeocoder: {
    fetch: {
      locatedAddress: 'random hardcoded value',
      longitude: 10101,
      latitude: 202020,
    },
  },
};

function MockedGoogleGeocoderClientService() {
  return {
    fetch: jest.fn().mockImplementation((address: string) => ({
      ...mockedValues.googleGeocoder.fetch,
      queriedAddress: address,
    })),
  };
}

describe('GeocoderService', () => {
  const databaseName = 'test-geocoder-service-database.sqlite';
  let geocoderService: GeocoderService;
  let googleGeocoderClientService: GoogleGeocoderClientService;
  let geocoderDatabaseService: GeocoderDatabaseService;
  let dataSource: DataSource;

  const fixtures: Fixtures = {
    addresses: [
      // TODO: use correct address with special non-ascii letters
      // 'Avenue Appia 20, 1211 Genève 27, Switzerland',
      //
      // NOTE: for now 'e' is used instead of 'è' for uppercase test to work.
      // In SQLite upper(), lower() and case-insensitive comparison works for
      // ascii characters only, unless SQLite is compiled with ICU
      // (International Components for Unicode) library.
      //
      // Idk how to nicely solve this issue (to keep things simple and convenient,
      // especially for new users who just want to npm install and run server),
      // for now I only read a few links:
      // 1 - https://stackoverflow.com/questions/52478022/sql-changing-value-to-uppercase-with-specified-locale
      // 2 - https://database.guide/how-sqlite-upper-works/
      // 3 - https://www.sqlite.org/src/artifact?ci=trunk&filename=ext/icu/README.txt
      // 4 - https://stackoverflow.com/questions/22343850/like-case-insensitive-for-not-english-letters
      // 5 - https://www.sqlite.org/lang_corefunc.html#upper
      // 6 - https://stackoverflow.com/questions/6578600/how-to-compile-sqlite-with-icu
      // 7 - https://github.com/TryGhost/node-sqlite3/issues/1517
      // 8 - https://github.com/TryGhost/node-sqlite3/issues/145
      // 9 - https://github.com/TryGhost/node-sqlite3/issues/70
      //
      // I don't think that manually compiling anything here and/or loading it
      // to sqlite3 is a convenient solution, as from what I understood so far,
      // anyone who wants to run our server would have to do it manually as well
      // on their host (I could be wrong).
      //
      // Maybe, inside docker container for reproducibility and portability,
      // I could try both:
      //   - compiling sqlite3 npm package with icu,
      //   - compiling icu, then loading it dynamically to sqlite3 package
      //
      // Maybe with such nicely configured docker image building sqlite3 package with ICU
      // or building ICU and enabling it for sqlite3 package could be easy for newcommers,
      // who want to clone this server code, build it and run. I doubt it tho.
      //
      // I also checked better-sqlite and they do not build their stuff with ICU,
      // same manual compilation stuff (or smth similar) has to be performed for
      // better-sqlite to have ICU, therefore, don't bother with better-sqlite.
      //
      // If it is really problematic, switching to some other rdbms like MySQL inside docker
      // should not be that bad, althoug I would prefer keeping things simple given that
      // there is no need yet for such bigger SQL engine/environment complexity.
      'Avenue Appia 20, 1211 Geneve 27, Switzerland',
      'MARS BASE no.3',
      'Oxford Future of Humanity Institute',
      '10903 New Hampshire Avenue, Silver Spring, MD 20993',
      'https://www.aotm.gov.pl/',
    ],
  };

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
        GoogleGeocoderClientModule,
        GeocoderDatabaseModule,
      ],
      providers: [GeocoderService],
    })
      .overrideProvider(GoogleGeocoderClientService)
      .useValue(MockedGoogleGeocoderClientService())
      .compile();

    geocoderService = module.get<GeocoderService>(GeocoderService);
    googleGeocoderClientService = module.get<GoogleGeocoderClientService>(
      GoogleGeocoderClientService,
    );
    geocoderDatabaseService = module.get<GeocoderDatabaseService>(
      GeocoderDatabaseService,
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await dataSource.destroy();
    await unlink(databaseName);
  });

  it('service should be defined', () => {
    expect(geocoderService).toBeDefined();
  });

  it('google geocoder client service should be defined', () => {
    expect(googleGeocoderClientService).toBeDefined();
  });

  it('geocoder database service should be defined', () => {
    expect(geocoderDatabaseService).toBeDefined();
  });

  it('dataSource should be defined', () => {
    expect(dataSource).toBeDefined();
  });

  describe('geocode()', () => {
    describe.each(fixtures.addresses.map((address) => [address]))(
      'for address = %s',
      (address) => {
        beforeEach(() => {
          fixtures.address = address;
        });

        it('should call GoogleGeocoderClientService#fetch() with given address', async () => {
          await geocoderService.geocode(fixtures.address!);
          expect(googleGeocoderClientService.fetch).toHaveBeenCalledTimes(1);
          expect(googleGeocoderClientService.fetch).toHaveBeenNthCalledWith(
            1,
            fixtures.address,
          );
        });

        it('should return geocoded address returned by GoogleGeocoderClientService#fetch()', async () => {
          await expect(
            geocoderService.geocode(fixtures.address!),
          ).resolves.toStrictEqual({
            ...mockedValues.googleGeocoder.fetch,
            queriedAddress: fixtures.address,
          });
        });

        it('should check if values is stored in database by calling GeocoderDatabaseService#get()', async () => {
          const getMethod = jest.spyOn(geocoderDatabaseService, 'get');

          await expect(
            geocoderService.geocode(fixtures.address!),
          ).resolves.toStrictEqual({
            ...mockedValues.googleGeocoder.fetch,
            queriedAddress: fixtures.address,
          });

          expect(getMethod).toHaveBeenCalledTimes(1);
          expect(getMethod).toHaveBeenNthCalledWith(1, fixtures.address!);
        });

        it('should store geocodedAddress on first call', async () => {
          const getMethod = jest.spyOn(geocoderDatabaseService, 'get');
          const storeMethod = jest.spyOn(geocoderDatabaseService, 'store');

          await expect(
            geocoderService.geocode(fixtures.address!),
          ).resolves.toStrictEqual({
            ...mockedValues.googleGeocoder.fetch,
            queriedAddress: fixtures.address,
          });

          expect(getMethod).toHaveBeenCalledTimes(1);
          expect(getMethod).toHaveBeenNthCalledWith(1, fixtures.address!);

          expect(storeMethod).toHaveBeenCalledTimes(1);
          expect(storeMethod).toHaveBeenNthCalledWith(1, {
            ...mockedValues.googleGeocoder.fetch,
            queriedAddress: fixtures.address,
          });
        });

        it('should use cached value on second call with same address', async () => {
          const getMethod = jest.spyOn(geocoderDatabaseService, 'get');
          const storeMethod = jest.spyOn(geocoderDatabaseService, 'store');

          await expect(
            geocoderService.geocode(fixtures.address!),
          ).resolves.toStrictEqual({
            ...mockedValues.googleGeocoder.fetch,
            queriedAddress: fixtures.address,
          });

          await expect(
            geocoderService.geocode(fixtures.address!),
          ).resolves.toStrictEqual({
            ...mockedValues.googleGeocoder.fetch,
            queriedAddress: fixtures.address,
          });

          expect(getMethod).toHaveBeenCalledTimes(2);
          expect(getMethod).toHaveBeenNthCalledWith(1, fixtures.address!);
          expect(getMethod).toHaveBeenNthCalledWith(2, fixtures.address!);

          expect(storeMethod).toHaveBeenCalledTimes(1);
          expect(storeMethod).toHaveBeenNthCalledWith(1, {
            ...mockedValues.googleGeocoder.fetch,
            queriedAddress: fixtures.address,
          });
        });

        it('should use cached value on second call with same address, but upper case', async () => {
          const getMethod = jest.spyOn(geocoderDatabaseService, 'get');
          const storeMethod = jest.spyOn(geocoderDatabaseService, 'store');

          await expect(
            geocoderService.geocode(fixtures.address!),
          ).resolves.toStrictEqual({
            ...mockedValues.googleGeocoder.fetch,
            queriedAddress: fixtures.address,
          });

          await expect(
            geocoderService.geocode(fixtures.address!.toUpperCase()),
          ).resolves.toStrictEqual({
            ...mockedValues.googleGeocoder.fetch,
            queriedAddress: fixtures.address!,
          });

          expect(getMethod).toHaveBeenCalledTimes(2);
          expect(getMethod).toHaveBeenNthCalledWith(1, fixtures.address!);
          expect(getMethod).toHaveBeenNthCalledWith(
            2,
            fixtures.address!.toUpperCase(),
          );

          expect(storeMethod).toHaveBeenCalledTimes(1);
          expect(storeMethod).toHaveBeenNthCalledWith(1, {
            ...mockedValues.googleGeocoder.fetch,
            queriedAddress: fixtures.address,
          });
        });
      },
    );

    describe('for two different addresses', () => {
      beforeEach(() => {
        fixtures.address = fixtures.addresses[0];
        fixtures.address2 = fixtures.addresses[1];
      });

      it('first address should be differ from second address', () => {
        expect(fixtures.address).toBeDefined();
        expect(fixtures.address2).toBeDefined();
        expect(fixtures.address).not.toEqual(fixtures.address2);
      });

      it('should store two geocodedAddresses addresses', async () => {
        const getMethod = jest.spyOn(geocoderDatabaseService, 'get');
        const storeMethod = jest.spyOn(geocoderDatabaseService, 'store');

        await expect(
          geocoderService.geocode(fixtures.address!),
        ).resolves.toStrictEqual({
          ...mockedValues.googleGeocoder.fetch,
          queriedAddress: fixtures.address!,
        });

        await expect(
          geocoderService.geocode(fixtures.address2!),
        ).resolves.toStrictEqual({
          ...mockedValues.googleGeocoder.fetch,
          queriedAddress: fixtures.address2!,
        });

        expect(getMethod).toHaveBeenCalledTimes(2);
        expect(getMethod).toHaveBeenNthCalledWith(1, fixtures.address!);
        expect(getMethod).toHaveBeenNthCalledWith(2, fixtures.address2);

        expect(storeMethod).toHaveBeenCalledTimes(2);
        expect(storeMethod).toHaveBeenNthCalledWith(1, {
          ...mockedValues.googleGeocoder.fetch,
          queriedAddress: fixtures.address,
        });
        expect(storeMethod).toHaveBeenNthCalledWith(2, {
          ...mockedValues.googleGeocoder.fetch,
          queriedAddress: fixtures.address2,
        });
      });
    });
  });
});
