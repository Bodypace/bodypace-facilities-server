import { Test, TestingModule } from '@nestjs/testing';
import { NfzQueuesService } from './queues.service';
import { NfzQueuesApiClientModule } from './modules/api-client/api-client.module';
import { NfzQueuesApiClientService } from './modules/api-client/api-client.service';
import { NfzQueuesApiQuery } from './modules/api-client/interfaces/query.interface';

const mockedValues = {
  api: {
    fetchAll: 'mocked fetchAll() value',
  },
};

function MockedNfzQueuesApiClientService() {
  return {
    fetchAll: jest.fn().mockResolvedValue(mockedValues.api.fetchAll),
  };
}

describe('NfzQueuesService', () => {
  let nfzQueuesService: NfzQueuesService;
  let nfzQueuesApiClientService: NfzQueuesApiClientService;
  let query: NfzQueuesApiQuery;

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
    beforeEach(() => {
      query = {
        case: 1,
        benefitForChildren: 'false',
        benefit: 'endokrynolog',
        province: 12,
        locality: 'gliwice',
      };
    });

    it('should call NfzQueuesApiClientService#fetchAll() with the same query it got as argument', () => {
      nfzQueuesService.findAll(query);
      expect(nfzQueuesApiClientService.fetchAll).toHaveBeenCalledTimes(1);
      expect(nfzQueuesApiClientService.fetchAll).toHaveBeenCalledWith(query);
    });

    it('should return result of NfzQueuesApiClientService#fetchAll()', () => {
      expect(nfzQueuesService.findAll(query)).resolves.toBe(
        mockedValues.api.fetchAll,
      );
    });
  });
});
