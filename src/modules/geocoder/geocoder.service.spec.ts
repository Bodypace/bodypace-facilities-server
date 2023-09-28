import { TestingModule, Test } from '@nestjs/testing';
import { GeocoderService } from './geocoder.service';
import { GoogleGeocoderClientModule } from './modules/google-client/google-client.module';
import { GoogleGeocoderClientService } from './modules/google-client/google-client.service';

interface Fixtures {
  addresses: string[];
  address?: string;
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
      imports: [GoogleGeocoderClientModule],
      providers: [GeocoderService],
    })
      .overrideProvider(GoogleGeocoderClientService)
      .useValue(MockedGoogleGeocoderClientService())
      .compile();

    geocoderService = module.get<GeocoderService>(GeocoderService);
    googleGeocoderClientService = module.get<GoogleGeocoderClientService>(
      GoogleGeocoderClientService,
    );
  });

  it('service should be defined', () => {
    expect(geocoderService).toBeDefined();
  });

  it('google geocoder client service should be defined', () => {
    expect(googleGeocoderClientService).toBeDefined();
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
      },
    );
  });
});
