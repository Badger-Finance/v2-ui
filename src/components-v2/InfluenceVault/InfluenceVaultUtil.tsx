import { InfluenceVaultConfig } from 'mobx/model/vaults/influence-vault-data';

import mainnetDeploy from '../../config/deployments/mainnet.json';

export function isInfluenceVault(address: string): boolean {
  return vaults.map((vault) => vault.influenceVaultToken).includes(address);
}

export function getInfluenceVaultConfig(address: string): InfluenceVaultConfig | undefined {
  return vaults.find((vault) => vault.influenceVaultToken === address);
}

export function getAllInfluenceVaults(): string[] {
  return vaults.map((vault) => vault.influenceVaultToken);
}

export const vaults: InfluenceVaultConfig[] = [
  {
    influenceVaultToken: mainnetDeploy.sett_system.vaults['native.icvx'], // bveCVX
    poolToken: mainnetDeploy.tokens['bveCVXCVX'],
    vaultToken: mainnetDeploy.sett_system.vaults['native.cvxCrv'], //bvecrvCVX
    roundStart: 1632182660,
    scheduleRoundCutoff: 1,
    chartInitialSlice: 2,
    sources: [
      mainnetDeploy.sett_system.vaults['native.icvx'],
      mainnetDeploy.tokens['badger'],
      mainnetDeploy.sett_system.vaults['native.cvxCrv'],
    ],
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
    rewardFrequenciesModalConfig: {
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
    withdrawModalConfig: {
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
    perfomanceConfig: {
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
      swapPercentageLabel: ['% CVX Received from 10k ', '[bveCVX swap](https://curve.fi/factory/52/)'],
    },
    feeConfig: {
      voteInfluenceFees: [
        ['bveCVX Liquidity Support', '5%'],
        ['BADGER Liquidity Support', '5%'],
        ['DAO Operations Fee', '5%'],
      ],
      showFees: ['withdrawal'],
      feeModalConfig: {
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
  {
    influenceVaultToken: mainnetDeploy.sett_system.vaults['native.graviaura'], // graviAura
    poolToken: '',
    vaultToken: mainnetDeploy.tokens['aura'], //Aura
    roundStart: 1655956800,
    sources: [mainnetDeploy.sett_system.vaults['native.graviaura'], mainnetDeploy.tokens['badger']],
    scheduleRoundCutoff: 0,
    chartInitialSlice: 0,
    rewardFrequencies: [
      {
        name: 'graviAURA, BADGER',
        value: 'Bi-Weekly',
      },
    ],
    rewardFrequenciesModalConfig: {
      title: 'Reward Frequency',
      body: [
        'graviAURA and BADGER rewards from bribe sales are distributed at the completion of each bi-weekly voting round, after bribes for that round have been sold.',
      ],
      points: [
        ['- 75% of bribe sales (after fees): sold for graviAURA'],
        ['- 25% of bribe sales (after fees): sold for BADGER'],
        ['- All rewards are claimable through the app'],
      ],
    },
    withdrawModalConfig: {
      title: 'graviAURA Available for Withdraw',
      body: [
        'Each week, this vault locks batches of AURA tokens for a 16 week period. As vlAURA unlocks on a rolling basis, AURA becomes available to withdraw from the vault. Alternatively, graviAURA may be traded for assets it is paired with in Balancer pools.',
      ],
      points: [
        ['- AURA tokens are locked each Thursday just before 00:00 UTC'],
        ['- Unlocked AURA is withdrawable from 00:01 UTC each Thursday until the next locking event'],
      ],
    },
    perfomanceConfig: {
      body1: [
        'This vault locks 100% of deposited Aura tokens for rolling periods of 16 weeks. Badger will use vlAURA to vote for bribes during each voting round, sell them, and emit the proceeds back to holders in the form of graviAURA and BADGER. Aura locking rewards are autocompounded back into the vault.',
      ],
      body2: [
        'Unlike other Badger Vaults, graviAURA limits the times when users may withdraw their funds. Limited pre-unlock liquidity is available through Balancer pools containing graviAURA. Please carefully read the ',
        '[User Guide](https://docs.badger.com/badger-finance/vaults/vault-user-guides-ethereum/vote-locked-cvx)',
        ' for more information.',
      ],
      swapPercentageLabel: [],
    },
    feeConfig: {
      voteInfluenceFees: [['DAO Operations Fee', '10%']],
      showFees: ['withdrawal', 'performance'],
      feeModalConfig: {
        title: 'Vote Influence Fees',
        body: [
          'Each voting round, a portion of the vote influence accumulated by graviAURA votes for bribes which are sold to support DAO operations.',
        ],
        points: [
          {
            title: ['DAO Operations Fee:'],
            body: ['10% of each vote is sold for bribes and paid to the DAO'],
          },
        ],
      },
    },
  },
];
