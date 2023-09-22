import { Injectable, Logger } from '@nestjs/common';
import { DataSource, FindOptionsWhere, ILike } from 'typeorm';
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
    try {
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
    } catch (err) {
      this.logger.warn(
        `could not create a transaction for database: ${err.message}`,
      );
      return;
    }
  }

  private async getMatchingQueries(
    query: NfzQueuesApiQuery,
  ): Promise<CachedNfzQueuesQuery[]> {
    const queryBuilder = this.dataSource
      .getRepository(CachedNfzQueuesQuery)
      .createQueryBuilder('query')
      .where('(query.case = :case)', { case: query.case })
      .andWhere('(query.benefitForChildren LIKE :benefitForChildren)', {
        benefitForChildren: query.benefitForChildren.toUpperCase(),
      });

    if (query.benefit) {
      queryBuilder.andWhere(
        "(:benefit LIKE ('%' || query.benefit || '%') or query.benefit IS NULL)",
        { benefit: query.benefit.toUpperCase() },
      );
    } else {
      queryBuilder.andWhere('(query.benefit IS NULL)');
    }

    if (query.province) {
      queryBuilder.andWhere(
        '(query.province IS NULL OR query.province = :province)',
        { province: query.province },
      );
    } else {
      queryBuilder.andWhere('(query.province IS NULL)');
    }

    if (query.locality) {
      queryBuilder.andWhere(
        "(:locality LIKE (query.locality || '%') OR query.locality IS NULL)",
        { locality: query.locality.toUpperCase() },
      );
    } else {
      queryBuilder.andWhere('(query.locality IS NULL)');
    }

    const queries = await queryBuilder.getMany();
    return queries;
  }

  async get(query: NfzQueuesApiQuery): Promise<NfzQueuesApiQueue[] | null> {
    try {
      const queries = await this.getMatchingQueries(query);

      if (queries.length === 0) {
        return null;
      }

      const queuesRepository = this.dataSource.getRepository(CachedNfzQueue);

      const options: FindOptionsWhere<CachedNfzQueue> = {};

      if (query.benefit) {
        options.benefit = ILike(`%${query.benefit}%`);
      }

      if (query.province) {
        options.terytPlace = ILike(`${query.province * 2}%`);
      }

      if (query.locality) {
        options.locality = ILike(`${query.locality}%`);
      }

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
          ...options,
        },
      });

      return queues.map((queue) => fromCachedNfzQueue(queue));
    } catch (err) {
      this.logger.warn(`could not read data from database: ${err.message}`);
      return null;
    }
  }
}
