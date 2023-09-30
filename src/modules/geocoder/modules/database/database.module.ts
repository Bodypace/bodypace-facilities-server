import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeocoderDatabaseService } from './database.service';
import { StoredGeocodedAddress } from './entities/geocoded-address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoredGeocodedAddress])],
  providers: [GeocoderDatabaseService],
  exports: [GeocoderDatabaseService],
})
export class GeocoderDatabaseModule {}
