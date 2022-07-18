import mainnetDeploy from '../../config/deployments/mainnet.json';

export const parseText = (text: string[], createLink: (a: string, b: string) => JSX.Element) => {
	return (
		<>
			{text.map((t) => {
				if (t.startsWith('[')) {
					const name = t.substring(1, t.indexOf(']'));
					const link = t.substring(t.indexOf('(') + 1, t.length - 1);
					return createLink(name, link);
				} else {
					return t;
				}
			})}
		</>
	);
};

export const isInfluenceVault = (address: string): boolean => {
	return vaults.map((vault) => vault.chart.influenceVaultToken).includes(address);
};

export const getInfluenceVaultConfig = (address: string): any => {
	return vaults.find((vault) => vault.chart.influenceVaultToken === address);
};

export const getAllInfluenceVaults = (): string[] => {
	return vaults.map((vault) => vault.chart.influenceVaultToken);
};

export const vaults = [
	{
		chart: {
			influenceVaultToken: mainnetDeploy.sett_system.vaults['native.icvx'], // bveCVX
			badgerToken: mainnetDeploy.tokens['badger'],
			poolToken: mainnetDeploy.tokens['bveCVXCVX'],
			vaultToken: mainnetDeploy.sett_system.vaults['native.cvxCrv'], //bvecrvCVX
			roundStart: 1632182660,
			sources: [
				mainnetDeploy.sett_system.vaults['native.icvx'],
				mainnetDeploy.tokens['badger'],
				mainnetDeploy.sett_system.vaults['native.cvxCrv'],
			],
		},
		rewardFrequencies: [
			{
				name: 'bveCVX, BADGER',
				value: 'Bi-Weekly',
			},
			{
				name: 'bcvxCRV',
				value: 'Per Harvest, ~5 days',
			},
		],
		rewardFrequenciesModalInfo: {
			title: 'Reward Frequency',
			body: [
				'bveCVX and BADGER rewards are distributed at the completion of each bi-weekly voting/bribing round, after bribes for that round have been sold. Convex locking rewards are distributed each ~2hr cycle as autocompounding ',
				'[bcvxCRV](convex-cvxcrv)',
				'.',
			],
			points: [
				['- 75% of bribe sales (after fees): sold for bveCVX'],
				['- 25% of bribe sales (after fees): sold for BADGER'],
				['- Convex vlCVX locking rewards: claimable as autocompounding bCvxCRV'],
				['- All rewards are claimable through the app'],
			],
		},
		withdrawModalInfo: {
			title: 'CVX Withdrawable',
			body: [
				'Each week, this vault locks batches of CVX tokens for a 16 week period. As vlCVX unlocks on a rolling basis, CVX becomes available to withdraw from the vault. Alternatively, bveCVX may be traded for CVX via the ',
				'[Curve pool](https://curve.fi/factory/52/)',
				' at any time.',
			],
			points: [
				['- CVX tokens are locked each Thursday just before 00:00 UTC'],
				['- Unlocked CVX is withdrawable from 00:01 UTC each Thursday until the next locking event'],
				[
					'- The unlocking schedule for bveCVX can be found on this ',
					'[Dune dashboard](https://dune.com/tianqi/Convex-Locked-CVX-V2(Sponsored-by-Badger))',
					'.',
				],
			],
		},
		perfomanceInfo: {
			body1: [
				'This vault locks 100% of deposited Convex tokens for rolling periods of 16 weeks. Badger will use vlCVX to vote for bribes during each voting round, sell them, and emit the proceeds back to holders in the form of bveCVX (autocompounded), and claimable BADGER and bcvxCRV.',
			],
			body2: [
				'Unlike other Badger Vaults, bveCVX limits the times when users may withdraw their funds. Limited pre-unlock liquidity is available through this ',
				'[Curve Pool](https://curve.fi/factory/52/)',
				'. Please carefully read the ',
				'[User Guide](https://docs.badger.com/badger-finance/vaults/vault-user-guides-ethereum/vote-locked-cvx)',
				' for more information. Details on the timing of CVX unlocks are available on this ',
				'[Dune dashboard](https://dune.com/tianqi/Convex-Locked-CVX-V2(Sponsored-by-Badger))',
				'.',
			],
			liquity: [['% CVX Received from 10k '], ['[bveCVX swap](https://curve.fi/factory/52/)']],
		},
		feeInfo: {
			fees: [
				['bveCVX Liquidity Support', '5%'],
				['BADGER Liquidity Support', '5%'],
				['DAO Operations Fee', '5%'],
			],
			feeModalInfo: {
				title: 'Vote Influence Fees',
				body: [
					'Each voting round, a portion of the vote influence accumulated by bveCVX votes to support liquidity for bveCVX and BADGER, and to support DAO operations.',
				],
				points: [
					{
						title: ['bveCVX Liquidity Support:'],
						body: ['5% of each vote is sold for bribes and paid as BADGER to bveCVX/CVX LPs'],
					},
					{
						title: ['BADGER Liquidity Support:'],
						body: ['5% of each vote votes for WBTC/BADGER'],
					},
					{
						title: ['DAO Operations Fee:'],
						body: ['5% of each vote is sold for bribes and paid to the DAO'],
					},
				],
			},
		},
	},
];
