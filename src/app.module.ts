import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfzModule } from './modules/nfz/nfz.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      autoLoadEntities: true,
      synchronize: false,
    }),
    NfzModule,
  ],
})
export class AppModule {}
