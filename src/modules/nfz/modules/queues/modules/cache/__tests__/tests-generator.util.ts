import { NfzQueuesApiQuery } from '../../api-client/interfaces/query.interface';
import { NfzQueuesApiQueue } from '../../api-client/interfaces/queue.interface';

export type NfzQueuesCacheServiceGeneratedTest = {
  for: {
    benefit: NfzQueuesApiQuery['benefit'];
    province: NfzQueuesApiQuery['province'];
    locality: NfzQueuesApiQuery['locality'];
  };
  getCallResolvesTo: ((queue: NfzQueuesApiQueue) => boolean) | null;
};

export type NfzQueuesCacheServiceGeneratedTests = {
  stored: {
    query: {
      benefit: NfzQueuesApiQuery['benefit'];
      province: NfzQueuesApiQuery['province'];
      locality: NfzQueuesApiQuery['locality'];
    };
  };
  tests: [string, NfzQueuesCacheServiceGeneratedTest][];
};

export const nfzQuesesCacheServiceGeneratedTestsSetEmpty: [
  string,
  NfzQueuesCacheServiceGeneratedTests,
][] = [
  [
    'skipped',
    {
      stored: {
        query: {
          benefit: '',
          province: 1,
          locality: '',
        },
      },
      tests: [
        [
          'skipped',
          {
            for: {
              benefit: '',
              province: 1,
              locality: '',
            },
            getCallResolvesTo: null,
          },
        ],
      ],
    },
  ],
];

export class NfzQueuesCacheServiceTestsGenerator {
  private static constructStringFilter(
    name: 'benefit' | 'locality',
    storedValue: string | undefined,
    value: string | undefined,
  ) {
    if (storedValue === undefined) {
      return value === undefined
        ? () => true
        : name === 'benefit'
        ? (queue: NfzQueuesApiQueue) =>
            queue.attributes[name].toUpperCase().includes(value.toUpperCase())
        : (queue: NfzQueuesApiQueue) =>
            queue.attributes[name]
              .toUpperCase()
              .startsWith(value.toUpperCase());
    }
    if (value === undefined) {
      return null;
    }
    if (name === 'benefit') {
      return value.toUpperCase().includes(storedValue.toUpperCase())
        ? (queue: NfzQueuesApiQueue) =>
            queue.attributes[name].toUpperCase().includes(value.toUpperCase())
        : null;
    } else {
      return value.toUpperCase().startsWith(storedValue.toUpperCase())
        ? (queue: NfzQueuesApiQueue) =>
            queue.attributes[name].toUpperCase().startsWith(value.toUpperCase())
        : null;
    }
  }

  private static constructNumberFilter(
    name: 'province',
    storedValue: number | undefined,
    value: number | undefined,
  ) {
    if (storedValue === undefined) {
      return value === undefined
        ? () => true
        : (queue: NfzQueuesApiQueue) =>
            Number(queue.attributes['teryt-place'].slice(0, 2)) / 2 === value;
    }
    if (value === undefined) {
      return null;
    }
    return storedValue === value
      ? (queue: NfzQueuesApiQueue) =>
          Number(queue.attributes['teryt-place'].slice(0, 2)) / 2 === value
      : null;
  }

  private static queryCombinations(
    benefits: NfzQueuesApiQuery['benefit'][],
    provinces: NfzQueuesApiQuery['province'][],
    localities: NfzQueuesApiQuery['locality'][],
    cb: (
      benefit: NfzQueuesApiQuery['benefit'],
      province: NfzQueuesApiQuery['province'],
      locality: NfzQueuesApiQuery['locality'],
    ) => void,
  ) {
    for (const benefit of benefits) {
      for (const province of provinces) {
        for (const locality of localities) {
          cb(benefit, province, locality);
        }
      }
    }
  }

  static generate() {
    const tests: [string, NfzQueuesCacheServiceGeneratedTests][] = [];

    this.queryCombinations(
      [undefined, 'endo', 'endoprotezoplastyka'],
      [undefined, 6, 13],
      [undefined, 'KRAKÓW', 'KIELCE'],
      (storedBenefit, storedProvince, storedLocality) => {
        const descriptionText = `stored queue with benefit = ${storedBenefit}, province = ${storedProvince}, locality = ${storedLocality}`;
        const generatedTests: NfzQueuesCacheServiceGeneratedTests = {
          stored: {
            query: {
              benefit: storedBenefit,
              province: storedProvince,
              locality: storedLocality,
            },
          },
          tests: [],
        };

        this.queryCombinations(
          [undefined, 'end', 'endo', 'endokrynolog', 'endoprotezoplastyka'],
          [undefined, 12, 6, 13],
          [undefined, 'RAK', 'KRAK', 'KRAKÓW', 'KRAKÓW-NOWA HUTA', 'KIELCE'],
          (benefit, province, locality) => {
            let shouldText = 'should return null';
            const generatedTest: NfzQueuesCacheServiceGeneratedTest = {
              for: {
                benefit,
                province,
                locality,
              },
              getCallResolvesTo: null,
            };

            const benefitFilter = this.constructStringFilter(
              'benefit',
              storedBenefit,
              benefit,
            );
            const provinceFilter = this.constructNumberFilter(
              'province',
              storedProvince,
              province,
            );
            const localityFilter = this.constructStringFilter(
              'locality',
              storedLocality,
              locality,
            );

            if (benefitFilter && provinceFilter && localityFilter) {
              shouldText = 'should return correct subset of queues';
              generatedTest.getCallResolvesTo = (queue: NfzQueuesApiQueue) => {
                return (
                  benefitFilter!(queue) &&
                  provinceFilter!(queue) &&
                  localityFilter!(queue)
                );
              };
            }

            generatedTests.tests.push([shouldText, generatedTest]);
          },
        );

        tests.push([descriptionText, generatedTests]);
      },
    );

    return tests;
  }
}
