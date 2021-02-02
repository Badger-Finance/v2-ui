import React, { useContext, useEffect, useState } from 'react';
import { observer, useForceUpdate } from 'mobx-react-lite';
import views from '../../config/routes';
import { StoreContext } from '../../mobx/store-context';
import { Tooltip, IconButton, Grid, Chip } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { VaultSymbol } from '../Common/VaultSymbol';
import { UnfoldMoreTwoTone } from '@material-ui/icons';
import {
	formatBalance,
	formatBalanceUnderlying,
	formatBalanceValue,
	formatGeyserBalance,
	formatGeyserBalanceValue,
	formatVaultGrowth,
} from 'mobx/reducers/statsReducers';
import useInterval from '@use-it/interval';
import deploy from 'config/deployments/mainnet.json';

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
export const DepositCard = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { vault, onOpen } = props;

	const { period, currency } = store.uiState;
	const { tokens } = store.contracts;

	const { underlyingToken: token, geyser } = vault;

	if (!token) {
		return <div />;
	}
	const [update, forceUpdate] = useState<boolean>();
	useInterval(() => forceUpdate(!update), 1000);

	const { roi, roiTooltip } = formatVaultGrowth(vault, period);
	let fixedRoi = isNaN(parseFloat(roi))
		? 'Infinity%'
		: roi;
	let fixedRoiTooltip =
		vault.underlyingToken.address === deploy.digg_system.uFragments.toLowerCase() ? fixedRoi + ' DIGG' : roiTooltip;

	return (
		<>
			<Grid onClick={() => onOpen(vault)} container className={classes.border}>
				<Grid item xs={12} md={4} className={classes.name}>
					<VaultSymbol token={token} />
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
						{!!geyser ? formatGeyserBalance(geyser) : formatBalanceUnderlying(vault)}
					</Typography>
				</Grid>
				<Grid item className={classes.mobileLabel} xs={6}>
					<Typography variant="body2" color={'textSecondary'}>
						ROI
					</Typography>
				</Grid>
				<Grid item xs={6} md={2}>
					<Tooltip enterDelay={0} leaveDelay={300} arrow placement="left" title={fixedRoiTooltip}>
						<Typography style={{ cursor: 'default' }} variant="body1" color={'textPrimary'}>
							{fixedRoi}
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
						{!!geyser ? formatGeyserBalanceValue(geyser, currency) : formatBalanceValue(vault, 'usd')}
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
});
