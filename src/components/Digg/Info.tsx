import { Grid, Paper, makeStyles, Button, Typography, Tooltip, IconButton } from '@material-ui/core';
import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { observer } from 'mobx-react-lite';
import { Loader } from '../Loader';
import Metric from './Metric';
import { shortenNumbers } from '../../mobx/utils/diggHelpers';
import { inCurrency } from 'mobx/utils/helpers';
import { InfoItem } from './InfoItem';
import BigNumber from 'bignumber.js';
import NoWallet from 'components/Common/NoWallet';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import DroptModal from './DroptModal';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';

const useStyles = makeStyles((theme) => ({
	darkPaper: {
		padding: theme.spacing(2),
		boxShadow: 'none',
		display: 'flex',
		width: '99%',
		flexDirection: 'column',
		alignItems: 'center',
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
		background: '#121212',
	},
	darkActions: {
		background: '#121212',
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
	metricsContainer: {
		display: 'flex',
		justifyContent: 'space-around',
		width: '100%',
		padding: theme.spacing(2),
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
		},
	},
	updatedAt: {
		marginBottom: theme.spacing(1),
	},
	learnMoreButton: {
		marginBottom: theme.spacing(2.5),
		width: '135px',
	},
	twapTooltip: {
		textAlign: 'center',
		fontSize: '0.8rem',
	},
	infoIconButton: {
		marginLeft: theme.spacing(1),
		cursor: 'pointer',
		color: 'inherit',
		padding: '0px',
	},
	infoIcon: {
		height: '20px',
		width: '20px',
	},
}));

const Info = observer(() => {
	const store = useContext(StoreContext);
	const {
		vaults: { vaultMap },
		uiState: { currency },
		rebase: { rebase },
		onboard,
		prices,
	} = store;

	const classes = useStyles();
	const [nextRebase, setNextRebase] = useState('00:00:00');

	useEffect(() => {
		const rebaseInterval = setInterval(() => {
			if (!!rebase && !!rebase.nextRebase) {
				const zero = new Date(0);
				zero.setTime(rebase.nextRebase.getTime() - new Date().getTime());
				setNextRebase(zero.toISOString().substr(11, 8));
			}
		}, 1000);
		return () => clearInterval(rebaseInterval);
	}, [rebase]);

	if (!onboard.isActive()) {
		return <NoWallet message="Connect wallet to see DIGG rebase statistics." />;
	}

	if (!rebase || !vaultMap) {
		return <Loader message="Loading DIGG data..." />;
	}

	// reference implementation
	// https://badger-finance.gitbook.io/badger-finance/digg/digg-faq
	const wbtcPrice = prices.getPrice(ETH_DEPLOY.tokens.wBTC);
	const diggCurrentPrice = prices.getPrice(ETH_DEPLOY.tokens.digg);
	const diggPrice = rebase.oracleRate.multipliedBy(wbtcPrice);
	const diggWbtcCurrentRatio = diggCurrentPrice.dividedBy(wbtcPrice).toFixed(5);
	const priceDelta = rebase.oracleRate.minus(1);
	const rebasePercent = priceDelta.gt(0.05) || priceDelta.lt(-0.05) ? priceDelta.multipliedBy(10) : new BigNumber(0);
	const lastOracleUpdate = new Date(rebase.latestAnswer * 1000);
	const isValidTwap = rebase.latestRebase < rebase.latestAnswer;

	const pickRebaseOption = (positive: string, negative: string, neutral?: string): string => {
		if (rebasePercent.gt(0)) {
			return positive;
		}
		if (rebasePercent.lt(0)) {
			return negative;
		}
		return neutral ?? '';
	};
	const rebaseStyle = { color: pickRebaseOption('#5efc82', 'red', 'inherit') };
	const sign = pickRebaseOption('+', '');
	const rebaseDisplay = `${sign}${rebasePercent.toFixed(6)}%`;
	const ppfs = vaultMap[ETH_DEPLOY.sett_system.vaults['native.digg']].pricePerFullShare;

	const invalidTwap = (
		<div className={classes.twapTooltip}>
			Potential rebase is only shown when Chainlink Oracle data is updated prior to rebase.
			<br />
			<br />
			Click for estimated current rebase data based off an unofficial 24 hour TWAP.
		</div>
	);

	return (
		<>
			<DroptModal />
			<Grid item xs={12} md={6}>
				<Metric metric="BTC Price" value={inCurrency(wbtcPrice, currency)} />
			</Grid>
			<Grid item xs={12} md={6}>
				<Metric metric="DIGG Oracle Price" value={inCurrency(diggPrice, currency)} />
			</Grid>
			<Grid item xs={12} md={6}>
				<Metric metric="DIGG / BTC Current Ratio" value={diggWbtcCurrentRatio.toString()} />
			</Grid>
			<Grid item xs={12} md={6}>
				<Metric metric="DIGG Current Price" value={inCurrency(diggCurrentPrice, currency)} />
			</Grid>
			<Grid item xs={12} md={6}>
				<Metric
					metric="Total Supply"
					value={rebase.totalSupply ? shortenNumbers(rebase.totalSupply, '', 2) : '-'}
				/>
			</Grid>
			<Grid item xs={12} md={6}>
				<Metric metric="Time To Rebase" value={nextRebase} />
			</Grid>
			<Paper className={classes.darkPaper}>
				<div className={classes.metricsContainer}>
					<InfoItem metric="bDIGG Multiplier">{!!ppfs ? ppfs.toFixed(9) : '...'}</InfoItem>
					<InfoItem metric={`${isValidTwap ? 'Potential' : 'Previous'} Rebase`}>
						<div style={rebaseStyle} className={classes.rebasePaper}>
							<span>{rebaseDisplay}</span>
							{!isValidTwap && (
								<Tooltip enterTouchDelay={0} arrow title={invalidTwap} placement="right">
									<IconButton
										className={classes.infoIconButton}
										onClick={() => window.open('https://digg.finance/#info', '_blank')}
									>
										<HelpOutlineIcon className={classes.infoIcon} />
									</IconButton>
								</Tooltip>
							)}
						</div>
					</InfoItem>
					<InfoItem metric="Oracle Rate">{rebase.oracleRate.toFixed(8)}</InfoItem>
				</div>
				<Typography variant="caption">Last Updated {lastOracleUpdate.toLocaleString()}</Typography>
				<Typography variant="caption" className={classes.updatedAt}>
					NOTE: Oracle updates approximately every 24 hours.
				</Typography>
			</Paper>
			<Button
				aria-label="Learn More"
				variant="contained"
				fullWidth
				size="small"
				color="primary"
				href="https://badger.finance/digg"
				target="_"
				className={classes.learnMoreButton}
			>
				Learn More
			</Button>
		</>
	);
});

export default Info;
