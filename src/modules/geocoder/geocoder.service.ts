import { Injectable } from '@nestjs/common';
import { GeocodedAddress } from './interfaces/geocoded-address.interface';

@Injectable()
export class GeocoderService {
  geocode(address: GeocodedAddress['queried_address']): GeocodedAddress {
    return {
      queried_address: address,
      located_address: 'random hardcoded value',
      longitude: 1337,
      latitude: 42,
    };
  }
}
