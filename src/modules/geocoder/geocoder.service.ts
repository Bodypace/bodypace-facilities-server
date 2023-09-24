import { Injectable } from '@nestjs/common';
import { GeocodedAddress } from './interfaces/geocoded-address.interface';

@Injectable()
export class GeocoderService {
  geocode(address: GeocodedAddress['queriedAddress']): GeocodedAddress {
    return {
      queriedAddress: address,
      locatedAddress: 'random hardcoded value',
      longitude: 1337,
      latitude: 42,
    };
  }
}
