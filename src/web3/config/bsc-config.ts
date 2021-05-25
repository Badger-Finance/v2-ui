import { BadgerSett } from 'mobx/model/badger-sett';
import { BatchCallRequest } from 'web3/interface/batch-call-request';
import { Deploy } from 'web3/interface/deploy';
import { ProtocolTokens } from 'web3/interface/protocol-token';
import deploy from '../../config/deployments/bsc.json';
import { createChainBatchConfig } from './config-utils';
import { toRecord } from './token-config';

export const BSC_DEPLOY: Deploy = deploy;

export const bscSetts: BadgerSett[] = [
	{
		depositToken: {
			address: BSC_DEPLOY.tokens['pancake.BTCB-BNB'],
			decimals: 18,
		},
		vaultToken: {
			address: BSC_DEPLOY.sett_system.vaults['native.pancakeBnbBtcb'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: BSC_DEPLOY.tokens['pancake.bBADGER-BTCB'],
			decimals: 18,
		},
		vaultToken: {
			address: BSC_DEPLOY.sett_system.vaults['native.bBadgerBtcb'],
			decimals: 18,
		},
	},
	{
		depositToken: {
			address: BSC_DEPLOY.tokens['pancake.bDIGG-BTCB'],
			decimals: 18,
		},
		vaultToken: {
			address: BSC_DEPLOY.sett_system.vaults['native.bDiggBtcb'],
			decimals: 18,
		},
	},
];

const bscTokens = bscSetts.flatMap((sett) => [sett.depositToken, sett.vaultToken]);
export const bscProtocolTokens: ProtocolTokens = toRecord(bscTokens, 'address');

export const getBinanceSmartChainBatchRequests = (userAddress: string): BatchCallRequest[] => {
	const tokenAddresses = bscSetts.map((sett) => sett.depositToken.address);
	const settAddresses = bscSetts.map((sett) => sett.vaultToken.address);
	return createChainBatchConfig(tokenAddresses, settAddresses, [], userAddress);
};
