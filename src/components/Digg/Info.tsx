import {
	Grid, Typography, Paper, makeStyles, Button, List, Card, CardActions,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	ButtonGroup,
	CardContent
} from "@material-ui/core";
import React, { useState, useContext } from "react";
import { StoreContext } from "../../context/store-context";
import useInterval from "@use-it/interval";
import { observer } from "mobx-react-lite";
import { Loader } from "../Loader";
import Metric from "./Metric";
import { calculateNewSupply, shortenNumbers, numberWithCommas, getPercentageChange } from '../../mobx/utils/digHelpers'
import { WBTC_ADDRESS } from '../../config/constants';
import BigNumber from "bignumber.js";
import { ArrowRightAlt } from "@material-ui/icons";
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
	},
	cardActions: {
		padding: theme.spacing(0, 0, 2),
		justifyContent: 'center'
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
		}
	}


}));
const Info = observer((props: any) => {

	const store = useContext(StoreContext);
	const { uiState: { rebaseStats }, contracts: { tokens } } = store
	const classes = useStyles();
	const previousSupply = rebaseStats.totalSupply && rebaseStats.pastRebase ? rebaseStats.totalSupply.minus(
		new BigNumber(rebaseStats.pastRebase.requestedSupplyAdjustment).dividedBy(Math.pow(10, rebaseStats.decimals))) : null
	const [nextRebase, setNextRebase] = useState("00:00:00");
	const newSupply = rebaseStats.oracleRate && rebaseStats.totalSupply ? calculateNewSupply(rebaseStats.oracleRate.toNumber(), rebaseStats.totalSupply.toNumber(), rebaseStats.rebaseLag) : 0;
	const isPositive = !newSupply || newSupply >= rebaseStats.totalSupply;
	const percentage = newSupply && rebaseStats.totalSupply ?
		((newSupply - rebaseStats.totalSupply) / rebaseStats.totalSupply * 100) : 0;

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
				metric='Market Cap'
				value={`$${numberWithCommas(mockDiggMarketCap.toString())}`}
				submetrics={[
					{ title: '1h', value: '2.45', change: true },
					{ title: '24h', value: '12.45', change: true },
					{ title: '7d', value: '-3.4', change: true },
				]}
			/>
		</Grid>
		<Grid item xs={12} md={3}>
			<Metric
				metric='Total Supply'
				value={shortenNumbers(rebaseStats.totalSupply, '', 2)}
				submetrics={[
					{ title: 'Change', value: previousSupply ? getPercentageChange(rebaseStats.totalSupply, previousSupply).toFixed(2) : '-', change: true },
					{ title: 'Previous Supply', value: previousSupply ? shortenNumbers(previousSupply, '', 2) : '-' },
				]}
			/>
		</Grid>
		<Grid item xs={6} md={3}>
			<Metric
				metric='Oracle Price'
				value={'$42,109'}
				submetrics={[
					{ title: 'Change', value: '-13.40', change: true },
					{ title: 'Previous Price', value: '$47,497' },
				]}
			/>
		</Grid>
		<Grid item xs={6} md={3}>
			<Metric
				metric='BTC Price'
				value={'$40,345'}
				submetrics={[
					{ title: 'Change', value: '1.043', change: true },
					{ title: 'Current Ratio', value: '1.043' },
				]}
			/>
		</Grid>

		<Grid item xs={12} style={{ textAlign: 'center', paddingBottom: 0 }} >
			<Typography variant="subtitle1">Current Rebase</Typography>
		</Grid>
		<Grid item xs={12} md={6}>
			<Card >
				<CardContent className={classes.statPaper}>
					<List style={{ padding: 0 }}>
						<ListItem >
							<Typography variant="body2">Time to Rebase</Typography>
							<ListItemSecondaryAction>
								<Typography variant="body1">{nextRebase || '...'}</Typography>
							</ListItemSecondaryAction>
						</ListItem>

						<ListItem >
							<Typography variant="body2">Current Price Ratio</Typography>
							<ListItemSecondaryAction>
								<Typography variant="body1">{numberWithCommas(newSupply.toFixed(2)) || '...'}</Typography>
							</ListItemSecondaryAction>
						</ListItem>

					</List>
				</CardContent>
				<CardActions >
					<Button size="small" fullWidth variant="contained" color="primary" disabled>
						TRIGGER REBASE
					</Button>
				</CardActions>


			</Card>
		</Grid>
		<Grid item xs={12} md={6}>
			<Card >
				<CardContent className={classes.statPaper}>
					<List style={{ padding: 0 }}>
						<ListItem >
							<Typography variant="body2">Rebase Impact</Typography>
							<ListItemSecondaryAction className={classes.secondaryAction}>
								<Typography variant="body1" className={isPositive ? classes.up : classes.down}>
									1 DIGG <ArrowRightAlt style={{ transform: 'translate(0,7px)' }} /> {(percentage ? Math.abs(percentage).toFixed(2) : '...')} DIGG
								</Typography>
							</ListItemSecondaryAction>
						</ListItem>

						<ListItem >
							<Typography variant="body2">Supply After Rebase</Typography>
							<ListItemSecondaryAction className={classes.secondaryAction}>
								<Typography variant="body1">{numberWithCommas(newSupply.toFixed(2)) || '...'}</Typography>
							</ListItemSecondaryAction>
						</ListItem>

					</List>
				</CardContent>
				<CardActions style={{ justifyContent: 'center' }}>
					<Button variant="outlined" fullWidth size="small" color="default">
						How it works
					</Button>
					<Button variant="outlined" fullWidth size="small" color="default">
						Get DIGG
					</Button>
				</CardActions>
			</Card>
		</Grid>

		<Grid item xs={12} style={{ textAlign: 'center', paddingBottom: 0 }} >
			<Typography variant="subtitle1">Charts</Typography>
		</Grid>
	</>
});

export default Info;
