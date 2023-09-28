import { TestingModule, Test } from '@nestjs/testing';
import { GeocoderService } from './geocoder.service';
import { GoogleGeocoderClientModule } from './modules/google-client/google-client.module';
import { GoogleGeocoderClientService } from './modules/google-client/google-client.service';
import { GeocoderDatabaseModule } from './modules/database/database.module';
import { GeocoderDatabaseService } from './modules/database/database.service';

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
  let geocoderService: GeocoderService;
  let googleGeocoderClientService: GoogleGeocoderClientService;
  let geocoderDatabaseService: GeocoderDatabaseService;

  const fixtures: Fixtures = {
    addresses: [
      'Avenue Appia 20, 1211 Genève 27, Switzerland',
      'MARS BASE no.3',
      'Oxford Future of Humanity Institute',
      '10903 New Hampshire Avenue, Silver Spring, MD 20993',
      'https://www.aotm.gov.pl/',
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GoogleGeocoderClientModule, GeocoderDatabaseModule],
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
