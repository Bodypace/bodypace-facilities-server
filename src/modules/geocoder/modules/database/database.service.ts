import { Injectable } from '@nestjs/common';
import { GeocodedAddress } from '../../interfaces/geocoded-address.interface';

@Injectable()
export class GeocoderDatabaseService {
  private readonly storage: GeocodedAddress[] = [];

  store(geocodedAddress: GeocodedAddress): void {
    this.storage.push(geocodedAddress);
  }

  get(address: GeocodedAddress['queriedAddress']): GeocodedAddress | null {
    const geocodedAddress = this.storage.find(
      (geocodedAddress) =>
        geocodedAddress.queriedAddress.toUpperCase() === address.toUpperCase(),
    );
    return geocodedAddress ? geocodedAddress : null;
  }
}
