import { StoredGeocodedAddress } from '../entities/geocoded-address.entity';
import { GeocodedAddress } from 'src/modules/geocoder/interfaces/geocoded-address.interface';

export function fromStoredGeocodedAddress(
  storedGeocodedAddress: StoredGeocodedAddress,
): GeocodedAddress {
  return {
    queriedAddress: storedGeocodedAddress.queried_address,
    locatedAddress: storedGeocodedAddress.located_address,
    longitude: storedGeocodedAddress.longitude,
    latitude: storedGeocodedAddress.latitude,
  };
}
