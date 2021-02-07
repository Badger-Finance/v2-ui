import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import {
	Grid,
	Container,
	ButtonGroup,
	Button,
	Paper,
	Select,
	MenuItem,
	FormControlLabel,
	Switch,
	List,
	ListItem,
	ListItemText,
	Tooltip,
} from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Loader } from '../Loader';

import { SettList } from './Setts';
import { CLAIMS_SYMBOLS } from 'config/constants';
import { formatPrice } from 'mobx/reducers/statsReducers';
import { formatUsd } from 'mobx/utils/api';
import { inCurrency } from '../../mobx/utils/helpers';
import useInterval from '@use-it/interval';
import Hero from 'components/Common/Hero';

const useStyles = makeStyles((theme) => ({
	root: {
		marginTop: theme.spacing(11),
		marginBottom: theme.spacing(10),
		[theme.breakpoints.up('md')]: {
			paddingLeft: theme.spacing(33),
			marginTop: theme.spacing(2),
		},
	},
	filters: {
		textAlign: 'left',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'right',
		},
	},
	buttonGroup: {
		display: 'inline',
		marginRight: theme.spacing(1),
		[theme.breakpoints.up('md')]: {
			marginRight: theme.spacing(0),
			marginLeft: theme.spacing(1),
		},
	},
	select: {
		height: '1.8rem',
		fontSize: '.9rem',
		overflow: 'hidden',
	},
	selectInput: {
		margin: 0,
	},

	statPaper: {
		padding: theme.spacing(2),
		textAlign: 'center',
	},
	before: {
		marginTop: theme.spacing(3),
		width: '100%',
	},
	carousel: {
		overflow: 'inherit',
		marginTop: theme.spacing(1),
	},
	featuredHeader: {
		marginBottom: theme.spacing(2),
	},
	indicatorContainer: {
		display: 'none',
	},
	indicator: {
		fontSize: '11px',
		width: '1rem',
	},
	activeIndicator: {
		fontSize: '11px',
		width: '1rem',
		color: '#fff',
	},
	rewards: {
		marginTop: theme.spacing(1),
	},
	rewardItem: {
		padding: 0,
		flexWrap: 'wrap',
	},

	heroPaper: {
		padding: theme.spacing(3, 0),
		minHeight: '100%',
		background: 'none',
		textAlign: 'left',
		[theme.breakpoints.up('md')]: {},
	},
}));
export const Collection = observer(() => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const {
		wallet: { connectedAddress, isCached },
		contracts: { tokens },
		sett: { assets, badger },
		rewards: { claimGeysers, badgerTree },
		uiState: {
			stats,

			currency,
			period,
			setCurrency,
			setPeriod,
			hideZeroBal,
			setHideZeroBal,
		},
	} = store;

	if (!tokens) {
		return <Loader />;
	}

	const [update, forceUpdate] = useState<boolean>();
	useInterval(() => forceUpdate(!update), 1000);

	const spacer = () => <div className={classes.before} />;

	const availableRewards = () => {
		return badgerTree.claims.map((claim: BigNumber, idx: number) => {
			const claimValue = claim ? claim.dividedBy(idx == 0 ? 1e18 : badgerTree.sharesPerFragment * 1e9) : claim;
			const claimDisplay = inCurrency(claimValue, 'eth', true);
			return (
				parseFloat(claimDisplay) > 0 && (
					<ListItemText primary={claimDisplay} secondary={`${CLAIMS_SYMBOLS[idx]} Available to Claim`} />
				)
			);
		});
	};

	const rewards = _.compact(availableRewards());
	const tvl = assets.totalValue ? formatUsd(assets.totalValue) : '$0.00';
	const badgerPrice =
		badger && badger.market_data && badger.market_data.current_price
			? formatUsd(badger.market_data.current_price.usd)
			: '$0.00';

	return (
		<>
			<Container className={classes.root}>
				<Grid container spacing={1} justify="center">
					<Grid item sm={12} xs={12}>
						<Hero title="Sett Vaults" subtitle="Powerful Bitcoin strategies. Automatic staking rewards" />
					</Grid>
					<Grid item sm={6}>
						<FormControlLabel
							control={
								<Switch
									checked={hideZeroBal}
									onChange={() => {
										!!connectedAddress && setHideZeroBal(!hideZeroBal);
									}}
									color="primary"
								/>
							}
							label="Wallet balances"
						/>
					</Grid>

					<Grid item sm={6} className={classes.filters}>
						<Tooltip
							enterDelay={0}
							leaveDelay={300}
							arrow
							placement="left"
							title="ROI combines the appreciation of the vault with its $BADGER or $DIGG emissions. All numbers are an approximation based on historical data."
						>
							<span className={classes.buttonGroup}>
								<Select
									variant="outlined"
									value={period}
									onChange={(v: any) => setPeriod(v.target.value)}
									className={classes.select}
									style={{ marginTop: 'auto', marginBottom: 'auto' }}
								>
									<MenuItem value={'month'}>MONTH</MenuItem>
									<MenuItem value={'year'}>YEAR</MenuItem>
								</Select>
							</span>
						</Tooltip>

						<span className={classes.buttonGroup}>
							<Select
								variant="outlined"
								value={currency}
								onChange={(v: any) => setCurrency(v.target.value)}
								className={classes.select}
								style={{ marginTop: 'auto', marginBottom: 'auto' }}
							>
								<MenuItem value={'usd'}>USD</MenuItem>
								<MenuItem value={'cad'}>CAD</MenuItem>
								<MenuItem value={'btc'}>BTC</MenuItem>
								<MenuItem value={'eth'}>ETH</MenuItem>
							</Select>
						</span>
					</Grid>

					<Grid item xs={12} md={!!connectedAddress ? 4 : 6}>
						<Paper elevation={2} className={classes.statPaper}>
							<Typography variant="subtitle1" color="textPrimary">
								TVL
							</Typography>
							<Typography variant="h5">{tvl}</Typography>
						</Paper>
					</Grid>
					{!!connectedAddress && (
						<Grid item xs={12} md={4}>
							<Paper elevation={2} className={classes.statPaper}>
								<Typography variant="subtitle1" color="textPrimary">
									Your Portfolio
								</Typography>
								<Typography variant="h5">{formatPrice(stats.stats.portfolio, currency)}</Typography>
							</Paper>
						</Grid>
					)}

					<Grid item xs={12} md={!!connectedAddress ? 4 : 6}>
						<Paper elevation={2} className={classes.statPaper}>
							<Typography variant="subtitle1" color="textPrimary">
								Badger Price
							</Typography>
							<Typography variant="h5">{badgerPrice}</Typography>
						</Paper>
					</Grid>

					{spacer()}

					{!!connectedAddress && rewards.length > 0 && badgerTree.claims.length > 0 && (
						<>
							<Grid item xs={12} style={{ textAlign: 'center', paddingBottom: 0 }}>
								<Typography variant="subtitle1" color="textPrimary">
									Available Rewards:
								</Typography>
							</Grid>
							<Grid item xs={12} md={6}>
								<Paper className={classes.statPaper}>
									<List style={{ padding: 0, textAlign: 'center' }}>
										<ListItem className={classes.rewardItem}>{rewards}</ListItem>
										{spacer()}
										<ButtonGroup size="small" variant="outlined" color="primary">
											<Button
												onClick={() => {
													claimGeysers(false);
												}}
												variant="contained"
											>
												Claim
											</Button>
										</ButtonGroup>
									</List>
								</Paper>
							</Grid>
						</>
					)}

					{spacer()}

					<SettList isGlobal={!isCached()} hideEmpty={hideZeroBal} />
				</Grid>
			</Container>
		</>
	);
});
