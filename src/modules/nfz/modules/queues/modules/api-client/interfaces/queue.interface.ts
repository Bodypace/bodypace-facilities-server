export interface NfzQueuesApiQueueStatisticsProviderData {
  awaiting: number;
  removed: number;
  'average-period': number;
  update: string;
}

export interface NfzQueuesApiQueueStatistics {
  'provider-data'?: NfzQueuesApiQueueStatisticsProviderData;
  'computed-data': string | null;
}

export interface NfzQueuesApiQueueDates {
  applicable: boolean;
  date: string;
  'date-situation-as-at': string;
}

export interface NfzQueuesApiQueue {
  type: string;
  id: string;
  attributes: {
    case: number;
    benefit: string;
    'many-places': string;
    provider: string;
    'provider-code': string;
    'regon-provider': string;
    'nip-provider': string;
    'teryt-provider': string;
    place: string;
    address: string;
    locality: string;
    phone: string;
    'teryt-place': string;
    'registry-number': string;
    'id-resort-part-VII': string;
    'id-resort-part-VIII': string;
    'benefits-for-children': string | null;
    'covid-19': string;
    toilet: string;
    ramp: string;
    'car-park': string;
    elevator: string;
    latitude: number | null;
    longitude: number | null;
    statistics?: NfzQueuesApiQueueStatistics;
    dates?: NfzQueuesApiQueueDates;
    'benefits-provided'?: any;
  };
}
