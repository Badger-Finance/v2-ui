import React from 'react';
import { QueryParams, Route } from 'mobx-router';
import Landing from '../pages/Landing';
import { RootStore } from '../mobx/RootStore';
import { BoostOptimizer } from '../components/Boost';
import { Digg } from '../components/Digg';
import { IbBTC } from 'components/IbBTC';
import { Bridge } from '../components/Bridge';
import HoneybadgerDrop from '../components/HoneybadgerDrop/index';
import BoostLeaderBoard from 'pages/BoostLeaderBoard';
import { SettDetail } from '../components-v2/sett-detail/SettDetail';
import { NotFound } from '../components-v2/common/NotFound';
import { SettState } from '@badger-dao/sdk';

const routes = {
	home: new Route<RootStore>({
		path: '/',
		component: (
			<Landing
				title="Sett Vaults"
				subtitle="Powerful Bitcoin strategies. Automatic staking rewards."
				state={SettState.Open}
			/>
		),
	}),
	notFound: new Route<RootStore>({
		path: '/not-found',
		component: <NotFound />,
	}),
	guarded: new Route<RootStore>({
		path: '/guarded',
		component: (
			<Landing
				title="Guarded Vaults"
				subtitle="New vaults to dip your toes in. Ape safe."
				state={SettState.Guarded}
			/>
		),
	}),
	experimental: new Route<RootStore>({
		path: '/experimental',
		component: (
			<Landing
				title="Experimental Vaults"
				subtitle="Novel Bitcoin strategies. Bleeding edge innovation."
				state={SettState.Experimental}
			/>
		),
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
	}),
	IbBTC: new Route<RootStore, QueryParams>({
		path: '/ibBTC',
		component: <IbBTC />,
		onEnter: (_route, _params, store) => store.ibBTCStore.init(),
	}),
	bridge: new Route<RootStore, QueryParams>({
		path: '/bridge',
		component: <Bridge />,
	}),
	boostLeaderBoard: new Route<RootStore, QueryParams>({
		path: '/leaderboard',
		component: <BoostLeaderBoard />,
	}),
	settDetails: new Route<RootStore, QueryParams>({
		path: '/setts/:settName',
		component: <SettDetail />,
		onEnter: (_route, params, store) => {
			if (!params || !params.settName) return;

			if (params.accountView) {
				store.settDetail.setAccountViewMode();
			}

			store.settDetail.setSearchSlug(params.settName as string);
		},
		onExit: (_route, _params, store) => {
			store.settDetail.reset();
		},
	}),
};

export default routes;
