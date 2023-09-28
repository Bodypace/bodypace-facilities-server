import { TestingModule, Test } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { GoogleGeocoderClientService } from './google-client.service';
import { MockedHttpService } from '../../../../../test/mocks/httpService/http.service.mock';

interface Fixtures {
  addresses: string[];
  address?: string;
  apiKey?: string;
}

describe('GoogleGeocoderClientService', () => {
  let googleGeocoderClientService: GoogleGeocoderClientService;
  let httpService: HttpService;

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
      imports: [HttpModule],
      providers: [GoogleGeocoderClientService],
    })
      .overrideProvider(HttpService)
      .useValue(MockedHttpService())
      .compile();

    googleGeocoderClientService = module.get<GoogleGeocoderClientService>(
      GoogleGeocoderClientService,
    );
    httpService = module.get<HttpService>(HttpService);
  });

  it('service should be defined', () => {
    expect(googleGeocoderClientService).toBeDefined();
  });

  it('httpService should be defined', () => {
    expect(httpService).toBeDefined();
  });

  describe('fetch()', () => {
    describe.each(fixtures.addresses.map((address) => [address]))(
      'for address = %s',
      (address) => {
        beforeEach(() => {
          fixtures.address = address;
          fixtures.apiKey = 'mocked-google-geocoder-API-key-12354';
          process.env['GOOGLE_GEOCODER_API_KEY'] = fixtures.apiKey;
        });

        it('address should be defined', () => {
          expect(fixtures.address).toBeDefined();
        });

        it('apiKey should be defined', () => {
          expect(fixtures.apiKey).toBeDefined();
          expect(process.env['GOOGLE_GEOCODER_API_KEY']).toEqual(
            fixtures.apiKey,
          );
        });

        it('should call HttpService#axiosRef#get() with correct address and apiKey', async () => {
          await googleGeocoderClientService.fetch(fixtures.address!);

          expect(httpService.axiosRef.get).toHaveBeenCalledTimes(1);
          expect(httpService.axiosRef.get).toHaveBeenCalledWith(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              fixtures.address!,
            )}&key=${fixtures.apiKey}`,
          );
        });

        it('should return data received from HttpService#axiosRef#get()', async () => {
          const response = await googleGeocoderClientService.fetch(
            fixtures.address!,
          );

          expect(httpService.axiosRef.get).toHaveBeenCalledTimes(1);
          expect(response).toStrictEqual({
            queriedAddress: fixtures.address,
            locatedAddress: 'mocked formatted addr',
            longitude: 33441122,
            latitude: 55667788,
          });
        });
      },
    );
  });
});
