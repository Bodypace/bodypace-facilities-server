import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { NfzQueuesApiQuery } from './interfaces/query.interface';
import { NfzQueuesApiQueue } from './interfaces/queue.interface';
import { NfzQueuesApiUrlParams } from './interfaces/url-params.interface';

@Injectable()
export class NfzQueuesApiClientService {
  private readonly logger = new Logger(NfzQueuesApiClientService.name);
  private readonly nfzServerAddress = 'https://api.nfz.gov.pl';

  constructor(private readonly httpService: HttpService) {}

  private validateQuery(query: NfzQueuesApiQuery): void {
    this.logger.debug(`#validateQuery() query = ${JSON.stringify(query)}`);

    if (query.case !== 1 && query.case !== 2) {
      throw 'query passed to NfzQueuesApiClientService#fetchAll() has case that is neither 1 nor 2';
    }

    if (
      query.province !== undefined &&
      query.province !== null &&
      (query.province < 1 || query.province > 16)
    ) {
      throw 'query passed to NfzQueuesApiClientService#fetchAll() has province that is not in range [1, 16] (inclusive)';
    }

    if (query.locality && !query.province) {
      throw 'query passed to NfzQueuesApiClientService#fetchAll() must specify province when locality is specified.';
    }
  }

  private constructRequestUrl(params: NfzQueuesApiUrlParams): string {
    this.logger.debug(
      `#constructRequestUrlToNfzServer() params = ${JSON.stringify(params)}`,
    );

    let url =
      this.nfzServerAddress +
      '/app-itl-api/queues?format=json&api-version=1.3' +
      `&page=${params.page}` +
      `&limit=${params.limit}` +
      `&case=${params.case}` +
      `&benefitForChildren=${params.benefitForChildren}`;

    // NOTE: is encodeURIComponent unnecessary?
    if (params.benefit) {
      url += `&benefit=${encodeURIComponent(params.benefit)}`;
    }
    if (params.province) {
      url += `&province=${encodeURIComponent(
        String(params.province).padStart(2, '0'),
      )}`;
    }
    if (params.locality) {
      url += `&locality=${encodeURIComponent(params.locality)}`;
    }

    this.logger.debug(`#constructRequestUrlToNfzServer() url = ${url}`);

    return url;
  }

  async fetchAll(query: NfzQueuesApiQuery): Promise<NfzQueuesApiQueue[]> {
    this.logger.log(`#fetchAll() query = ${JSON.stringify(query)}`);
    this.validateQuery(query);

    const limit = 25;
    let url: string = this.constructRequestUrl({
      limit,
      page: 1,
      ...query,
    });

    const queues: NfzQueuesApiQueue[] = [];
    for (let callsCount = 0; ; ++callsCount) {
      this.logger.log(
        `#fetchAll() network request no. ${callsCount + 1}, url = ${url}`,
      );

      // TODO: do not use axiosRef
      const networkResponse = await this.httpService.axiosRef.get(url);
      const response = networkResponse.data;
      const fetchedQueues: NfzQueuesApiQueue[] = response.data;
      const fetchedNextRequestUrlPathAndQuery: string | null =
        response.links.next;

      let i = 0;
      fetchedQueues.forEach((queue: NfzQueuesApiQueue) => {
        this.logger.debug(`#fetchAll() adding queue to queues[], i = ${i}`);
        queues.push(queue);
        i += 1;
      });

      if (callsCount === 0) {
        const records = response.meta.count;
        this.logger.log(
          `#fetchAll() all queues = ${records}, pages = ${Math.ceil(
            records / limit,
          )}`,
        );
      }

      this.logger.debug(
        `#fetchAllQueuesFromNfzServer() after request queues[] len = ${queues.length}`,
      );

      if (!fetchedNextRequestUrlPathAndQuery) {
        break;
      }

      url = `${this.nfzServerAddress}${fetchedNextRequestUrlPathAndQuery}`;
      // url += `&benefitForChildren=${query.benefitForChildren}`;
      // url += '&api-version=1.3'
    }

    return queues;
  }
}
