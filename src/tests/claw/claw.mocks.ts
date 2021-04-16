import BigNumber from 'bignumber.js';
import { Token } from '../../mobx/model';
import store from '../../mobx/store';

export const mockTokens = {
	'0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28': getMockBbadger(),
	'0x758A43EE2BFf8230eeb784879CdcFF4828F2544D': getMockBslp(),
};

export const mockCollaterals = new Map(
	Object.entries({
		'0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28': 'bBADGER',
		'0x758A43EE2BFf8230eeb784879CdcFF4828F2544D': 'bSLP',
	}),
);

export const mockSyntheticData = [
	{
		address: '0x3F9E5Fc63b644797bd703CED7c29b57B1Bf0B220',
		collateralCurrency: '0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28',
		collateralRequirement: new BigNumber('0x10a741a462780000'),
		cumulativeFeeMultiplier: new BigNumber('0xde0b6b3a7640000'),
		expirationTimestamp: new BigNumber('0x60b2b960'),
		expiryPrice: new BigNumber('0x0'),
		globalCollateralizationRatio: new BigNumber('0x45d0deb866855'),
		liquidationLiveness: new BigNumber('0x1c20'),
		minSponsorTokens: new BigNumber('0x56bc75e2d63100000'),
		name: 'USD/bBadger 5-29',
		tokenCurrency: '0xA62F77D4b97Dc1CAE56C90517394Ce7554B1399A',
		totalPositionCollateral: new BigNumber('0x2f1025aba69135558'),
		totalTokensOutstanding: new BigNumber('0x95ae4b16411dadf45c3'),
		withdrawalLiveness: new BigNumber('0x1c20'),
	},
	{
		address: '0x5E4a8D011ef8d9E8B407cc87c68bD211B7ac72ab',
		collateralCurrency: '0x758A43EE2BFf8230eeb784879CdcFF4828F2544D',
		collateralRequirement: new BigNumber('0x10a741a462780000'),
		cumulativeFeeMultiplier: new BigNumber('0xde0b6b3a7640000'),
		expirationTimestamp: new BigNumber('0x60b2b960'),
		expiryPrice: new BigNumber('0x0'),
		globalCollateralizationRatio: new BigNumber('0x1f8620'),
		liquidationLiveness: new BigNumber('0x1c20'),
		minSponsorTokens: new BigNumber('0x56bc75e2d63100000'),
		name: 'USD-[bwBTC/ETH SLP] 5-29',
		tokenCurrency: '0xada279f9301C01A4eF914127a6C2a493Ad733924',
		totalPositionCollateral: new BigNumber('0x24291325f9'),
		totalTokensOutstanding: new BigNumber('0xfeb3eb2cdc7a63c0000'),
		withdrawalLiveness: new BigNumber('0x1c20'),
	},
];

