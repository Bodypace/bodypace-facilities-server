import { Injectable } from '@nestjs/common';
import { GeocodedAddress } from './interfaces/geocoded-address.interface';
import { GoogleGeocoderClientService } from './modules/google-client/google-client.service';

@Injectable()
export class GeocoderService {
  constructor(
    private readonly googleGeocoderClientService: GoogleGeocoderClientService,
  ) {}

  geocode(address: GeocodedAddress['queriedAddress']): GeocodedAddress {
    return this.googleGeocoderClientService.fetch(address);
  }
}
