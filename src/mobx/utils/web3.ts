import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { ContractSendMethod, EstimateGasOptions, SendOptions } from 'web3-eth-contract';
import { TokenContract } from '../model';

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

export const erc20Methods = (connectedAddress: string, token: TokenContract): any[] => {
	if (!!connectedAddress && !!token.contract) {
		// get allowance of each vault

		return [
			{
				name: 'balanceOf',
				args: [Web3.utils.toChecksumAddress(connectedAddress)],
			},
			{
				name: 'totalSupply',
			},
			{
				name: 'symbol',
			},
			{
				name: 'allowance',
				args: [Web3.utils.toChecksumAddress(connectedAddress), Web3.utils.toChecksumAddress(token.contract)],
			},
		];
	} else {
		return [];
	}
};
