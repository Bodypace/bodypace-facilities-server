import { Test, TestingModule } from '@nestjs/testing';
import { NfzQueuesController } from './queues.controller';
import { NfzQueuesService } from './queues.service';

describe('NfzQueuesController', () => {
  let nfzQueuesController: NfzQueuesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NfzQueuesController],
      providers: [NfzQueuesService],
    }).compile();

    nfzQueuesController = app.get<NfzQueuesController>(NfzQueuesController);
  });

  it('should be defined', () => {
    expect(nfzQueuesController).toBeDefined();
  });

  describe('findAll()', () => {
    it('should return placeholder text', () => {
      expect(nfzQueuesController.findAll()).toBe(
        'returns all queues to healthcare benefits provided by NFZ in Poland',
      );
    });
  });
});
