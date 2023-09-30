import { Injectable } from '@nestjs/common';
import { GeocodedAddress } from './interfaces/geocoded-address.interface';
import { GoogleGeocoderClientService } from './modules/google-client/google-client.service';
import { GeocoderDatabaseService } from './modules/database/database.service';

@Injectable()
export class GeocoderService {
  constructor(
    private readonly googleGeocoderClientService: GoogleGeocoderClientService,
    private readonly geocoderDatabaseService: GeocoderDatabaseService,
  ) {}

  async geocode(
    address: GeocodedAddress['queriedAddress'],
  ): Promise<GeocodedAddress> {
    let geocodedAddress: GeocodedAddress | null =
      await this.geocoderDatabaseService.get(address);
    if (geocodedAddress) {
      return geocodedAddress;
    }

    geocodedAddress = await this.googleGeocoderClientService.fetch(address);
    await this.geocoderDatabaseService.store(geocodedAddress);

    return geocodedAddress;
  }
}
