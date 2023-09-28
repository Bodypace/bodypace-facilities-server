import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoogleGeocoderClientService } from './google-client.service';

@Module({
  imports: [HttpModule],
  providers: [GoogleGeocoderClientService],
  exports: [GoogleGeocoderClientService],
})
export class GoogleGeocoderClientModule {}
