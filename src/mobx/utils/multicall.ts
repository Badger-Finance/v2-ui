import { CallReturnContext } from 'ethereum-multicall';

export function parseCallReturnContext<T = any>(returnContext: CallReturnContext[]): T {
	let returnObject = {};

	for (const returnContextKey in returnContext) {
		const { returnValues, methodName } = returnContext[returnContextKey];

		returnObject = {
			...returnObject,
			[methodName]: returnValues,
		};
	}

	return returnObject as T;
}
