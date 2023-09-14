import { Injectable } from '@nestjs/common';
import { NfzQueuesApiQuery } from '../api-client/interfaces/query.interface';
import { NfzQueuesApiQueue } from '../api-client/interfaces/queue.interface';

interface CacheRecord {
  query: NfzQueuesApiQuery;
  queues: NfzQueuesApiQueue[];
}

@Injectable()
export class NfzQueuesCacheService {
  private records: CacheRecord[] = [];

  private queriesMatch(
    left: NfzQueuesApiQuery,
    right: NfzQueuesApiQuery,
  ): boolean {
    if (left.case !== right.case) {
      return false;
    }

    if (left.benefitForChildren !== right.benefitForChildren) {
      if (
        left.benefitForChildren === undefined ||
        right.benefitForChildren === undefined
      ) {
        return false;
      }
      if (
        left.benefitForChildren.toLowerCase() !==
        right.benefitForChildren.toLowerCase()
      ) {
        return false;
      }
    }

    if (left.benefit !== right.benefit) {
      if (left.benefit === undefined || right.benefit === undefined) {
        return false;
      }
      if (left.benefit.toLowerCase() !== right.benefit.toLowerCase()) {
        return false;
      }
    }

    if (left.province !== right.province) {
      return false;
    }

    if (left.locality !== right.locality) {
      if (left.locality === undefined || right.locality === undefined) {
        return false;
      }
      if (left.locality.toLowerCase() !== right.locality.toLowerCase()) {
        return false;
      }
    }

    return true;
  }

  store(query: NfzQueuesApiQuery, queues: NfzQueuesApiQueue[]): void {
    this.records.push({
      query: Object.assign({}, query),
      queues,
    });
  }

  get(query: NfzQueuesApiQuery): NfzQueuesApiQueue[] | null {
    const matchingRecord = this.records.find((record) =>
      this.queriesMatch(query, record.query),
    );

    return matchingRecord ? matchingRecord.queues : null;
  }
}
