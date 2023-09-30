import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { GeocodedAddress } from '../../interfaces/geocoded-address.interface';
import { StoredGeocodedAddress } from './entities/geocoded-address.entity';
import { asStoredGeocodedAddress } from './utils/as-stored-geocoded-address.util';
import { fromStoredGeocodedAddress } from './utils/from-stored-geocoded-address.util';

@Injectable()
export class GeocoderDatabaseService {
  constructor(
    @InjectRepository(StoredGeocodedAddress)
    private geocodesRepository: Repository<StoredGeocodedAddress>,
  ) {}

  async store(geocodedAddress: GeocodedAddress): Promise<void> {
    const storedGeocodedAddress = asStoredGeocodedAddress(geocodedAddress);

    try {
      await this.geocodesRepository.save(storedGeocodedAddress);
    } catch {
      // TODO: implement and test logging error no store()
    }
  }

  async get(
    address: GeocodedAddress['queriedAddress'],
  ): Promise<GeocodedAddress | null> {
    try {
      const storedGeocodedAddresses = await this.geocodesRepository.findBy({
        queried_address: ILike(address),
      });

      if (storedGeocodedAddresses.length === 0) {
        return null;
      }

      const storedGeocodedAddress =
        storedGeocodedAddresses[storedGeocodedAddresses.length - 1];
      return fromStoredGeocodedAddress(storedGeocodedAddress);
    } catch {
      // TODO: implement and test logging error no get()
      return null;
    }
  }
}
