import { ResponseQueryTx, unmarshalTypedPackValue } from '@renproject/rpc/build/main/v2';

export const unmarshalClaimFeesTx = (response: ResponseQueryTx) => {
	let out;

	const inValue = unmarshalTypedPackValue(response.tx.in);

	if (response.tx.out) {
		out = unmarshalTypedPackValue(response.tx.out);

		// Temporary fix to support v0.4.
		if (out.revert && out.revert.length === 0) {
			out.revert = undefined;
		}
	}

	return {
		version: response.tx.version ? parseInt(response.tx.version) : undefined,
		hash: response.tx.hash,
		txStatus: response.txStatus,
		to: response.tx.selector,
		in: inValue,
		out,
	};
};
