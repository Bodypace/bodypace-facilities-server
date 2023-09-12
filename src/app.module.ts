import { Module } from '@nestjs/common';
import { NfzModule } from './modules/nfz/nfz.module';

@Module({
  imports: [NfzModule],
})
export class AppModule {}
