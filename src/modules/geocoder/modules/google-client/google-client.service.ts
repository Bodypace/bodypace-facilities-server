import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GeocodedAddress } from '../../interfaces/geocoded-address.interface';
import { AxiosResponse } from 'axios';

@Injectable()
export class GoogleGeocoderClientService {
  constructor(private readonly httpService: HttpService) {}

  async fetch(
    address: GeocodedAddress['queriedAddress'],
  ): Promise<GeocodedAddress> {
    const googleGeocoderApiKey: string =
      process.env['GOOGLE_GEOCODER_API_KEY'] || '';

    const googleGeocoderRequestUrl: string =
      'https://maps.googleapis.com/maps/api/geocode/json?address=' +
      encodeURIComponent(address) +
      `&key=${googleGeocoderApiKey}`;

    let googleGeocoderResponse: AxiosResponse<any, any>;
    try {
      // TODO: use rxjs, not axiosRef
      googleGeocoderResponse = await this.httpService.axiosRef.get(
        googleGeocoderRequestUrl,
      );
    } catch (err) {
      throw 'An error happened while requesting google geocoder';
    }

    const googleGeocoderResponseTopResult =
      googleGeocoderResponse.data.results[0];

    return {
      queriedAddress: address,
      locatedAddress: googleGeocoderResponseTopResult.formatted_address,
      latitude: googleGeocoderResponseTopResult.geometry.location.lat,
      longitude: googleGeocoderResponseTopResult.geometry.location.lng,
    };
  }
}