export const mockSponsorInformationByEmp = new Map(
	Object.entries({
		'0x3F9E5Fc63b644797bd703CED7c29b57B1Bf0B220': {
			liquidations: [
				{
					state: 'Uninitialized',
					liquidationTime: new BigNumber(1618072065),
					tokensOutstanding: new BigNumber('299.299299299299299299').multipliedBy(10 ** 18),
					lockedCollateral: new BigNumber('467.467467467467467467').multipliedBy(10 ** 18),
					sponsor: '0xC26202cd0428276cC69017Df01137161f0102e55',
					liquidator: '0xC26202cd0428226cC69017Da01137161f0104da22',
					liquidatedCollateral: new BigNumber('395.395395395395395395').multipliedBy(10 ** 18),
					rawUnitCollateral: new BigNumber('773.773773773773773773').multipliedBy(10 ** 18),
					disputer: '0xC26202cd0428276cC69017Df01137161f0102e55',
					settlementPrice: new BigNumber('576.576576576576576576').multipliedBy(10 ** 18),
					finalFee: new BigNumber(33),
				},
			],
			pendingWithdrawal: true,
			position: {
				rawCollateral: new BigNumber('0x2f1025aba69135558'),
				tokensOutstanding: new BigNumber('0x95ae4b16411dadf45c3'),
				withdrawalRequestAmount: new BigNumber('0x2f1025aba69135558'),
				withdrawalRequestPassTimestamp: new BigNumber('0x606ba2e3'),
			},
		},
		'0x5E4a8D011ef8d9E8B407cc87c68bD211B7ac72ab': {
			liquidations: [
				{
					state: 'PreDispute',
					liquidationTime: new BigNumber(1612647282),
					tokensOutstanding: new BigNumber('147.147147147147147147').multipliedBy(10 ** 18),
					lockedCollateral: new BigNumber('264.264264264264264264').multipliedBy(10 ** 18),
					sponsor: '0xC26202cd0428276cC69017Df01137161f0102e55',
					liquidator: '0xC26202cd0428226cC69017Da01137161f0104da22',
					liquidatedCollateral: new BigNumber('613.613613613613613613').multipliedBy(10 ** 18),
					rawUnitCollateral: new BigNumber('551.551551551551551551').multipliedBy(10 ** 18),
					disputer: '0xC26202cd0428276cC69017Df01137161f0102e55',
					settlementPrice: new BigNumber('254.254254254254254254').multipliedBy(10 ** 18),
					finalFee: new BigNumber(33),
				},
			],
			pendingWithdrawal: true,
			position: {
				rawCollateral: new BigNumber('0x24291325f9'),
				tokensOutstanding: new BigNumber('0xfeb3eb2cdc7a63c0000'),
				withdrawalRequestAmount: new BigNumber('0x24291325f9'),
				withdrawalRequestPassTimestamp: new BigNumber('0x0'),
			},
		},
	}),
);

export const mockSyntheticDataByEmp = new Map(
	Object.entries({
		'0x3F9E5Fc63b644797bd703CED7c29b57B1Bf0B220': mockSyntheticData[0],
		'0x5E4a8D011ef8d9E8B407cc87c68bD211B7ac72ab': mockSyntheticData[1],
	}),
);

export const mockClawsByCollaterals = new Map(
	Object.entries({
		'0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28': new Map(
			Object.entries({
				'0x3F9E5Fc63b644797bd703CED7c29b57B1Bf0B220': 'USD/bBadger 5-29',
			}),
		),
		'0x758A43EE2BFf8230eeb784879CdcFF4828F2544D': new Map(
			Object.entries({
				'0x5E4a8D011ef8d9E8B407cc87c68bD211B7ac72ab': 'USD-[bwBTC/ETH SLP] 5-29',
			}),
		),
	}),
);

export const mockClaws = new Map(
	Object.entries({
		'0x3F9E5Fc63b644797bd703CED7c29b57B1Bf0B220': 'USD/bBadger 5-29',
		'0x5E4a8D011ef8d9E8B407cc87c68bD211B7ac72ab': 'USD-[bwBTC/ETH SLP] 5-29',
	}),
);

function getMockBbadger(): Token {
	const bBadger = new Token(store, '0x19D97D8fA813EE2f51aD4B4e04EA08bAf4DFfC28', 18);

	bBadger.update({
		balanceOf: new BigNumber('0x1c5174fe8b9cb5edbe'),
		decimals: 18,
		ethValue: new BigNumber('0x540f9e84667ab3'),
		name: 'bBADGER',
		symbol: 'bBADGER',
		totalSupply: new BigNumber('0x29130e4d1919f70d5fdf4'),
		position: 0,
		growth: [],
		balance: [],
		getPricePerFullShare: new BigNumber('0'),
		isSuperSett: false,
		withdrawAll: false,
	});

	return bBadger;
}

function getMockBslp(): Token {
	const bSlp = new Token(store, '0x758A43EE2BFf8230eeb784879CdcFF4828F2544D', 18);

	bSlp.update({
		balanceOf: new BigNumber('0x10f12354d6'),
		decimals: 18,
		ethValue: new BigNumber('0x14f38077bed256b2bf2800'),
		name: 'bSLP',
		symbol: 'bSLP',
		totalSupply: new BigNumber('0xd7c8d3d367121'),
		position: 0,
		growth: [],
		balance: [],
		getPricePerFullShare: new BigNumber('0'),
		isSuperSett: false,
		withdrawAll: false,
	});

	return bSlp;
}
