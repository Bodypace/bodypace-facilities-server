import { Test, TestingModule } from '@nestjs/testing';
import { NfzQueuesCacheService } from './cache.service';
import { NfzQueuesApiQuery } from '../api-client/interfaces/query.interface';
import { NfzQueuesApiQueue } from '../api-client/interfaces/queue.interface';

describe('NfzQueuesCacheService', () => {
  let nfzQueuesCacheService: NfzQueuesCacheService;
  let query: NfzQueuesApiQuery;
  let queues: NfzQueuesApiQueue[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NfzQueuesCacheService],
    }).compile();

    nfzQueuesCacheService = module.get<NfzQueuesCacheService>(
      NfzQueuesCacheService,
    );
  });

  it('should be defined', () => {
    expect(nfzQueuesCacheService).toBeDefined();
  });

  describe('store() and get()', () => {
    describe('get() - with no data stored', () => {
      beforeEach(() => {
        query = {
          case: 1,
          benefitForChildren: 'false',
          benefit: 'laryngolog',
          province: 4,
          locality: 'MARS BASE no.3',
        };
      });

      it('should return null when called random query', () => {
        expect(nfzQueuesCacheService.get(query)).toBeNull();
      });
    });

    describe('get() - with data stored', () => {
      beforeEach(() => {
        query = {
          case: 1,
          benefitForChildren: 'false',
          benefit: 'laryngolog',
          province: 4,
          locality: 'MARS BASE no.3',
        };
        queues = [];

        nfzQueuesCacheService.store(query, queues);
      });

      it('should return stored queues for correct query', () => {
        expect(nfzQueuesCacheService.get(query)).toStrictEqual(queues);
      });

      it('should return stored queues for correct query but benefitForChildren is not strict-case equal', () => {
        expect(
          nfzQueuesCacheService.get({ ...query, benefitForChildren: 'FalSE' }),
        ).toStrictEqual(queues);
      });

      it('should return stored queues for correct query but benefit is not strict-case equal', () => {
        expect(
          nfzQueuesCacheService.get({ ...query, benefit: 'laRYNGOloG' }),
        ).toStrictEqual(queues);
      });

      it('should return stored queues for correct query but locality is not strict-case equal', () => {
        expect(
          nfzQueuesCacheService.get({ ...query, locality: 'MARS base NO.3' }),
        ).toStrictEqual(queues);
      });

      it('should return null when called with different case', () => {
        expect(nfzQueuesCacheService.get({ ...query, case: 2 })).toBeNull();
      });

      it('should return null when called with different benefitForChildren', () => {
        expect(
          nfzQueuesCacheService.get({ ...query, benefitForChildren: 'true' }),
        ).toBeNull();
      });

      it('should return null when called with different benefit', () => {
        expect(
          nfzQueuesCacheService.get({ ...query, benefit: 'laryngo' }),
        ).toBeNull();
      });

      it('should return null when called with different province', () => {
        expect(nfzQueuesCacheService.get({ ...query, province: 5 })).toBeNull();
      });

      it('should return null when called with different locality', () => {
        expect(
          nfzQueuesCacheService.get({ ...query, locality: 'MARS BASE no 3' }),
        ).toBeNull();
      });

      it('should return null when called with no benefit', () => {
        delete query.benefit;
        expect(nfzQueuesCacheService.get(query)).toBeNull();
      });

      it('should return null when called with no province', () => {
        delete query.province;
        expect(nfzQueuesCacheService.get(query)).toBeNull();
      });

      it('should return null when called with no locality', () => {
        delete query.locality;
        expect(nfzQueuesCacheService.get(query)).toBeNull();
      });
    });
  });
});
