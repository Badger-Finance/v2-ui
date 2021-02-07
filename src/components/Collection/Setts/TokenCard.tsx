import React, { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';
import { Tooltip, IconButton, Grid, Chip } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { VaultSymbol } from '../../Common/VaultSymbol';
import { formatWithCommas } from 'mobx/utils/api';
import { UnfoldMoreTwoTone } from '@material-ui/icons';

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

export const TokenCard = (props: any) => {
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
			const totalApy = apy + badgerApy + diggApy;
			if (period === 'month') {
				return { apy: totalApy / 12, tooltip: getTooltip(apy, badgerApy, diggApy, 12) };
			} else {
				return { apy: totalApy, tooltip: getTooltip(apy, badgerApy, diggApy, 1) };
			}
		}
		return { apy: 0, tooltip: '' };
	};

	let tokensAmount = formatWithCommas(assets[`${sett.asset}Tokens`].toFixed(5));
	let value = `$${formatWithCommas(assets[sett.asset].toFixed(2))}`;

	const onCardClick = () => {
		onOpen(vault, sett);
	};

	const { apy, tooltip } = getRoi();
	return (
		<>
			<Grid onClick={onCardClick} container className={classes.border}>
				<Grid item xs={12} md={4} className={classes.name}>
					<VaultSymbol token={sett.asset} />

					<Typography variant="body1">{sett.title}</Typography>
					<Typography variant="body2" color="textSecondary" component="div">
						{sett.symbol}
						{!!sett.title.includes('Harvest') && (
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
						{value}
					</Typography>
				</Grid>

				<Grid item xs={12} md={2} style={{ textAlign: 'right' }}>
					{vault ? (
						<IconButton color={vault.balance.gt(0) || vault.underlyingToken.balance.gt(0) ? 'default' : 'secondary'}>
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
