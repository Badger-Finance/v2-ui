import { Grid } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import DashboardCard from './DashboardCard';
import Info from './Info';
import React, { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';
import { LayoutContainer } from '../../components-v2/common/Containers';
import { Network } from '@badger-dao/sdk';

export const Digg = observer(() => {
	const store = useContext(StoreContext);
	const { network } = store.network;

	return (
		<LayoutContainer>
			<Grid container spacing={1} justifyContent="center">
				{network.symbol === Network.Ethereum ? (
					<>
						<Info />
						<Grid item xs={12}>
							<DashboardCard />
						</Grid>
					</>
				) : (
					<>
						<Grid item xs={12}>
							Digg stats are available on ETH Mainnet only.
						</Grid>
					</>
				)}
			</Grid>
		</LayoutContainer>
	);
});
