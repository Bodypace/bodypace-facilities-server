import { Module } from '@nestjs/common';
import { GeocoderDatabaseService } from './database.service';

@Module({
  providers: [GeocoderDatabaseService],
  exports: [GeocoderDatabaseService],
})
export class GeocoderDatabaseModule {}
