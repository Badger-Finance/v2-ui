import { Network } from '@badger-dao/sdk';

import arbitrumDeploy from '../../config/deployments/arbitrum.json';
import avaxDeploy from '../../config/deployments/avalanche.json';
import bscDeploy from '../../config/deployments/bsc.json';
import fantomDeploy from '../../config/deployments/ftm.json';
import ethDeploy from '../../config/deployments/mainnet.json';
import maticDeploy from '../../config/deployments/matic.json';
import { StrategyNetworkConfig } from '../../mobx/model/strategies/strategy-network-config';

// TODO: add descriptions and deposit instructions after marketing team provides them
export const getStrategies = (network: Network): StrategyNetworkConfig => {
  switch (network) {
    case Network.Fantom:
      return {
        [fantomDeploy.sett_system.vaults['native.wbtc-renbtc']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.wftm-sex']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.solid-solidsex']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.weve-usdc']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.oxd-usdc']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.wftm-crv']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.usdc-mim']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.wftm-renbtc']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.boo-xboo-eco']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.wftm-crv-eco']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.usdc-mim-eco']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.wftm-scream-eco']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.wftm-renbtc-eco']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.wftm-tomb-eco']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.geist-g3crv']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.veoxd']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.oxsolid']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.bveoxd-oxd']]: {
          userGuide: '',
        },
        [fantomDeploy.sett_system.vaults['native.usdc-dei']]: {
          userGuide: '',
        },
      };
    case Network.Avalanche:
      return {
        [avaxDeploy.sett_system.vaults['BWBTC']]: {
          userGuide:
            'https://docs.badger.com/vaults/user-guides/vault-user-guides-arbitrum/arbitrum-sushi-weth-helper-vault',
        },
      };
    case Network.Arbitrum:
      return {
        [arbitrumDeploy.sett_system.vaults['native.sushiWethSushi']]: {
          userGuide:
            'https://docs.badger.com/vaults/user-guides/vault-user-guides-arbitrum/arbitrum-sushi-weth-helper-vault',
          depositLink: 'https://app.sushi.com/add/ETH/0xd4d42F0b6DEF4CE0383636770eF773390d85c61A',
        },
        [arbitrumDeploy.sett_system.vaults['native.sushiWethWbtc']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-arbitrum/arbitrum-wbtc-eth-slp',
          depositLink: 'https://app.sushi.com/add/ETH/0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
        },
        [arbitrumDeploy.sett_system.vaults['native.crvWbtcRen']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-arbitrum/arbitrum-renbtc-wbtc',
          depositLink: 'https://arbitrum.curve.fi/ren/deposit',
        },
        [arbitrumDeploy.sett_system.vaults['native.tricrypto']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-arbitrum/arbitrum-tricrypto2',
          depositLink: 'https://arbitrum.curve.fi/tricrypto/deposit',
        },
        [arbitrumDeploy.sett_system.vaults['native.swaprWethSwapr']]: {
          userGuide:
            'https://docs.badger.com/vaults/user-guides/vault-user-guides-arbitrum/arbitrum-swapr-weth-helper-vault',
          depositLink:
            'https://swapr.eth.link/#/add/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1/0xdE903E2712288A1dA82942DDdF2c20529565aC30?chainId=42161',
        },
        [arbitrumDeploy.sett_system.vaults['native.tricryptoLight']]: {
          userGuide:
            'https://app.gitbook.com/@badger-finance/s/badger-finance/setts/sett-user-guides-arbitrum/arbitrum-tricrypto-crv',
          depositLink: 'https://arbitrum.curve.fi/tricrypto/deposit',
        },
        [arbitrumDeploy.sett_system.vaults['native.swaprWethWbtc']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-arbitrum/arbitrum-wbtc-weth',
          depositLink: 'https://swapr.eth.link/#/add/0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f/ETH?chainId=42161',
        },
        [arbitrumDeploy.sett_system.vaults['native.swaprWethBadger']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-arbitrum/arbitrum-badger-weth',
          depositLink: 'https://swapr.eth.link/#/add/ETH/0xBfa641051Ba0a0Ad1b0AcF549a89536A0D76472E?chainId=42161',
        },
        [arbitrumDeploy.sett_system.vaults['native.swaprWethIbbtc']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-arbitrum/arbitrum-ibbtc-weth',
          depositLink: 'https://swapr.eth.link/#/add/ETH/0x9Ab3FD50FcAe73A1AEDa959468FD0D662c881b42?chainId=42161',
        },
      };
    case Network.Polygon:
      return {
        [maticDeploy.sett_system.vaults['BSLP-IBBTC-WBTC']]: {
          depositLink:
            'https://app.sushi.com/add/0x4EaC4c4e9050464067D673102F8E24b2FccEB350/0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-polygon/polygon-wbtc-ibbtc-slp',
        },
        [maticDeploy.sett_system.vaults['BQLP-WBTC-USDC']]: {
          depositLink:
            'https://quickswap.exchange/#/add/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-polygon/polygon-wbtc-usdc-qlp',
        },
        [maticDeploy.sett_system.vaults['BCRV-WBTC-RENBTC']]: {
          depositLink: 'https://polygon.curve.fi/ren/deposit',
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-polygon/polygon-amwbtc-renwbtc',
        },
      };
    case Network.BinanceSmartChain:
      return {
        [bscDeploy.sett_system.vaults['native.pancakeBnbBtcb']]: {},
        [bscDeploy.sett_system.vaults['native.bBadgerBtcb']]: {},
        [bscDeploy.sett_system.vaults['native.bDiggBtcb']]: {},
      };
    default:
      return {
        [ethDeploy.sett_system.vaults['native.badger']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/badger',
          depositLink:
            'https://app.sushi.com/swap?inputCurrency=0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599&outputCurrency=0x3472A5A71965499acd81997a54BBA8D852C6E53d',
        },
        [ethDeploy.sett_system.vaults['native.rembadger']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/rembadger',
        },
        [ethDeploy.sett_system.vaults['native.renCrv']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/convex-renbtc-wbtc',
          depositLink: 'https://curve.fi/#/ethereum/pools/ren/deposit',
        },
        [ethDeploy.sett_system.vaults['native.sbtcCrv']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/convex-renbtc-wbtc-sbtc',
          depositLink: 'https://curve.fi/#/ethereum/pools/sbtc/deposit',
        },
        [ethDeploy.sett_system.vaults['native.tbtcCrv']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/convex-tbtc-sbtc',
          depositLink: 'https://curve.fi/#/ethereum/pools/tbtc/deposit',
        },
        [ethDeploy.sett_system.vaults['native.uniBadgerWbtc']]: {
          userGuide:
            'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/wrapped-btc-badger-uniswap-lp',
          depositLink:
            'https://app.uniswap.org/#/add/v2/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/0x3472A5A71965499acd81997a54BBA8D852C6E53d',
        },
        [ethDeploy.sett_system.vaults['harvest.renCrv']]: {
          userGuide:
            'https://app.gitbook.com/@badger-finance/s/badger-finance/v/master/sett-user-guides/harvest-renbtc-wbtc',
        },
        [ethDeploy.sett_system.vaults['native.sushiWbtcEth']]: {
          // description:
          // 	'Provide liquidity in Sushiswap WBTC/ETH pool and receive SLP tokens in return, which ' +
          // 	'represent your share of the pair. Deposit your SLP tokens in Badger protocol and get bSLP ' +
          // 	'tokens in return. 50% of rewards are automatically compounded as the bSLP/LP ratio increases ' +
          // 	'over time. LP tokens are deposited in Sushiswap’s Onsen. DIGG and xSushi incentive rewards ' +
          // 	'can be claimed in the dashboard.',
          userGuide:
            'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/wrapped-btc-wrapped-ether-slp',
          depositLink: 'https://app.sushi.com/add/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/ETH',
        },
        [ethDeploy.sett_system.vaults['native.sushiBadgerWbtc']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/wrapped-btc-badger-slp',
          depositLink:
            'https://app.sushi.com/add/0x3472A5A71965499acd81997a54BBA8D852C6E53d/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        },
        [ethDeploy.sett_system.vaults['native.digg']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/digg',
          depositLink:
            'https://app.sushi.com/swap?inputCurrency=0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599&outputCurrency=0x798D1bE841a82a273720CE31c822C61a67a601C3',
        },
        [ethDeploy.sett_system.vaults['native.uniDiggWbtc']]: {},
        [ethDeploy.sett_system.vaults['native.sushiDiggWbtc']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/wrapped-btc-digg-SLP',
          depositLink:
            'https://app.sushi.com/add/0x798D1bE841a82a273720CE31c822C61a67a601C3/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        },
        [ethDeploy.sett_system.vaults['yearn.wBtc']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/yearn-wrapped-btc',
        },
        [ethDeploy.sett_system.vaults['native.sushiibBTCwBTC']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/wrapped-btc-ibbtc-slp',
          depositLink:
            'https://app.sushi.com/add/0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        },
        [ethDeploy.sett_system.vaults['experimental.digg']]: {
          depositLink:
            'https://app.sushi.com/swap?inputCurrency=0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599&outputCurrency=0x798D1bE841a82a273720CE31c822C61a67a601C3',
        },
        [ethDeploy.sett_system.vaults['native.mim-3crv']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/mim-3crv-curve-lp',
          depositLink: 'https://curve.fi/#/ethereum/pools/mim/deposit',
        },
        [ethDeploy.sett_system.vaults['native.frax-3crv']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/frax-3crv-curve-lp',
          depositLink: 'https://curve.fi/#/ethereum/pools/frax/deposit',
        },
        [ethDeploy.sett_system.vaults['native.hbtcCrv']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/convex-hbtc',
          depositLink: 'https://curve.fi/#/ethereum/pools/hbtc/deposit',
        },
        [ethDeploy.sett_system.vaults['native.pbtcCrv']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/convex-pbtc',
          depositLink: 'https://curve.fi/#/ethereum/pools/pbtc/deposit',
        },
        [ethDeploy.sett_system.vaults['native.obtcCrv']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/convex-obtc',
          depositLink: 'https://curve.fi/#/ethereum/pools/obtc/deposit',
        },
        [ethDeploy.sett_system.vaults['native.bbtcCrv']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/convex-bbtc',
          depositLink: 'https://curve.fi/#/ethereum/pools/bbtc/deposit',
        },
        [ethDeploy.sett_system.vaults['native.tricryptoCrv']]: {},
        [ethDeploy.sett_system.vaults['native.tricryptoCrv2']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/tricrypto2',
          depositLink: 'https://curve.fi/#/ethereum/pools/tricrypto2/deposit',
        },
        [ethDeploy.sett_system.vaults['native.cvxCrv']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/cvxcrv-helper',
          depositLink: 'https://www.convexfinance.com/stake',
        },
        [ethDeploy.sett_system.vaults['native.cvx']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/cvx-helper',
        },
        [ethDeploy.sett_system.vaults['native.icvx']]: {
          depositLink:
            'https://app.sushi.com/swap?inputCurrency=ETH&outputCurrency=0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/vote-locked-cvx',
        },
        [ethDeploy.sett_system.vaults['native.imBtc']]: {
          depositLink: 'https://mstable.app/#/mbtc/save',
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/mstable-imbtc',
        },
        [ethDeploy.sett_system.vaults['native.fPmBtcHBtc']]: {
          depositLink: 'https://mstable.app/#/mbtc/pools/0x48c59199da51b7e30ea200a74ea07974e62c4ba7',
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/mstable-mbtc-hbtc-mhbtc',
        },
        [ethDeploy.sett_system.vaults['native.bveCVXCVX']]: {
          depositLink: 'https://curve.fi/factory/52/deposit',
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/bvecvx-cvx-curve-lp',
        },
        [ethDeploy.sett_system.vaults['native.ibbtcCrv']]: {
          depositLink: 'https://curve.fi/factory/60/deposit',
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/ibbtc-sbtc-curve-lp',
        },
        [ethDeploy.sett_system.vaults['native.badgerCrv']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/convex-badger-wbtc',
          depositLink: 'https://curve.fi/factory-crypto/4/deposit',
        },
        [ethDeploy.sett_system.vaults['native.graviaura']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/graviaura-vote-locked-aura',
        },
        [ethDeploy.sett_system.vaults['native.auraBal']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/aurabal-helper',
          depositLink: 'https://app.aura.finance/',
        },
        [ethDeploy.sett_system.vaults['native.aura-wbtc-badger']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/b20wbtc-80badger',
          depositLink:
            'https://app.balancer.fi/#/pool/0xb460daa847c45f1c4a41cb05bfb3b51c92e41b36000200000000000000000194',
        },
        [ethDeploy.sett_system.vaults['native.graviaura-aurabal-weth']]: {
          userGuide:
            'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/b33aurabal-33graviaura-33weth',
          depositLink:
            'https://app.balancer.fi/#/pool/0x0578292cb20a443ba1cde459c985ce14ca2bdee5000100000000000000000269',
        },
        [ethDeploy.sett_system.vaults['native.aura-bb-aave-usd']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/bbb-a-usd',
          depositLink:
            'https://app.balancer.fi/#/pool/0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe',
        },
        [ethDeploy.sett_system.vaults['native.graviaura-digg-wbtc']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/40wbtc-40digg-20graviaura',
          depositLink:
            'https://app.balancer.fi/#/pool/0x8eb6c82c3081bbbd45dcac5afa631aac53478b7c000100000000000000000270',
        },
        [ethDeploy.sett_system.vaults['native.aura-reth-weth']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/reth-weth',
          depositLink:
            'https://app.balancer.fi/#/pool/0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112',
        },
        [ethDeploy.sett_system.vaults['native.aura-wsteth-weth']]: {
          userGuide: 'https://docs.badger.com/vaults/user-guides/vault-user-guides-ethereum/wsteth-weth',
          depositLink:
            'https://app.balancer.fi/#/pool/0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080',
        },
      };
  }
};
