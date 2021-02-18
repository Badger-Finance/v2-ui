import React, { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';
import { Tooltip, IconButton, Grid, Chip } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { VaultSymbol } from '../../Common/VaultSymbol';
import { formatWithCommas } from 'mobx/utils/api';
import { UnfoldMoreTwoTone } from '@material-ui/icons';
import { usdToCurrency } from '../../../mobx/utils/helpers';
import BigNumber from 'bignumber.js';
import { TokenCardProps } from '../../../mobx/model';

const useStyles = makeStyles((theme) => ({
	border: {
		borderBottom: `1px solid ${theme.palette.background.default}`,
		padding: theme.spacing(2, 2),
		alignItems: 'center',
		overflow: 'hidden',
		transition: '.2s background ease-out',
		cursor: 'pointer',
		'&:hover': {
			background: '#3a3a3a',
		},
		'&:active': {
			background: theme.palette.background.default,
		},
	},
	mobileLabel: {
		textAlign: 'right',
		paddingRight: theme.spacing(2),
		[theme.breakpoints.up('md')]: {
			display: 'none',
		},
	},
	name: {
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(2),
		},
	},
	chip: {
		marginLeft: theme.spacing(1),
		padding: 0,
	},
}));

export const TokenCard = (props: TokenCardProps): JSX.Element => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { sett, isGlobal, onOpen, vault } = props;
	const { period, currency } = store.uiState;
	const { assets, farmData } = store.sett;
	const getRoi = () => {
		const getTooltip = (base: number, badger: number, digg: number, divisor: number): string => {
			const adjBase = divisor ? base / divisor : base;
			let tooltip = `${adjBase.toFixed(2)}% ${sett.symbol}`;
			if (badger) {
				const adjBadger = divisor ? badger / divisor : badger;
				tooltip += ` + ${adjBadger.toFixed(2)}% Badger`;
			}
			if (digg) {
				const adjDigg = divisor ? digg / divisor : digg;
				tooltip += ` + ${adjDigg.toFixed(2)}% Digg`;
			}
			return tooltip;
		};
		if (farmData && farmData[sett.asset] && farmData[sett.asset].apy) {
			const { apy, badgerApy, diggApy } = farmData[sett.asset];
			const baseApy = apy - badgerApy - diggApy;
			if (period === 'month') {
				return { apy: apy / 12, tooltip: getTooltip(baseApy, badgerApy, diggApy, 12) };
			} else {
				return { apy: apy, tooltip: getTooltip(baseApy, badgerApy, diggApy, 1) };
			}
		}
		return { apy: 0, tooltip: '' };
	};

	const getTokens = () => {
		const tokenCount = assets[`${sett.asset}Tokens`];
		if (tokenCount > 0 && tokenCount < 0.00001) {
			// Visual 0 Balance
			return '< 0.00001';
		}
		return formatWithCommas(tokenCount);
	};
	const tokensAmount = getTokens();
	const { apy, tooltip } = getRoi();

	return (
		<>
			<Grid onClick={() => onOpen(vault, sett)} container className={classes.border}>
				<Grid item xs={12} md={4} className={classes.name}>
					<VaultSymbol token={sett} />
					<Typography variant="body1">{sett.title}</Typography>
					<Typography variant="body2" color="textSecondary" component="div">
						{sett.symbol}
						{/* TODO: Refactor this check on v2 (this is bad!) */}
						{sett && sett.position === 8 && (
							<Chip className={classes.chip} label="Harvest" size="small" color="primary" />
						)}
					</Typography>
				</Grid>

				<Grid item className={classes.mobileLabel} xs={6}>
					<Typography variant="body2" color={'textSecondary'}>
						{!isGlobal ? 'Tokens Available' : 'Tokens Deposited'}
					</Typography>
				</Grid>
				<Grid item xs={6} md={2}>
					<Typography variant="body1" color={'textPrimary'}>
						{tokensAmount}
					</Typography>
				</Grid>

				<Grid item className={classes.mobileLabel} xs={6}>
					<Typography variant="body2" color={'textSecondary'}>
						{!isGlobal ? 'Potential ROI' : 'ROI'}
					</Typography>
				</Grid>
				<Grid item xs={6} md={2}>
					<Tooltip enterDelay={0} leaveDelay={300} arrow placement="left" title={tooltip}>
						<Typography style={{ cursor: 'default' }} variant="body1" color={'textPrimary'}>
							{apy.toFixed(2)}%
						</Typography>
					</Tooltip>
				</Grid>
				<Grid item className={classes.mobileLabel} xs={6}>
					<Typography variant="body2" color={'textSecondary'}>
						Value
					</Typography>
				</Grid>
				<Grid item xs={6} md={2}>
					<Typography variant="body1" color={'textPrimary'}>
						{usdToCurrency(new BigNumber(assets[sett.asset]), currency)}
					</Typography>
				</Grid>

				<Grid item xs={12} md={2} style={{ textAlign: 'right' }}>
					{vault ? (
						<IconButton
							color={vault.balance.gt(0) || vault.underlyingToken.balance.gt(0) ? 'default' : 'secondary'}
						>
							<UnfoldMoreTwoTone />
						</IconButton>
					) : (
						<IconButton color="secondary">
							<UnfoldMoreTwoTone />
						</IconButton>
					)}
				</Grid>
			</Grid>
		</>
	);
};
