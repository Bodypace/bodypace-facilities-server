import { mockedResponses } from './responses/responses';

export function MockedHttpService() {
  return {
    axiosRef: {
      get: jest.fn().mockImplementation((url: string) => {
        // mocked Google Geocoder responses
        //...
        if (
          url.startsWith(
            'https://maps.googleapis.com/maps/api/geocode/json?address',
          )
        ) {
          return Promise.resolve({
            data: {
              results: [
                {
                  formatted_address: 'mocked formatted addr',
                  geometry: {
                    location: {
                      lat: 55667788,
                      lng: 33441122,
                    },
                  },
                },
              ],
            },
          });
        }

        // mocked NFZ QUEUES API responses
        const response = mockedResponses[url];
        if (response === undefined) {
          return Promise.reject(
            `no such url in mocked responses: url = ${url}`,
          );
        }
        return Promise.resolve({ data: response });
      }),
    },
  };
}
