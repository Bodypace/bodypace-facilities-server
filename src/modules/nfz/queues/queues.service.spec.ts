import { Test, TestingModule } from '@nestjs/testing';
import { NfzQueuesService } from './queues.service';

describe('NfzQueuesService', () => {
  let nfzQueuesService: NfzQueuesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NfzQueuesService],
    }).compile();

    nfzQueuesService = module.get<NfzQueuesService>(NfzQueuesService);
  });

  it('should be defined', () => {
    expect(nfzQueuesService).toBeDefined();
  });

  describe('findAll()', () => {
    it('should return placeholder text', () => {
      expect(nfzQueuesService.findAll()).toBe(
        'returns all queues to healthcare benefits provided by NFZ in Poland',
      );
    });
  });
});
