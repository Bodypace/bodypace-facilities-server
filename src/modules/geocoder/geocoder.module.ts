import { Module } from '@nestjs/common';
import { GeocoderService } from './geocoder.service';
import { GoogleGeocoderClientModule } from './modules/google-client/google-client.module';

@Module({
  imports: [GoogleGeocoderClientModule],
  providers: [GeocoderService],
  exports: [GeocoderService],
})
export class GeocoderModule {}
