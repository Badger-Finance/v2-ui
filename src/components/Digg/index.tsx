import { Grid, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import DashboardCard from './DashboardCard';
import Info from './Info';
import React, { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';
import { LayoutContainer } from '../../components-v2/common/Containers';
import { Network } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
	diggContainer: {
		marginTop: theme.spacing(2),
	}
}));

export const Digg = observer(() => {
	const store = useContext(StoreContext);
	const { network } = store.network;
	const classes = useStyles();

	return (
		<LayoutContainer>
			<Grid container spacing={1} justifyContent="center" className={classes.diggContainer}>
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
