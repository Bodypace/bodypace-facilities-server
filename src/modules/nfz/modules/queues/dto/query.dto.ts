import { NfzQueuesApiQuery } from '../modules/api-client/interfaces/query.interface';

export class NfzQueuesQuery implements NfzQueuesApiQuery {
  case: number;
  benefitForChildren: string;
  benefit?: string;
  province?: number;
  locality?: string;
}
