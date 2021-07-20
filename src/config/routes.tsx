import React from 'react';
import { QueryParams, Route } from 'mobx-router';
import Landing from '../pages/Landing';
import { RootStore } from '../mobx/store';
import { Airdrops } from '../components/Airdrops';
import { BoostOptimizer } from '../components/Boost';
import { Digg } from '../components/Digg';
import { Locked } from 'components/Common/Locked';
import { IbBTC } from 'components/IbBTC';
import { FLAGS } from 'config/constants';
import { Bridge } from '../components/Bridge';
import HoneybadgerDrop from '../components/HoneybadgerDrop/index';
import BoostLeaderBoard from 'pages/BoostLeaderBoard';
import { SettDetail } from '../components-v2/sett-detail/SettDetail';
import { SettState } from '../mobx/model/setts/sett-state';

const routes = {
	locked: new Route<RootStore>({
		path: '/locked',
		component: <Locked />,
	}),
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
	airdrops: new Route<RootStore, QueryParams>({
		path: '/airdrops',
		component: <Airdrops />,
		onEnter: (_route, _params, store) => store.airdrops.fetchAirdrops(),
	}),
	boostOptimizer: new Route<RootStore, QueryParams>({
		path: '/boost-optimizer',
		component: FLAGS.BOOST_OPTIMIZER ? <BoostOptimizer /> : <></>,
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
	}),
};

export default routes;
