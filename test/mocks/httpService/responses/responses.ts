// this file was auto-generated at 2023-09-21T11:06:38.859Z, do not modify it
import { NfzQueuesApiResponse } from '../../../../src/modules/nfz/modules/queues/modules/api-client/interfaces/response.interface';
import { req_1_page_1 } from './req_1/response-page-1';
import { req_2_page_1 } from './req_2/response-page-1';
import { req_2_page_2 } from './req_2/response-page-2';
import { req_2_page_3 } from './req_2/response-page-3';
import { req_2_page_4 } from './req_2/response-page-4';
import { req_2_page_5 } from './req_2/response-page-5';
import { req_2_page_6 } from './req_2/response-page-6';
import { req_3_page_1 } from './req_3/response-page-1';
import { req_3_page_2 } from './req_3/response-page-2';
import { req_3_page_3 } from './req_3/response-page-3';

type MockedResponses = {
  [url: string]: NfzQueuesApiResponse;
};

export const mockedResponses: MockedResponses = {
  'https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endokryno&province=12&locality=KATOWICE':
    req_1_page_1,
  'https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endo&province=06':
    req_2_page_1,
  'https://api.nfz.gov.pl/app-itl-api/queues?page=2&limit=25&format=json&case=1&province=06&benefit=endo':
    req_2_page_2,
  'https://api.nfz.gov.pl/app-itl-api/queues?page=3&limit=25&format=json&case=1&province=06&benefit=endo':
    req_2_page_3,
  'https://api.nfz.gov.pl/app-itl-api/queues?page=4&limit=25&format=json&case=1&province=06&benefit=endo':
    req_2_page_4,
  'https://api.nfz.gov.pl/app-itl-api/queues?page=5&limit=25&format=json&case=1&province=06&benefit=endo':
    req_2_page_5,
  'https://api.nfz.gov.pl/app-itl-api/queues?page=6&limit=25&format=json&case=1&province=06&benefit=endo':
    req_2_page_6,
  'https://api.nfz.gov.pl/app-itl-api/queues?format=json&api-version=1.3&page=1&limit=25&case=1&benefitForChildren=false&benefit=endo&province=13':
    req_3_page_1,
  'https://api.nfz.gov.pl/app-itl-api/queues?page=2&limit=25&format=json&case=1&province=13&benefit=endo':
    req_3_page_2,
  'https://api.nfz.gov.pl/app-itl-api/queues?page=3&limit=25&format=json&case=1&province=13&benefit=endo':
    req_3_page_3,
};
