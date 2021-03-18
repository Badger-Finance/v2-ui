import React, { useContext, useState } from 'react';

import { StoreContext } from '../../../mobx/store-context';
import { Tooltip, IconButton, Grid, Chip } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { VaultSymbol } from '../../Common/VaultSymbol';
import { UnfoldMoreTwoTone } from '@material-ui/icons';
import useInterval from '@use-it/interval';
import { Vault } from '../../../mobx/model';

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

interface DepositCardProps {
	isGlobal: boolean;
	vault: Vault;
	sett: any;
	onOpen: any;
	balance: string;
	balanceValue: string;
}

export const DepositCard = (props: DepositCardProps): React.ReactElement => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { sett, vault, onOpen, balance, balanceValue } = props;
	const { period } = store.uiState;
	const { farmData } = store.sett;

	const { underlyingToken: token } = vault;

	if (!token) {
		return <div />;
	}

	// TODO: Helper / Utility Function across TokenCard / DepositCard
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
	const { apy, tooltip } = getRoi();

	return (
		<>
			<Grid onClick={() => onOpen(vault, sett)} container className={classes.border}>
				<Grid item xs={12} md={4} className={classes.name}>
					<VaultSymbol token={sett} iconName={sett.asset.toLowerCase()} />
					<Typography variant="body1">{token.name}</Typography>
					<Typography variant="body2" color="textSecondary" component="div">
						{token.symbol}
						{!!vault.super && (
							<Chip className={classes.chip} label="Harvest" size="small" color="primary" />
						)}
					</Typography>
				</Grid>

				<Grid item className={classes.mobileLabel} xs={6}>
					<Typography variant="body2" color={'textSecondary'}>
						Deposited
					</Typography>
				</Grid>
				<Grid item xs={6} md={2}>
					<Typography variant="body1" color={'textPrimary'}>
						{balance}
					</Typography>
				</Grid>
				<Grid item className={classes.mobileLabel} xs={6}>
					<Typography variant="body2" color={'textSecondary'}>
						ROI
					</Typography>
				</Grid>
				<Grid item xs={6} md={2}>
					<Tooltip enterDelay={0} leaveDelay={300} arrow placement="left" title={tooltip}>
						<Typography style={{ cursor: 'default' }} variant="body1" color={'textPrimary'}>
							{`${apy.toFixed(2)}%`}
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
						{balanceValue}
					</Typography>
				</Grid>
				<Grid item xs={12} md={2} style={{ textAlign: 'right' }}>
					<IconButton color="default">
						<UnfoldMoreTwoTone />
					</IconButton>
				</Grid>
			</Grid>
		</>
	);
};
