import { getDefaultRetryOptions } from '../config/constants';
import { PartialAttemptOptions, retry } from '@lifeomic/attempt';

export type FetchResult<T> = [T | null, string | null];

export interface FetchOptions<T, R> extends PartialAttemptOptions<FetchResult<T>> {
	accessor?: (res: R) => T;
}

export interface FetchParams<T, R = unknown> extends PartialAttemptOptions<FetchResult<T>> {
	url: string;
	options: FetchOptions<T, R>;
}

export async function fetchData<T, R = unknown>(
	url: string,
	options: FetchOptions<T, R> = {},
): Promise<FetchResult<T>> {
	const defaultRetryOptions = getDefaultRetryOptions<FetchResult<T>>();
	const { accessor, ...retryOptions } = options;

	const executeFetch = async (): Promise<FetchResult<T>> => {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		});

		if (!response.ok) {
			return [null, await response.text()];
		}

		const data = await response.json();

		return [accessor ? accessor(data) : data, null] as FetchResult<T>;
	};

	try {
		return retry(executeFetch, { ...defaultRetryOptions, ...retryOptions });
	} catch (error) {
		return [null, error];
	}
}
