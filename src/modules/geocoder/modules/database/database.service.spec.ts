import { TestingModule, Test } from '@nestjs/testing';
import { GeocoderDatabaseService } from './database.service';
import { GeocodedAddress } from '../../interfaces/geocoded-address.interface';

interface Fixtures {
  addresses: GeocodedAddress['queriedAddress'][];
  geocoded: Omit<GeocodedAddress, 'queriedAddress'>;
  address?: GeocodedAddress['queriedAddress'];
  geocodedAddress?: GeocodedAddress;
}

describe('GeocoderDatabaseService', () => {
  let geocoderDatabaseService: GeocoderDatabaseService;
  const fixtures: Fixtures = {
    addresses: [
      'Avenue Appia 20, 1211 Genève 27, Switzerland',
      'Avenue Appia 20. 1211 Genève 27, Switzerland',
      '',
      '.',
    ],
    geocoded: {
      locatedAddress: 'random text here',
      longitude: 88336644,
      latitude: 44884400,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeocoderDatabaseService],
    }).compile();

    geocoderDatabaseService = module.get<GeocoderDatabaseService>(
      GeocoderDatabaseService,
    );
  });

  it('service should be defined', () => {
    expect(geocoderDatabaseService).toBeDefined();
  });

  describe('with no data stored', () => {
    describe('get()', () => {
      describe.each(fixtures.addresses.map((address) => [address]))(
        'for address = %s',
        (address) => {
          beforeEach(() => {
            fixtures.address = address;
          });

          it('address should be defined', () => {
            expect(fixtures.address).toBeDefined();
            expect(fixtures.address).toEqual(address);
          });

          it('should return null', () => {
            expect(geocoderDatabaseService.get(fixtures.address!)).toBeNull();
          });
        },
      );
    });

    describe('store()', () => {
      describe.each(fixtures.addresses.map((address) => [address]))(
        'for address = %s',
        (address) => {
          beforeEach(() => {
            fixtures.address = address;
          });

          it('address should be defined', () => {
            expect(fixtures.address).toBeDefined();
            expect(fixtures.address).toEqual(address);
          });

          it('should return nothing', () => {
            expect(
              geocoderDatabaseService.store({
                ...fixtures.geocoded,
                queriedAddress: fixtures.address!,
              }),
            ).toBeUndefined();
          });

          it('should make next get() return stored geocoded address', () => {
            const geocodedAddress = {
              ...fixtures.geocoded,
              queriedAddress: fixtures.address!,
            };

            geocoderDatabaseService.store(geocodedAddress);

            expect(
              geocoderDatabaseService.get(fixtures.address!),
            ).toStrictEqual(geocodedAddress);
          });
        },
      );
    });
  });

  describe('with data stored', () => {
    beforeEach(() => {
      fixtures.address = fixtures.addresses[0];
      fixtures.geocodedAddress = {
        ...fixtures.geocoded,
        queriedAddress: fixtures.address,
      };

      geocoderDatabaseService.store(fixtures.geocodedAddress);
    });

    describe('get()', () => {
      it('should return stored geocoded address for correct address', () => {
        expect(geocoderDatabaseService.get(fixtures.address!)).toStrictEqual(
          fixtures.geocodedAddress,
        );
      });

      it('should return stored geocoded address for correct address, but upper case', () => {
        expect(
          geocoderDatabaseService.get(fixtures.address!.toUpperCase()),
        ).toStrictEqual(fixtures.geocodedAddress);
      });

      it('should return null for incorrect address', () => {
        const incorrectAddress = fixtures.addresses[1];
        expect(incorrectAddress).not.toEqual(fixtures.address!);

        expect(geocoderDatabaseService.get(incorrectAddress)).toBeNull();
      });
    });
  });
});
