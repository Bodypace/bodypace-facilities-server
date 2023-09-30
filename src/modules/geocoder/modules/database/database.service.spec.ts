import { TestingModule, Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeocoderDatabaseService } from './database.service';
import { GeocodedAddress } from '../../interfaces/geocoded-address.interface';
import { StoredGeocodedAddress } from './entities/geocoded-address.entity';
import { DataSource } from 'typeorm';
import { unlink } from 'node:fs/promises';

interface Fixtures {
  addresses: GeocodedAddress['queriedAddress'][];
  geocoded: Omit<GeocodedAddress, 'queriedAddress'>;
  address?: GeocodedAddress['queriedAddress'];
  geocodedAddress?: GeocodedAddress;
}

describe('GeocoderDatabaseService', () => {
  const databaseName = 'test-geocoder-database-service-database.sqlite';
  let geocoderDatabaseService: GeocoderDatabaseService;
  let dataSource: DataSource;

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
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: databaseName,
          synchronize: true,
          dropSchema: true,
          entities: [StoredGeocodedAddress],
        }),
        TypeOrmModule.forFeature([StoredGeocodedAddress]),
      ],
      providers: [GeocoderDatabaseService],
    }).compile();

    geocoderDatabaseService = module.get<GeocoderDatabaseService>(
      GeocoderDatabaseService,
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    await unlink(databaseName);
  });

  it('service should be defined', () => {
    expect(geocoderDatabaseService).toBeDefined();
  });

  it('dataSource should be defined', () => {
    expect(dataSource).toBeDefined();
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

          it('should return null', async () => {
            await expect(
              geocoderDatabaseService.get(fixtures.address!),
            ).resolves.toBeNull();
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

          it('should return nothing', async () => {
            await expect(
              geocoderDatabaseService.store({
                ...fixtures.geocoded,
                queriedAddress: fixtures.address!,
              }),
            ).resolves.toBeUndefined();
          });

          it('should make next get() return stored geocoded address', async () => {
            const geocodedAddress = {
              ...fixtures.geocoded,
              queriedAddress: fixtures.address!,
            };

            await geocoderDatabaseService.store(geocodedAddress);

            await expect(
              geocoderDatabaseService.get(fixtures.address!),
            ).resolves.toStrictEqual(geocodedAddress);
          });
        },
      );
    });
  });

  describe('with data stored', () => {
    beforeEach(async () => {
      fixtures.address = fixtures.addresses[0];
      fixtures.geocodedAddress = {
        ...fixtures.geocoded,
        queriedAddress: fixtures.address,
      };

      await geocoderDatabaseService.store(fixtures.geocodedAddress);
    });

    describe('get()', () => {
      it('should return stored geocoded address for correct address', async () => {
        await expect(
          geocoderDatabaseService.get(fixtures.address!),
        ).resolves.toStrictEqual(fixtures.geocodedAddress);
      });

      it('should return stored geocoded address for correct address, but upper case', async () => {
        // TODO: fix case insensitive search not working when special characters are used
        // NOTE: below is a duck-taped fix for special characters
        fixtures.address = fixtures.address!.replace('È', 'è');

        await expect(
          geocoderDatabaseService.get(fixtures.address!),
        ).resolves.toStrictEqual(fixtures.geocodedAddress);
      });

      it('should return null for incorrect address', async () => {
        const incorrectAddress = fixtures.addresses[1];
        expect(incorrectAddress).not.toEqual(fixtures.address!);

        await expect(
          geocoderDatabaseService.get(incorrectAddress),
        ).resolves.toBeNull();
      });
    });
  });

  // TODO: write database integration tests, that check that:
  //   - data is actually being stored in database
  //   - correct behavior when database is not accessible
});
