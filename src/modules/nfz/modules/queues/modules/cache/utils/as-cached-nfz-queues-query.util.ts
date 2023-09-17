import { NfzQueuesApiQuery } from '../../api-client/interfaces/query.interface';
import { CachedNfzQueuesQuery } from '../entities/cached-queues-query.entity';

export function asCachedNfzQueuesQuery(
  query: NfzQueuesApiQuery,
): CachedNfzQueuesQuery {
  const cachedQuery = new CachedNfzQueuesQuery();
  cachedQuery.case = query.case;
  cachedQuery.benefitForChildren = query.benefitForChildren;
  cachedQuery.benefit = query.benefit;
  cachedQuery.province = query.province;
  cachedQuery.locality = query.locality;
  return cachedQuery;
}
