import { Grid } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import DashboardCard from './DashboardCard';
import Info from './Info';
import React, { useContext } from 'react';
import PageHeader from '../../components-v2/common/PageHeader';
import { StoreContext } from 'mobx/store-context';
import { HeaderContainer, LayoutContainer } from '../../components-v2/common/Containers';
import { Network } from '@badger-dao/sdk';

export const Digg = observer(() => {
	const store = useContext(StoreContext);
	const { network } = store.network;

	return (
		<LayoutContainer>
			<Grid container spacing={1} justify="center">
				<HeaderContainer item xs={12}>
					<PageHeader title="DIGG" subtitle="Pegged to Bitcoin. Governed by BadgerDAO." />
				</HeaderContainer>
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
