import React from 'react';

//models
import { QueryParams, Route } from 'mobx-router';

// pages
import Landing from '../pages/Landing';

//components
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
		onEnter: (_, params, store) => {
			store.airdrops.fetchAirdrops();
		},
	}),
	digg: new Route<RootStore, QueryParams>({
		path: '/digg',
		component: <Digg />,
		onEnter: (_, params, store) => {
			store.rebase.fetchRebaseStats();
		},
	}),
	honeybadgerDrop: new Route<RootStore, QueryParams>({
		path: '/honey-badger-drop',
		component: <HoneybadgerDrop />,
	}),
	IbBTC: new Route<RootStore, QueryParams>({
		path: '/ibBTC',
		component: FLAGS.IBBTC_FLAG ? <IbBTC /> : <></>,
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
