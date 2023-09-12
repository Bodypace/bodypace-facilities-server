import { Test, TestingModule } from '@nestjs/testing';
import { NfzQueuesApiClientService } from './api-client.service';

describe('NfzQueuesApiClientService ', () => {
  let nfzQueuesApiClientService: NfzQueuesApiClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NfzQueuesApiClientService],
    }).compile();

    nfzQueuesApiClientService = module.get<NfzQueuesApiClientService>(
      NfzQueuesApiClientService,
    );
  });

  it('should be defined', () => {
    expect(nfzQueuesApiClientService).toBeDefined();
  });

  describe('fetchAll()', () => {
    it('should return placeholder text', () => {
      expect(nfzQueuesApiClientService.fetchAll()).toBe(
        'fetch all queues to a given benefit provided by NFZ in Poland',
      );
    });
  });
});
