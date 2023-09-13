import { NfzQueuesApiQueue } from './queue.interface';

export interface NfzQueuesApiResponseMetadata {
  context: string;
  count: number;
  title: string;
  page: number;
  url: string;
  limit: number;
  provider: string;
  'date-published': string;
  'date-modified': string;
  description: string;
  keywords: string;
  language: string;
  'content-type': string;
  'is-part-of': string;
  message: string | null;
}

export interface NfzQueuesApiResponseLinks {
  first: string;
  prev: string | null;
  self: string;
  next: string | null;
  last: string;
}

export interface NfzQueuesApiResponse {
  meta: NfzQueuesApiResponseMetadata;
  links: NfzQueuesApiResponseLinks;
  data: NfzQueuesApiQueue[];
}
