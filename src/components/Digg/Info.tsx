import {Grid, Typography, Paper, makeStyles, Button} from "@material-ui/core";
import React, { useState, useContext } from "react";
import { StoreContext } from "../../context/store-context";
import useInterval from "@use-it/interval";
import { observer } from "mobx-react-lite";
import { Loader } from "../Loader";
import Metric from "./Metric";
import {calculateNewSupply, shortenNumbers, numberWithCommas} from '../../mobx/utils/digHelpers'
import { WBTC_ADDRESS } from '../../config/constants';
const useStyles = makeStyles((theme) => ({

	before: {
		marginTop: theme.spacing(3),
		width: "100%"
	},
	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center',
		minHeight: '100%',
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
	}

}));
const Info = observer((props: any) => {

	const store = useContext(StoreContext);
	const { uiState: { rebaseStats }, contracts: { tokens } } = store
	const classes = useStyles();

	const [nextRebase, setNextRebase] = useState("00:00:00");
	const newSupply = rebaseStats.oracleRate && rebaseStats.totalSupply? calculateNewSupply(rebaseStats.oracleRate.toNumber(),rebaseStats.totalSupply.toNumber(),rebaseStats.rebaseLag):0;
	const isPositive = !newSupply || newSupply >= rebaseStats.totalSupply ;
    const percentage = newSupply && rebaseStats.totalSupply ?
		 				((newSupply-rebaseStats.totalSupply)/rebaseStats.totalSupply * 100):0;
	if (!rebaseStats) {
		return <Loader />
	}

	useInterval(() => {
		if (!!rebaseStats && !!rebaseStats.nextRebase) {
			let zero = new Date(0);

			zero.setTime(rebaseStats.nextRebase.getTime() - new Date().getTime());
			setNextRebase(zero.toISOString().substr(11, 8));
		}
	}, 1000);

	const spacer = () => <div className={classes.before} />;
	const mockDiggMarketCap = 506932023;

	return <>
		<Grid item xs={12} md={3}>
			<Metric
				metric='MarketCap'
				value={`$${numberWithCommas(mockDiggMarketCap.toString())}`}
				submetrics={[
					{title: '1h', value: '2.45', change: true},
					{title: '24h', value: '12.45', change: true},
					{title: '7d', value: '-3.4', change: true},
				]}
			/>
		</Grid>
		<Grid item xs={12} md={3}>
			<Metric
				metric='Oracle Price'
				value={'$42,109'}
				submetrics={[
					{title: 'Price at last Rebase', value: '$47,497'},
					{title: 'Change Since Last Rebase', value: '-13.40', change: true},
				]}
			/>
		</Grid>
		<Grid item xs={12} md={3}>
			<Metric
				metric='BTC Price'
				value={'$40,345'}
				submetrics={[
					{title: 'Current Ratio', value: '1.043'},
					{title: 'Ratio Change Since Last Rebase', value: '1.043'},
				]}
			/>
		</Grid>
		<Grid item xs={12} md={3}>
			<Metric
				metric='Total Supply'
				value={shortenNumbers(rebaseStats.totalSupply, '', 2)}
				submetrics={[
					{title: 'Supply at last Rebase', value: '11,893'},
					{title: 'Change From Last Rebase', value: '2.6', change: true},
				]}
			/>
		</Grid>
		<Grid item xs={12}>
			<Paper className={classes.claim}>
				<Typography variant="subtitle1" className={classes.claimButton}>Claim Airdrop</Typography>
				<Typography variant="h4" className={classes.claimButton}>0.123 DIGG</Typography>
				<Button size="large" variant="contained" color="primary" className={classes.claimButton}>
					CLAIM
				</Button>
			</Paper>
		</Grid>
		<Grid item xs={12} md={6}>
			<Paper className={classes.rebasePaper}>
				<Grid container xs={12}>
					<Grid item xs={6} className={classes.rebasePaper}>
						<Typography variant="subtitle1">Time to Rebase</Typography>
					</Grid>
					<Grid item xs={6} className={classes.rebasePaper}>
						<Typography variant="h6">{nextRebase || '...'}</Typography>
					</Grid>
					<Grid item xs={6} className={classes.rebasePaper}>
						<Typography variant="subtitle1">Current Oracle Price Ratio</Typography>
					</Grid>
					<Grid item xs={6} className={classes.rebasePaper}>
						<Typography variant="h6">{numberWithCommas(newSupply.toFixed(2)) || '...'}</Typography>
					</Grid>
					<Grid item xs={12} className={classes.rebasePaper}>
						<Button size="large" variant="contained" color="primary" className={classes.rebaseButton}>
							TRIGGER REBASE
						</Button>
					</Grid>
				</Grid>
			</Paper>
		</Grid>
		<Grid item xs={12} md={6}>
			<Paper className={classes.statPaper}>
				<Grid container xs={12}>
					<Grid item xs={6}>
						<Typography variant="subtitle1">Rebase Impact</Typography>
						<Typography variant="h5">{isPositive ? '+':'-' + percentage ? Math.abs(percentage).toFixed(2) + '%':'' || '...'}</Typography>
					</Grid>
					<Grid item xs={6}>
						<Typography variant="subtitle1">Supply After Rebase</Typography>
						<Typography variant="h5">{numberWithCommas(newSupply.toFixed(2)) || '...'}</Typography>
					</Grid>
					<Grid item xs={12}>
						Some explanatory text here about what rebases are and what these statistics mean.
						<div className={classes.rebaseLinks}>
							<a href="Link One">Links</a>
							<a href="Link One">To More</a>
							<a href="Link One">Information</a>
						</div>
					</Grid>
				</Grid>
			</Paper>
		</Grid>
	</>
});

export default Info;
