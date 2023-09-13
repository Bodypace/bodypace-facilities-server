// TODO: npm run lint does not complain when below import has invalid path, fix this
import { NfzQueuesApiResponse } from '../../../../src/modules/nfz/modules/queues/modules/api-client/interfaces/response.interface';

export interface MockedNfzQueuesApiResponse {
  query: string;
  response: NfzQueuesApiResponse;
}
