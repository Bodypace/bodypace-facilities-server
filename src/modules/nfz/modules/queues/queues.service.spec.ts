import { Test, TestingModule } from '@nestjs/testing';
import { NfzQueuesService } from './queues.service';
import { NfzQueuesApiClientModule } from './modules/api-client/api-client.module';
import { NfzQueuesApiClientService } from './modules/api-client/api-client.service';

const mockedValues = {
  api: {
    fetchAll: 'mocked fetchAll() value',
  },
};

function MockedNfzQueuesApiClientService() {
  return {
    fetchAll: jest.fn().mockReturnValue(mockedValues.api.fetchAll),
  };
}

describe('NfzQueuesService', () => {
  let nfzQueuesService: NfzQueuesService;
  let nfzQueuesApiClientService: NfzQueuesApiClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NfzQueuesApiClientModule],
      providers: [NfzQueuesService],
    })
      .overrideProvider(NfzQueuesApiClientService)
      .useValue(MockedNfzQueuesApiClientService())
      .compile();

    nfzQueuesService = module.get<NfzQueuesService>(NfzQueuesService);
    nfzQueuesApiClientService = module.get<NfzQueuesApiClientService>(
      NfzQueuesApiClientService,
    );
  });

  it('service should be defined', () => {
    expect(nfzQueuesService).toBeDefined();
  });

  it('nfzQueuesApiClientService should be defined', () => {
    expect(nfzQueuesApiClientService).toBeDefined();
  });

  describe('findAll()', () => {
    it('should call NfzQueuesApiClientService#fetchAll()', () => {
      nfzQueuesService.findAll();
      expect(nfzQueuesApiClientService.fetchAll).toHaveBeenCalledTimes(1);
    });

    it('should return result of NfzQueuesApiClientService#fetchAll()', () => {
      expect(nfzQueuesService.findAll()).toBe(mockedValues.api.fetchAll);
    });
  });
});
