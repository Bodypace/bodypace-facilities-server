import { NfzQueuesApiQueue } from '../../api-client/interfaces/queue.interface';
import {
  CachedNfzQueueStatisticsProviderData,
  CachedNfzQueueStatistics,
  CachedNfzQueueDates,
  CachedNfzQueue,
  CachedNfzQueueBenefitsProvided,
} from '../entities/cached-queue.entity';
import { CachedNfzQueuesQuery } from '../entities/cached-queues-query.entity';

export function asCachedNfzQueue(
  queue: NfzQueuesApiQueue,
  cachedQuery: CachedNfzQueuesQuery,
): CachedNfzQueue {
  const cachedQueue = new CachedNfzQueue();
  cachedQueue.type = queue['type'];
  cachedQueue.queueId = queue['id'];
  cachedQueue.case = queue.attributes['case'];
  cachedQueue.benefit = queue.attributes['benefit'];
  cachedQueue.manyPlaces = queue.attributes['many-places'];
  cachedQueue.provider = queue.attributes['provider'];
  cachedQueue.providerCode = queue.attributes['provider-code'];
  cachedQueue.regonProvider = queue.attributes['regon-provider'];
  cachedQueue.nipProvider = queue.attributes['nip-provider'];
  cachedQueue.terytProvider = queue.attributes['teryt-provider'];
  cachedQueue.place = queue.attributes['place'];
  cachedQueue.address = queue.attributes['address'];
  cachedQueue.locality = queue.attributes['locality'];
  cachedQueue.phone = queue.attributes['phone'];
  cachedQueue.terytPlace = queue.attributes['teryt-place'];
  cachedQueue.registryNumber = queue.attributes['registry-number'];
  cachedQueue.idResortPartVII = queue.attributes['id-resort-part-VII'];
  cachedQueue.idResortPartVIII = queue.attributes['id-resort-part-VIII'];
  cachedQueue.benefitsForChildren =
    queue.attributes['benefits-for-children'] || undefined;
  cachedQueue.covid19 = queue.attributes['covid-19'];
  cachedQueue.toilet = queue.attributes['toilet'];
  cachedQueue.ramp = queue.attributes['ramp'];
  cachedQueue.carPark = queue.attributes['car-park'];
  cachedQueue.elevator = queue.attributes['elevator'];
  cachedQueue.latitude = queue.attributes['latitude']
    ? String(queue.attributes['latitude'])
    : undefined;
  cachedQueue.longitude = queue.attributes['longitude']
    ? String(queue.attributes['longitude'])
    : undefined;

  if (queue.attributes['statistics']) {
    const cachedQueueStatistics = new CachedNfzQueueStatistics();

    if (queue.attributes['statistics']['provider-data']) {
      const cachedQueueStatisticsProviderData =
        new CachedNfzQueueStatisticsProviderData();
      cachedQueueStatisticsProviderData.awaiting =
        queue.attributes['statistics']['provider-data']['awaiting'];
      cachedQueueStatisticsProviderData.removed =
        queue.attributes['statistics']['provider-data']['removed'];
      cachedQueueStatisticsProviderData.averagePeriod =
        queue.attributes['statistics']['provider-data']['average-period'];
      cachedQueueStatisticsProviderData.update =
        queue.attributes['statistics']['provider-data']['update'];
      cachedQueueStatistics.providerData = cachedQueueStatisticsProviderData;
    }

    cachedQueueStatistics.computedData =
      queue.attributes['statistics']['computed-data'] || undefined;
    cachedQueue.statistics = cachedQueueStatistics;
  }

  if (queue.attributes['dates']) {
    const cachedQueueDates = new CachedNfzQueueDates();
    cachedQueueDates.applicable = queue.attributes['dates']['applicable'];
    cachedQueueDates.date = queue.attributes['dates']['date'];
    cachedQueueDates.dateSituationAsAt =
      queue.attributes['dates']['date-situation-as-at'];
    cachedQueue.dates = cachedQueueDates;
  }

  if (queue.attributes['benefits-provided']) {
    const cachedQueueBenefitsProvided = new CachedNfzQueueBenefitsProvided();
    cachedQueueBenefitsProvided.typeOfBenefit =
      queue.attributes['benefits-provided']['type-of-benefit'];
    cachedQueueBenefitsProvided.year =
      queue.attributes['benefits-provided']['year'];
    cachedQueueBenefitsProvided.amount =
      queue.attributes['benefits-provided']['amount'];
    cachedQueue.benefitsProvided = cachedQueueBenefitsProvided;
  }

  cachedQueue.cachedQuery = cachedQuery;
  return cachedQueue;
}
