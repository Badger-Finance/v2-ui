import {
	Grid,
	Typography,
	Paper,
	makeStyles,
	Button,
} from '@material-ui/core';
import React, { useState, useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import useInterval from '@use-it/interval';
import { observer } from 'mobx-react-lite';
import { Loader } from '../Loader';
import Metric from './Metric';
import {
	calculateNewSupply,
	shortenNumbers,
} from '../../mobx/utils/diggHelpers';
import BigNumber from 'bignumber.js';
import { formatPrice } from 'mobx/reducers/statsReducers';
import deploy from '../../config/deployments/mainnet.json';

const useStyles = makeStyles((theme) => ({
	before: {
		marginTop: theme.spacing(3),
		width: '100%',
	},
	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center',
		minHeight: '100%',
	},
	darkPaper: {
		padding: theme.spacing(2),
		textAlign: 'center',
		boxShadow: 'none',
		background: theme.palette.secondary.main
	},
	darkActions: {
		background: theme.palette.secondary.main
	},
	claim: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: theme.spacing(2),
		paddingBottom: theme.spacing(2),
	},
	claimButton: {
		marginLeft: theme.spacing(2),
		marginRight: theme.spacing(2),
	},
	rebaseButton: {
		marginTop: theme.spacing(2),
	},
	rebasePaper: {
		justifyContent: 'center',
		alignItems: 'center',
		display: 'flex',
		minHeight: '100%',
	},
	rebaseContainer: {
		display: 'inline',
	},
	rebaseLinks: {
		display: 'flex',
		justifyContent: 'space-around',
		marginTop: theme.spacing(1),
	},
	cardActions: {
		padding: theme.spacing(0, 0, 2),
		justifyContent: 'center',
	},
	down: {
		color: theme.palette.error.main,
	},
	up: {
		color: theme.palette.success.main,
	},
	secondaryAction: {
		position: 'inherit',
		textAlign: 'left',
		margin: theme.spacing(1, 4, 0),
		[theme.breakpoints.up('md')]: {
			position: 'absolute',
			textAlign: 'right',
			margin: 0,
		},
	},
}));

const Info = observer(() => {
	const store = useContext(StoreContext);
	const {
		uiState: { rebaseStats, currency, stats },
		contracts: { tokens },
		rebase: { callRebase },
	} = store;
	const { ppfs } = store.sett;
	const classes = useStyles();
	const previousSupply =
		rebaseStats.totalSupply && rebaseStats.pastRebase
			? rebaseStats.totalSupply.minus(
					new BigNumber(rebaseStats.pastRebase.requestedSupplyAdjustment).dividedBy(
						Math.pow(10, rebaseStats.decimals),
					),
			  )
			: null;
	const [nextRebase, setNextRebase] = useState('00:00:00');
	const newSupply =
		rebaseStats.oracleRate && rebaseStats.totalSupply
			? calculateNewSupply(
					rebaseStats.oracleRate.toNumber(),
					rebaseStats.totalSupply.toNumber(),
					rebaseStats.rebaseLag,
			  )
			: 0;
	const isPositive = !newSupply || newSupply >= rebaseStats.totalSupply;
	const percentage =
		newSupply && rebaseStats.totalSupply
			? ((newSupply) / rebaseStats.totalSupply)
			: 0;
	const diggSett = deploy.sett_system.vaults['native.digg'].toLowerCase();
	const rebasePercentage = ( ( stats.stats.digg - rebaseStats.btcPrice ) / rebaseStats.btcPrice ) * 0.1

	if (!rebaseStats) {
		return <Loader />;
	}

	useInterval(() => {
		if (!!rebaseStats && !!rebaseStats.nextRebase) {
			const zero = new Date(0);

			zero.setTime(rebaseStats.nextRebase.getTime() - new Date().getTime());
			setNextRebase(zero.toISOString().substr(11, 8));
		}
	}, 1000);

	const spacer = () => <div className={classes.before} />;
	return (
		<>
			<Grid item xs={6} md={6}>
				<Metric
					metric="BTC Price"
					value={rebaseStats.btcPrice > 0 ? formatPrice(rebaseStats.btcPrice, currency) : '-'}
				/>
			</Grid>
			<Grid item xs={6} md={6}>
				<Metric
					metric={"DIGG Price" + (stats.stats.digg > 0 ? `   ${rebasePercentage.toFixed(5)}%` : '')}
					value={stats.stats.digg > 0 ? formatPrice(stats.stats.digg || new BigNumber(0), currency) : '-'}
				/>
			</Grid>
			<Grid item xs={12} md={6}>
				<Metric
					metric="Total Supply"
					value={rebaseStats.totalSupply ? shortenNumbers(rebaseStats.totalSupply, '', 2) : '-'}
				/>
			</Grid>
			<Grid item xs={6} md={6}>
				<Metric
					metric="Time To Rebase"
					value={nextRebase}

				/>
			</Grid>
			{spacer()}
			<Grid item xs={12} md={6} style={{ textAlign: 'center' }}>
				<Paper className={classes.darkPaper}>
					<Typography variant="body1">1 bDIGG = {!!stats.stats.bDigg ? stats.stats.bDigg.toFixed(9) : '...'} DIGG</Typography>
				</Paper>
				<Button
					variant="text"
					fullWidth
					size="small"
					color="primary"
					href="https://badger.finance/digg"
					target="_"
				>
					Learn More
				</Button>
			</Grid>
			{spacer()}

		</>
	);
});

export default Info;
