import React from 'react';
import { QueryParams, Route } from 'mobx-router';
import Landing from '../pages/Landing';
import { RootStore } from '../mobx/RootStore';
import { Airdrops } from '../components/Airdrops';
import { BoostOptimizer } from '../components/Boost';
import { Digg } from '../components/Digg';
import { IbBTC } from 'components/IbBTC';
import { Bridge } from '../components/Bridge';
import HoneybadgerDrop from '../components/HoneybadgerDrop/index';
import BoostLeaderBoard from 'pages/BoostLeaderBoard';
import CitadelEarlyBonding from 'pages/CitadelEarlyBonding';
import { VaultDetail } from '../components-v2/vault-detail/VaultDetail';
import { NotFound } from '../components-v2/common/NotFound';
import { VaultState } from '@badger-dao/sdk';
import { Box, Link, Typography } from '@material-ui/core';
import { FLAGS } from './environment';

const routes = {
	home: new Route<RootStore, QueryParams>({
		path: '/',
		component: (
			<Landing
				title="Sett Vaults"
				subtitle={
					<Box display="flex" alignItems="center">
						<Typography variant="body2" color="textSecondary">
							The best Bitcoin rewards in all of Defi. Stake now to earn automatically.{' '}
							<Link
								color="primary"
								target="_blank"
								href="https://badger.com/new-to-defi"
								rel="noreferrer"
							>
								New to Defi?
							</Link>
						</Typography>
					</Box>
				}
				state={VaultState.Open}
			/>
		),
	}),
	notFound: new Route<RootStore, QueryParams>({
		path: '/not-found',
		component: <NotFound />,
	}),
	guarded: new Route<RootStore, QueryParams>({
		path: '/guarded',
		component: (
			<Landing
				title="Guarded Vaults"
				subtitle="New vaults to dip your toes in. Ape safe."
				state={VaultState.Guarded}
			/>
		),
	}),
	experimental: new Route<RootStore, QueryParams>({
		path: '/experimental',
		component: (
			<Landing
				title="Experimental Vaults"
				subtitle="Novel Bitcoin strategies. Bleeding edge innovation."
				state={VaultState.Experimental}
			/>
		),
	}),
	airdrops: new Route<RootStore, QueryParams>({
		path: '/airdrops',
		component: <Airdrops />,
		onEnter: (_route, _params, store) => store.airdrops.fetchAirdrops(),
	}),
	boostOptimizer: new Route<RootStore, QueryParams>({
		path: '/boost-optimizer',
		component: <BoostOptimizer />,
	}),
	digg: new Route<RootStore, QueryParams>({
		path: '/digg',
		component: <Digg />,
	}),
	honeybadgerDrop: new Route<RootStore, QueryParams>({
		path: '/honey-badger-drop',
		component: <HoneybadgerDrop />,
		onEnter: (_route, _params, store) => store.honeyPot.refresh(),
	}),
	IbBTC: new Route<RootStore, QueryParams>({
		path: '/ibBTC',
		component: <IbBTC />,
		onEnter: (_route, _params, store) => store.ibBTCStore.init(),
	}),
	...(FLAGS.CITADEL_SALE && {
		citadel: new Route<RootStore, QueryParams>({
			path: '/citadel',
			component: <CitadelEarlyBonding />,
		}),
	}),
	bridge: new Route<RootStore, QueryParams>({
		path: '/bridge',
		component: <Bridge />,
		onEnter: (_route, _params, store) => store.bridge.reload(),
	}),
	boostLeaderBoard: new Route<RootStore, QueryParams>({
		path: '/leaderboard',
		component: <BoostLeaderBoard />,
		onEnter: (_route, _params, store) => store.leaderBoard.loadData(),
	}),
	settDetails: new Route<RootStore, QueryParams>({
		path: '/setts/:settName',
		component: <VaultDetail />,
		onEnter: (_route, params, store) => {
			if (!params || !params.settName) {
				return;
			}
			store.vaultDetail.setSearchSlug(params.settName as string);
		},
		onExit: (_route, _params, store) => {
			store.vaultDetail.reset();
		},
	}),
};

export default routes;
