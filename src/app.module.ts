import { Module } from '@nestjs/common';
import { NfzModule } from './nfz/nfz.module';

@Module({
  imports: [NfzModule],
})
export class AppModule {}
