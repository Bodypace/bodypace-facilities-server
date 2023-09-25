import { Module } from '@nestjs/common';
import { GoogleGeocoderClientService } from './google-client.service';

@Module({
  providers: [GoogleGeocoderClientService],
  exports: [GoogleGeocoderClientService],
})
export class GoogleGeocoderClientModule {}
