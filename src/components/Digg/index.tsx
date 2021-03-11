import { Container, Grid, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import DashboardCard from './DashboardCard';
import Info from './Info';
import React from 'react';
import PageHeader from '../../components-v2/common/PageHeader';
import { getNetworkName } from 'mobx/utils/web3';
import { NETWORK_LIST } from 'config/constants';

const useStyles = makeStyles((theme) => ({
	root: {
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(30),
		},
	},
	headerContainer: {
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
	},
	before: {
		marginTop: theme.spacing(5),
		width: '100%',
	},
}));

export const Digg = observer(() => {
	const classes = useStyles();
	const spacer = () => <div className={classes.before} />;
	const network = getNetworkName();

	return (
		<Container className={classes.root}>
			<Grid container spacing={1} justify="center">
				<Grid item xs={12} className={classes.headerContainer}>
					<PageHeader title="DIGG" subtitle="Pegged to Bitcoin. Governed by BadgerDAO." />
				</Grid>
				{network === NETWORK_LIST.ETH ? (
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
				{spacer()}
			</Grid>
		</Container>
	);
});
