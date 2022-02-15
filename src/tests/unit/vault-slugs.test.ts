import { BouncerType, Protocol, Vault, VaultState, VaultType } from '@badger-dao/sdk';
import { getVaultsSlugCache } from '../../mobx/utils/helpers';

jest.doMock('slugify', () => ({
	default: jest.fn().mockImplementation((name: string) => name),
}));

const sampleVaults: Vault[] = [
	{
		name: 'renBTC/wBTC/sBTC',
		asset: 'crvsBTC',
		vaultAsset: 'bcrvsBTC',
		state: VaultState.Open,
		underlyingToken: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
		vaultToken: '0xd04c48A53c111300aD41190D63681ed3dAd998eC',
		value: 12374.194805233132,
		available: 0,
		balance: 880.926094717279,
		protocol: Protocol.Convex,
		pricePerFullShare: 1.014745586208039,
		tokens: [],
		apr: 0.7684507208021384,
		boost: {
			enabled: false,
			weight: 10000,
		},
		sources: [],
		bouncer: BouncerType.None,
		strategy: {
			address: '0xCce0D2d1Eb2310F7e67e128bcFE3CE870A3D3a3d',
			withdrawFee: 10,
			performanceFee: 2000,
			strategistFee: 0,
		},
		type: VaultType.Standard,
	},
	{
		name: 'CVX',
		asset: 'CVX',
		vaultAsset: 'bCVX',
		state: VaultState.Open,
		underlyingToken: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
		vaultToken: '0x53C8E199eb2Cb7c01543C137078a038937a68E40',
		value: 669.2225980934912,
		available: 0,
		balance: 76966.63681340951,
		protocol: Protocol.Convex,
		pricePerFullShare: 1.0898615700210026,
		tokens: [],
		apr: 0,
		boost: {
			enabled: false,
			weight: 0,
		},
		sources: [],
		bouncer: BouncerType.None,
		strategy: {
			address: '0xBCee2c6CfA7A4e29892c3665f464Be5536F16D95',
			withdrawFee: 10,
			performanceFee: 1000,
			strategistFee: 0,
		},
		type: VaultType.Standard,
	},
	{
		name: 'CVX',
		asset: 'CVX',
		vaultAsset: 'bveCVX',
		state: VaultState.Open,
		underlyingToken: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
		vaultToken: '0xfd05D3C7fe2924020620A8bE4961bBaA747e6305',
		value: 9942.779677051958,
		available: 0,
		balance: 1143509.3711711436,
		protocol: Protocol.Convex,
		pricePerFullShare: 1,
		tokens: [],
		apr: 69.12878447730935,
		boost: {
			enabled: false,
			weight: 0,
		},
		sources: [],
		bouncer: BouncerType.None,
		strategy: {
			address: '0x3ff634ce65cDb8CC0D569D6d1697c41aa666cEA9',
			withdrawFee: 10,
			performanceFee: 0,
			strategistFee: 0,
		},
		type: VaultType.Standard,
	},
	{
		name: 'CVX',
		asset: 'CVX',
		vaultAsset: 'bveCVX',
		state: VaultState.Open,
		underlyingToken: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
		vaultToken: '0xfd05D3C7fe2924020620A8bE4961bBaA747e6306',
		value: 9942.779677051958,
		available: 0,
		balance: 1143509.3711711436,
		protocol: Protocol.Convex,
		pricePerFullShare: 1,
		tokens: [],
		apr: 69.12878447730935,
		boost: {
			enabled: false,
			weight: 0,
		},
		sources: [],
		bouncer: BouncerType.None,
		strategy: {
			address: '0x3ff634ce65cDb8CC0D569D6d1697c41aa666cEA9',
			withdrawFee: 10,
			performanceFee: 0,
			strategistFee: 0,
		},
		type: VaultType.Standard,
	},
];

describe('getVaultsSlugCache', () => {
	it('creates vaults slug cache correctly', () => {
		const expectedSlugs = {
			[sampleVaults[0].vaultToken]: 'convex-renbtc-wbtc-sbtc',
			[sampleVaults[1].vaultToken]: 'convex-cvx',
			[sampleVaults[2].vaultToken]: 'convex-cvx-2',
			[sampleVaults[3].vaultToken]: 'convex-cvx-3',
		};

		expect(getVaultsSlugCache(sampleVaults)).toEqual(expectedSlugs);
	});
});
