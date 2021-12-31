import buildRetry, { RequestInitWithRetry } from 'fetch-retry';

export const defaultFetchOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  retryOn: [500, 503],
};

export type FetchResult<T> = [T | null, string | null];

export interface FetchOptions<T, R> extends RequestInitWithRetry {
  accessor?: (res: R) => T;
}

export interface FetchParams<T, R = unknown> {
  url: string;
  options: FetchOptions<T, R>;
}

export async function fetchData<T, R = unknown>(
  url: string,
  options: FetchOptions<T, R> = {},
): Promise<FetchResult<T>> {
  const { accessor, ...fetchOptions } = options;
  const fetchRetry = buildRetry(fetch);

  try {
    const response = await fetchRetry(url, {
      ...defaultFetchOptions,
      ...fetchOptions,
    });

    if (!response.ok) {
      return [null, await response.text()];
    }

    const data = await response.json();
    return [accessor ? accessor(data) : data, null] as FetchResult<T>;
  } catch (error) {
    return [null, error.message || error];
  }
}
