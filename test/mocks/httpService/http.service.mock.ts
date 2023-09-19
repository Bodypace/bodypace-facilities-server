import { mockedResponses } from './responses/responses';

export function MockedHttpService() {
  return {
    axiosRef: {
      get: jest.fn().mockImplementation((url) => {
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
