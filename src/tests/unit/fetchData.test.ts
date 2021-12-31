import fetchMock from 'jest-fetch-mock';
import { fetchData } from '../../utils/fetchData';

describe('fetchData', () => {
	beforeEach(() => {
		fetchMock.resetMocks();
	});

	it('fetches data successfully', async () => {
		let fetches = 0;
		const message = 'Success';

		fetchMock.mockResponse(() => {
			fetches++;
			return Promise.resolve(JSON.stringify({ message }));
		});

		const [data, error] = await fetchData('/');

		expect(data).toStrictEqual({ message });
		expect(error).toBe(null);
		expect(fetches).toBe(1);
	});

	it('uses accessors correctly', async () => {
		const message = 'Success';

		fetchMock.mockResponse(JSON.stringify({ message }));

		const accessor = (res: any) => res['message'];
		const [data, error] = await fetchData('/', { accessor });

		expect(data).toBe(message);
		expect(error).toBe(null);
	});

	it('does not retry on bad request', async () => {
		let fetches = 0;
		const errorMessage = 'Bad Request';

		fetchMock.mockResponse(() => {
			fetches++;
			return Promise.resolve({ status: 400, body: errorMessage });
		});

		const [data, error] = await fetchData('/');

		expect(data).toBe(null);
		expect(error).toBe(errorMessage);
		expect(fetches).toBe(1);
	});

	it('retries multiple times on error request', async () => {
		let fetches = 0;
		const retries = 3;
		const errorMessage = 'Server Error';

		fetchMock.mockResponse(() => {
			fetches++;
			return Promise.resolve({ status: 500, body: errorMessage });
		});

		const [data, error] = await fetchData('/', { retries });

		expect(data).toBe(null);
		expect(error).toBe(errorMessage);
		expect(fetches).toBe(retries + 1); // count the initial request
	});
});
