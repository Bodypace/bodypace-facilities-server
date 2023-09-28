import { Module } from '@nestjs/common';
import { GeocoderService } from './geocoder.service';
import { GoogleGeocoderClientModule } from './modules/google-client/google-client.module';
import { GeocoderDatabaseModule } from './modules/database/database.module';

@Module({
  imports: [GoogleGeocoderClientModule, GeocoderDatabaseModule],
  providers: [GeocoderService],
  exports: [GeocoderService],
})
export class GeocoderModule {}
