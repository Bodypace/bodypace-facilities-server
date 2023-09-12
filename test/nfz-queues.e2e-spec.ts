import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('NfzQueuesController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/nfz/queues (GET)', () => {
    return request(app.getHttpServer())
      .get('/nfz/queues')
      .expect(200)
      .expect('fetch all queues to a given benefit provided by NFZ in Poland');
  });
});
