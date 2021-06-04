import { ListItem, makeStyles, Typography, Grid, Tooltip, IconButton } from '@material-ui/core';
import { BigNumber } from 'bignumber.js';
import { SettListItemProps } from './SettListItem';
import { numberWithCommas, usdToCurrency } from 'mobx/utils/helpers';
import React from 'react';
import { UnfoldMoreTwoTone } from '@material-ui/icons';
import SettBadge from './SettBadge';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { SettTokenBalance } from 'mobx/model';

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
	symbol: {
		marginTop: 'auto',
		marginBottom: 'auto',
		padding: theme.spacing(0, 0, 0, 0),
		marginRight: theme.spacing(2),
		display: 'inline-block',
		float: 'left',
		width: '2.4rem',
	},
	tokenSymbol: {
		marginTop: 'auto',
		marginBottom: 'auto',
		padding: theme.spacing(0, 0, 0, 0),
		marginRight: theme.spacing(1),
		display: 'inline-block',
		float: 'left',
		width: '1rem',
	},
	listItem: {
		padding: 0,
		'&:last-child div': {
			borderBottom: 0,
		},
	},
}));

interface DisabledSettListItemProps extends SettListItemProps {
	apy: number | string;
	tooltip: JSX.Element;
	displayName: string;
	disabledTooltip: string;
}

const DisabledSettListItem = (props: DisabledSettListItemProps): JSX.Element => {
	const classes = useStyles();

	const { apy, tooltip, displayName, sett, balance, balanceValue, currency, disabledTooltip, onOpen } = props;

	const displayValue = balanceValue ? balanceValue : usdToCurrency(new BigNumber(sett.value), currency);

	return (
		<Tooltip enterDelay={0} leaveDelay={300} arrow placement="top" title={disabledTooltip} onClick={() => onOpen()}>
			<ListItem disabled className={classes.listItem}>
				<Grid container className={classes.border}>
					<Grid item xs={12} md={4} className={classes.name} container>
						<Grid item>
							<img
								alt={`Badger ${sett.name} Vault Symbol`}
								className={classes.symbol}
								src={`/assets/icons/${sett.asset.toLowerCase()}.png`}
							/>
						</Grid>
						<Grid item>
							<Grid container direction={'column'}>
								<Typography variant="body1">{displayName}</Typography>
								<Grid container direction={'row'}>
									<Typography variant="body2" color="textSecondary">
										{sett.asset}
									</Typography>
									<SettBadge settName={sett.name.split(' ')[0]} />
								</Grid>
							</Grid>
						</Grid>
					</Grid>

					<Grid item xs={12} md={2} container>
						<Grid item className={classes.mobileLabel} xs={6}>
							<Typography variant="body2" color={'textSecondary'}>
								Tokens Deposited
							</Typography>
						</Grid>
						<Grid item xs={6} md={12}>
							{balance && (
								<Grid container alignItems={'center'}>
									<img
										alt={`${sett.name} symbol`}
										className={classes.tokenSymbol}
										src={`/assets/icons/${sett.asset.toLowerCase()}.png`}
									/>
									<Typography>{balance}</Typography>
								</Grid>
							)}
							{!balance &&
								sett.tokens.map((tokenBalance: SettTokenBalance, index: number) => {
									const iconName =
										sett.tokens.length === 1
											? `${sett.asset.toLowerCase()}`
											: `${tokenBalance.symbol.toLowerCase()}-small`;
									const icon = `/assets/icons/${iconName}.png`;
									const displayDecimals = tokenBalance.balance > 1 ? 0 : 4;
									const balanceDisplay = tokenBalance.balance.toFixed(displayDecimals);
									return (
										<Grid container key={`token-${index}`} alignItems={'center'}>
											<img
												alt={`${tokenBalance.name} symbol`}
												className={classes.tokenSymbol}
												src={icon}
											/>
											<Typography>{numberWithCommas(balanceDisplay)}</Typography>
										</Grid>
									);
								})}
						</Grid>
					</Grid>

					<Grid item className={classes.mobileLabel} xs={6}>
						<Typography variant="body2" color={'textSecondary'}>
							{'ROI'}
						</Typography>
					</Grid>
					<Grid item xs={6} md={2}>
						<Tooltip enterDelay={0} leaveDelay={300} arrow placement="left" title={tooltip}>
							<Typography style={{ cursor: 'default' }} variant="body1" color={'textPrimary'}>
								{typeof apy === 'number' ? `${apy.toFixed(2)}%` : apy}
							</Typography>
						</Tooltip>
					</Grid>
					<Grid item className={classes.mobileLabel} xs={6}>
						<Typography variant="body2" color={'textSecondary'}>
							Value
						</Typography>
					</Grid>
					<Grid item xs={6} md={2}>
						<CurrencyDisplay displayValue={displayValue} variant="body1" justify="flex-start" />
					</Grid>
					<Grid item xs={12} md={2} style={{ textAlign: 'right' }}>
						<IconButton color="default">
							<UnfoldMoreTwoTone />
						</IconButton>
					</Grid>
				</Grid>
			</ListItem>
		</Tooltip>
	);
};

export default DisabledSettListItem;
