import { CachedNfzQueue } from '../entities/cached-queue.entity';
import { NfzQueuesApiQueue } from '../../api-client/interfaces/queue.interface';

export function fromCachedNfzQueue(
  cachedQueue: CachedNfzQueue,
): NfzQueuesApiQueue {
  return {
    type: cachedQueue.type,
    id: cachedQueue.queueId,
    attributes: {
      case: cachedQueue.case,
      benefit: cachedQueue.benefit,
      'many-places': cachedQueue.manyPlaces,
      provider: cachedQueue.provider,
      'provider-code': cachedQueue.providerCode,
      'regon-provider': cachedQueue.regonProvider,
      'nip-provider': cachedQueue.nipProvider,
      'teryt-provider': cachedQueue.terytProvider,
      place: cachedQueue.place,
      address: cachedQueue.address,
      locality: cachedQueue.locality,
      phone: cachedQueue.phone,
      'teryt-place': cachedQueue.terytPlace,
      'registry-number': cachedQueue.registryNumber,
      'id-resort-part-VII': cachedQueue.idResortPartVII,
      'id-resort-part-VIII': cachedQueue.idResortPartVIII,
      'benefits-for-children': cachedQueue.benefitsForChildren || null,
      'covid-19': cachedQueue.covid19,
      toilet: cachedQueue.toilet,
      ramp: cachedQueue.ramp,
      'car-park': cachedQueue.carPark,
      elevator: cachedQueue.elevator,
      latitude: cachedQueue.latitude ? Number(cachedQueue.latitude) : null,
      longitude: cachedQueue.longitude ? Number(cachedQueue.longitude) : null,
      statistics: cachedQueue.statistics
        ? {
            'provider-data': cachedQueue.statistics.providerData
              ? {
                  awaiting: cachedQueue.statistics.providerData.awaiting,
                  removed: cachedQueue.statistics.providerData.removed,
                  'average-period':
                    cachedQueue.statistics.providerData.averagePeriod,
                  update: cachedQueue.statistics.providerData.update,
                }
              : null,
            'computed-data': cachedQueue.statistics.computedData || null,
          }
        : null,
      dates: cachedQueue.dates
        ? {
            applicable: cachedQueue.dates.applicable,
            date: cachedQueue.dates.date,
            'date-situation-as-at': cachedQueue.dates.dateSituationAsAt,
          }
        : null,
      'benefits-provided': cachedQueue.benefitsProvided
        ? {
            'type-of-benefit': cachedQueue.benefitsProvided.typeOfBenefit,
            year: cachedQueue.benefitsProvided.year,
            amount: cachedQueue.benefitsProvided.amount,
          }
        : null,
    },
  };
}
