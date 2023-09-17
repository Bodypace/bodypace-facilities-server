import { Injectable, Logger } from '@nestjs/common';
import { DataSource, ILike, IsNull } from 'typeorm';
import { NfzQueuesApiQuery } from '../api-client/interfaces/query.interface';
import { NfzQueuesApiQueue } from '../api-client/interfaces/queue.interface';
import { CachedNfzQueue } from './entities/cached-queue.entity';
import { CachedNfzQueuesQuery } from './entities/cached-queues-query.entity';
import { asCachedNfzQueue } from './utils/as-cached-nfz-queue.util';
import { asCachedNfzQueuesQuery } from './utils/as-cached-nfz-queues-query.util';
import { fromCachedNfzQueue } from './utils/from-cached-nfz-queue.util';

@Injectable()
export class NfzQueuesCacheService {
  private readonly logger = new Logger(NfzQueuesCacheService.name);

  constructor(private dataSource: DataSource) {}

  async store(
    query: NfzQueuesApiQuery,
    queues: NfzQueuesApiQueue[],
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const cachedQuery = asCachedNfzQueuesQuery(query);
      await queryRunner.manager.save(cachedQuery);

      if (!cachedQuery.id) {
        throw 'could not obtain new cached request id';
      }

      for (const queue of queues) {
        const cachedQueue = asCachedNfzQueue(queue, cachedQuery);
        await queryRunner.manager.save(cachedQueue);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      this.logger.warn(`could not store data: ${err.message}`);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async get(query: NfzQueuesApiQuery): Promise<NfzQueuesApiQueue[] | null> {
    const queriesRepository =
      this.dataSource.getRepository(CachedNfzQueuesQuery);

    const queries = await queriesRepository.findBy({
      case: query.case,
      benefitForChildren: ILike(query.benefitForChildren),
      benefit: query.benefit ? ILike(query.benefit) : IsNull(),
      province: query.province ? query.province : IsNull(),
      locality: query.locality ? ILike(query.locality) : IsNull(),
    });

    if (queries.length === 0) {
      return null;
    }

    const queuesRepository = this.dataSource.getRepository(CachedNfzQueue);

    const queues = await queuesRepository.find({
      relations: {
        cachedQuery: true,
        statistics: {
          providerData: true,
        },
        dates: true,
        benefitsProvided: true,
      },
      where: {
        cachedQuery: {
          id: queries[queries.length - 1].id,
        },
      },
    });

    return queues.map((queue) => fromCachedNfzQueue(queue));
  }
}
