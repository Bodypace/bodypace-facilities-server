import { TestingModule, Test } from '@nestjs/testing';
import { GeocoderService } from './geocoder.service';

interface Fixtures {
  addresses: string[];
  address?: string;
}

describe('GeocoderService', () => {
  let geocoderService: GeocoderService;
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
      providers: [GeocoderService],
    }).compile();

    geocoderService = module.get<GeocoderService>(GeocoderService);
  });

  it('service should be defined', () => {
    expect(geocoderService).toBeDefined();
  });

  describe('geocode()', () => {
    describe.each(fixtures.addresses.map((address) => [address]))(
      'for address = %s',
      (address) => {
        beforeEach(() => {
          fixtures.address = address;
        });

        it('should return hard coded location', () => {
          expect(geocoderService.geocode(fixtures.address!)).toStrictEqual({
            queried_address: fixtures.address,
            located_address: 'random hardcoded value',
            longitude: 1337,
            latitude: 42,
          });
        });
      },
    );
  });
});
