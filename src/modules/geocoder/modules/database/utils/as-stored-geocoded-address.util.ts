import { StoredGeocodedAddress } from '../entities/geocoded-address.entity';
import { GeocodedAddress } from 'src/modules/geocoder/interfaces/geocoded-address.interface';

export function asStoredGeocodedAddress(
  geocodedAddress: GeocodedAddress,
): StoredGeocodedAddress {
  const storedGeocodedAddress = new StoredGeocodedAddress();
  storedGeocodedAddress.queried_address = geocodedAddress.queriedAddress;
  storedGeocodedAddress.located_address = geocodedAddress.locatedAddress;
  storedGeocodedAddress.latitude = geocodedAddress.latitude;
  storedGeocodedAddress.longitude = geocodedAddress.longitude;

  return storedGeocodedAddress;
}
