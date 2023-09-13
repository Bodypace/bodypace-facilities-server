import { NfzQueuesApiQuery } from './query.interface';

export interface NfzQueuesApiUrlParams extends NfzQueuesApiQuery {
  page: number;
  limit: number;
}
