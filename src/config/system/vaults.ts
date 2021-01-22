import BadgerVault from './abis/Sett.json';
import BadgerSushiVault from './abis/SushiSett.json';
import DiggVault from './abis/DiggSett.json';
import deploy from '../deployments/mainnet.json';

export const vaultBatches = [
	{
		abi: BadgerVault.abi,
		underlying: 'token',
		contracts: [
			deploy.sett_system.vaults['native.badger'],
			deploy.sett_system.vaults['native.renCrv'],
			deploy.sett_system.vaults['native.sbtcCrv'],
			deploy.sett_system.vaults['native.tbtcCrv'],
			deploy.sett_system.vaults['native.uniBadgerWbtc'],
			deploy.sett_system.vaults['harvest.renCrv'],
			deploy.sett_system.vaults['native.uniDiggWbtc'],
		],
		fillers: {
			symbol: ['badger', 'renCrv', 'sbtcCrv', 'tbtcCrv', 'uniBadgerWbtc', 'renCrv', 'uniDiggWbtc'],
			isFeatured: [false, false, false, false, true, true, true],
			position: [2, 11, 10, 9, 7, 8, 6],
			isSuperSett: [false, false, false, false, false, true, false, false, false],
		},
		methods: [
			{
				name: 'balanceOf',
				args: ['{connectedAddress}'],
			},
			{
				name: 'getPricePerFullShare',
			},
			{
				name: 'balance',
			},
			{
				name: 'symbol',
			},
			{
				name: 'decimals',
			},
			{
				name: 'token',
			},
			{
				name: 'totalSupply',
			},
		],
	},
	{
		abi: BadgerSushiVault.abi,
		underlying: 'token',
		contracts: [
			deploy.sett_system.vaults['native.sushiWbtcEth'],
			deploy.sett_system.vaults['native.sushiBadgerWbtc'],
			deploy.sett_system.vaults['native.sushiDiggWbtc'],
		],
		fillers: {
			isFeatured: [false, true],
			position: [5, 4, 3],
			symbolPrefix: ['sushi', 'sushi', 'sushi'],
			onsenId: ['103', '21', '73'],
		},
		methods: [
			{
				name: 'balanceOf',
				args: ['{connectedAddress}'],
			},
			{
				name: 'getPricePerFullShare',
			},
			{
				name: 'balance',
			},
			{
				name: 'symbol',
			},
			{
				name: 'decimals',
			},
			{
				name: 'token',
			},
			{
				name: 'totalSupply',
			},
		],
		growthEndpoints: [
			'https://api.thegraph.com/subgraphs/name/sushiswap/master-chef',
			'https://apy.sushiswap.fi/xsushi',
			'https://apy.sushiswap.fi/?pairs=',
		],
	},
	{
		abi: DiggVault.abi,
		underlying: 'token',
		contracts: [deploy.sett_system.vaults['native.digg']],
		fillers: {
			isFeatured: [true],
			position: [1],
			symbolPrefix: [''],
		},
		methods: [
			{
				name: 'balanceOf',
				args: ['{connectedAddress}'],
			},
			{
				name: 'getPricePerFullShare',
			},
			{
				name: 'balance',
			},
			{
				name: 'symbol',
			},
			{
				name: 'decimals',
			},
			{
				name: 'totalSupply',
			},
			{
				name: 'token',
			},
		],
	},
];
