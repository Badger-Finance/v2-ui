import BigNumber from 'bignumber.js';
import { ContractSendMethod, EstimateGasOptions, SendOptions } from 'web3-eth-contract';

export const getSendOptions = async (
	method: ContractSendMethod,
	from: string,
	gasPrice: number,
): Promise<SendOptions> => {
	const gasWei = new BigNumber(gasPrice.toFixed(0));
	const options: EstimateGasOptions = {
		from,
		gas: gasWei.toNumber(),
	};
	const limit = await method.estimateGas(options);
	return {
		from,
		gas: Math.floor(limit * 1.2),
		gasPrice: gasWei.multipliedBy(1e9).toFixed(0),
	};
};
