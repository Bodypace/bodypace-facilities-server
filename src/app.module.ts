import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NfzModule } from './nfz/nfz.module';

@Module({
  imports: [NfzModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
