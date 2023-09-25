import { TestingModule, Test } from '@nestjs/testing';
import { GoogleGeocoderClientService } from './google-client.service';

interface Fixtures {
  addresses: string[];
  address?: string;
}

describe('GoogleGeocoderClientService', () => {
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
      providers: [GoogleGeocoderClientService],
    }).compile();

    googleGeocoderClientService = module.get<GoogleGeocoderClientService>(
      GoogleGeocoderClientService,
    );
  });

  it('service should be defined', () => {
    expect(googleGeocoderClientService).toBeDefined();
  });

  describe('fetch()', () => {
    describe.each(fixtures.addresses.map((address) => [address]))(
      'for address = %s',
      (address) => {
        beforeEach(() => {
          fixtures.address = address;
        });

        it('should return hard coded location', () => {
          expect(
            googleGeocoderClientService.fetch(fixtures.address!),
          ).toStrictEqual({
            queriedAddress: fixtures.address,
            locatedAddress: 'random hardcoded value',
            longitude: 1337,
            latitude: 42,
          });
        });
      },
    );
  });
});
