import React from 'react';
import { QueryParams, Route } from 'mobx-router';
import Landing from '../pages/Landing';
import { RootStore } from '../mobx/RootStore';
import { BoostOptimizer } from '../components/Boost';
import { Digg } from '../components/Digg';
import { IbBTC } from 'components/IbBTC';
import CitadelEarlyBonding from 'pages/CitadelEarlyBonding';
import { VaultDetail } from '../components-v2/vault-detail/VaultDetail';
import { NotFound } from '../components-v2/common/NotFound';
import { Box, Link, Typography } from '@material-ui/core';
import Governance from 'components/Governance';

const routes = {
	home: new Route<RootStore, QueryParams>({
		path: '/',
		component: (
			<Landing
				title="Vaults"
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
			/>
		),
	}),
	notFound: new Route<RootStore, QueryParams>({
		path: '/not-found',
		component: <NotFound />,
	}),
	boostOptimizer: new Route<RootStore, QueryParams>({
		path: '/boost-optimizer',
		component: <BoostOptimizer />,
	}),
	digg: new Route<RootStore, QueryParams>({
		path: '/digg',
		component: <Digg />,
	}),
	IbBTC: new Route<RootStore, QueryParams>({
		path: '/ibBTC',
		component: <IbBTC />,
		onEnter: (_route, _params, store) => store.ibBTCStore.init(),
	}),
	citadel: new Route<RootStore, QueryParams>({
		path: '/citadel',
		component: <CitadelEarlyBonding />,
		onEnter: (_route, _params, store) => store.bondStore.updateBonds(),
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
	governance: new Route<RootStore, QueryParams>({
		path: '/governance',
		component: <Governance />
	})
};

export default routes;
