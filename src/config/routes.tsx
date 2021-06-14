import React from 'react';
import { QueryParams, Route } from 'mobx-router';
import Landing from '../pages/Landing';
import { RootStore } from '../mobx/store';
import { Airdrops } from '../components/Airdrops';
import { Digg } from '../components/Digg';
import { Locked } from 'components/Common/Locked';
import { IbBTC } from 'components/IbBTC';
import { FLAGS } from 'config/constants';
import { Bridge } from '../components/Bridge';
import HoneybadgerDrop from '../components/HoneybadgerDrop/index';
import BoostLeaderBoard from 'pages/BoostLeaderBoard';

const routes = {
	locked: new Route<RootStore>({
		path: '/locked',
		component: <Locked />,
	}),
	home: new Route<RootStore>({
		path: '/',
		component: <Landing experimental={false} />,
	}),
	experimental: new Route<RootStore>({
		path: '/experimental',
		component: FLAGS.EXPERIMENTAL_VAULTS ? <Landing experimental={true} /> : <></>,
	}),
	airdrops: new Route<RootStore, QueryParams>({
		path: '/airdrops',
		component: <Airdrops />,
		onEnter: (_route, _params, store) => store.airdrops.fetchAirdrops(),
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
};

export default routes;
