import { Network as NetworkModel } from 'mobx/model/network/network';
import { getRebase } from 'config/system/rebase';
import { Network } from '@badger-dao/sdk';
import { BigNumber } from 'ethers';

const UPPER_LIMIT = 1.05 * 1e18;
const LOWER_LIMIT = 0.95 * 1e18;

export const getDiggExchangeRates = (): Promise<any> => {
	return fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,wrapped-bitcoin&vs_currencies=usd,btc', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
	}).then((response) => response.json());
};

// for dynamically calculating new supply if rebased triggered with supplied oracle rate
export const calculateNewSupply = (oracleRate: number, currentSupply: number, rebaseLag: number): number => {
	if (oracleRate <= UPPER_LIMIT && oracleRate >= LOWER_LIMIT) {
		return currentSupply;
	}
	const rebaseAmount = currentSupply * ((oracleRate - 1) / rebaseLag);
	return currentSupply + rebaseAmount;
};

export const getNextRebase = (minRebaseDurationSec: number, lastRebaseTimestampSec: number): Date => {
	const nextRebase = minRebaseDurationSec + lastRebaseTimestampSec;
	return new Date(nextRebase * 1000);
};

// get percentage value of time to available rebase (for displaying in a timebar)
export const getTimeBarPercentage = (minRebaseDurationSec: number, countDown: number): number => {
	return Math.max(((minRebaseDurationSec - countDown) / minRebaseDurationSec) * 100, 0);
};

// convert seconds to HH:MM:SS to display countdown (can be used with getRebaseCountdown's result)
export const toHHMMSS = (secs: string): string => {
	const sec_num = parseInt(secs, 10);
	const hours = Math.floor(sec_num / 3600);
	const minutes = Math.floor(sec_num / 60) % 60;
	const seconds = sec_num % 60;

	return [hours, minutes, seconds]
		.map((v) => (v < 10 ? '0' + v : v))
		.filter((v, i) => v !== '00' || i > 0)
		.join(':');
};

// TODO: Capture some typing
export const getRebaseLogs = async (provider: any, network: NetworkModel): Promise<any> => {
	if (network.symbol !== Network.Ethereum) {
		return;
	}
	const rebaseConfig = getRebase(network.symbol);
	if (!rebaseConfig) {
		return;
	}
	const policy = rebaseConfig.digg[1];
	const contractInstance = new web3.eth.Contract(policy.abi as AbiItem[], policy.addresses[0]);
	const events = await contractInstance.getPastEvents('LogRebase', {
		fromBlock: 11663433,
		toBlock: 'latest',
	});
	return events.length ? events[events.length - 1].returnValues : null;
};

export const getPercentageChange = (newValue: BigNumber, originalValue: BigNumber): number => {
	return newValue.sub(originalValue).div(originalValue).mul(100).toNumber();
};
