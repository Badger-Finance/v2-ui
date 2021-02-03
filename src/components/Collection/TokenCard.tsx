import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Tooltip, IconButton, Grid, Chip } from '@material-ui/core';
import deploy from 'config/deployments/mainnet.json';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { VaultSymbol } from '../Common/VaultSymbol';
import { formatWithCommas } from 'mobx/utils/api';
import { UnfoldMoreTwoTone } from '@material-ui/icons';
import {
	formatBalance,
	formatHoldingsValue,
	formatVaultGrowth,
	simulateDiggSchedule,
} from 'mobx/reducers/statsReducers';

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
export const TokenCard = observer((props: any) => {
	const store = useContext(StoreContext);
	const classes = useStyles();

	const { sett, isGlobal, onOpen, vault } = props;
	const { period, currency } = store.uiState;
	const { assets } = store.contracts;
	const { underlyingToken: token } = vault;

	const tokensAmount = isGlobal ? formatWithCommas(assets[`${sett.asset}Tokens`].toFixed(5)) : formatBalance(token);
	const value = isGlobal
		? `$${formatWithCommas(assets[sett.asset].toFixed(2))}`
		: formatHoldingsValue(vault, currency);
	const { tokens } = store.contracts;

	const { roi, roiTooltip } = formatVaultGrowth(vault, period);

	const fixedRoi = isNaN(parseFloat(roi))
		? '1%'
		: vault.underlyingToken.address === deploy.digg_system.uFragments.toLowerCase()
		? simulateDiggSchedule(vault, tokens[deploy.digg_system.uFragments.toLowerCase()])
		: roi;
	const fixedRoiTooltip =
		vault.underlyingToken.address === deploy.digg_system.uFragments.toLowerCase() ? fixedRoi + ' DIGG' : roiTooltip;

	return (
		<>
			<Grid onClick={() => onOpen(vault, sett)} container className={classes.border}>
				<Grid item xs={12} md={4} className={classes.name}>
					<VaultSymbol token={sett.asset} />

					<Typography variant="body1">{sett.title}</Typography>
					<Typography variant="body2" color="textSecondary" component="div">
						{sett.asset}
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
						{value}
					</Typography>
				</Grid>

				<Grid item xs={12} md={2} style={{ textAlign: 'right' }}>
					<IconButton color={vault.balance.gt(0) || token.balance.gt(0) ? 'default' : 'secondary'}>
						<UnfoldMoreTwoTone />
					</IconButton>
				</Grid>
			</Grid>
		</>
	);
});
