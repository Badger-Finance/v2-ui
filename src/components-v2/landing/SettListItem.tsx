import { ListItem, makeStyles, Typography, Grid } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { numberWithCommas, usdToCurrency } from 'mobx/utils/helpers';
import React, { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';
import DisabledSettListItem from './DisabledSettListItem';
import CurrencyDisplay from '../common/CurrencyDisplay';
import SettBadge from './SettBadge';
import BigNumber from 'bignumber.js';
import { Sett } from '../../mobx/model/setts/sett';
import { SettTokenBalance } from '../../mobx/model/setts/sett-token-balance';
import { BouncerType } from 'mobx/model/setts/bouncer-type';

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
	desktopSpacer: {
		[theme.breakpoints.down('md')]: {
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
	centerGrid: {
		textAlign: 'center',
		[theme.breakpoints.down('md')]: {
			textAlign: 'left',
		},
	},
	vaultIcon: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
}));

export interface SettListItemProps {
	sett: Sett;
	balance?: string;
	balanceValue?: string;
	currency: string;
	period: string;
	onOpen: () => void;
}

const SettListItem = observer(
	(props: SettListItemProps): JSX.Element => {
		const classes = useStyles();
		const { sett, balance, balanceValue, currency, period, onOpen } = props;
		const displayName = sett.name.split(' ').length > 1 ? sett.name.split(' ').slice(1).join(' ') : sett.name;
		const store = useContext(StoreContext);
		const { user } = store;

		const displayValue = balanceValue ? balanceValue : usdToCurrency(new BigNumber(sett.value), currency);

		// TODO: Clean up no access implementation, too much duplication
		return sett.bouncer === BouncerType.Badger && !user.viewSettShop() ? (
			<DisabledSettListItem
				apy={0}
				displayName={displayName}
				sett={sett}
				balance={balance}
				balanceValue={balanceValue}
				currency={currency}
				period={period}
				onOpen={() => {
					return;
				}}
				disabledTooltip={'Your address is not included in the whitelist for this vault.'}
			/>
		) : (
			<ListItem className={classes.listItem} onClick={() => onOpen()}>
				<Grid container className={classes.border}>
					<Grid item xs={12} md={4} className={classes.name} container>
						<Grid item className={classes.vaultIcon}>
							<img
								alt={`Badger ${sett.name} Vault Symbol`}
								className={classes.symbol}
								src={`/assets/icons/${sett.asset.replaceAll('/', '-').toLowerCase()}.png`}
							/>
						</Grid>
						<Grid item>
							<Grid container direction={'column'}>
								<Typography variant="body1">{displayName}</Typography>
								<Grid container direction={'row'}>
									<Typography variant="body2" color="textSecondary">
										{sett.asset}
									</Typography>
									<SettBadge protocol={sett.name.split(' ')[0]} />
									{sett.deprecated && <SettBadge protocol={'No Emissions'} />}
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
											? `${sett.asset.replaceAll('/', '-').toLowerCase()}`
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
					<Grid item xs={6} md={2} className={classes.centerGrid}>
						{'--%'}
					</Grid>
					{/* Intentionally Empty Grid Space */}
					<Grid item xs={6} md={1} className={classes.desktopSpacer} />
					<Grid item className={classes.mobileLabel} xs={6}>
						<Typography variant="body2" color={'textSecondary'}>
							Value
						</Typography>
					</Grid>
					<Grid item xs={6} md={3}>
						<CurrencyDisplay displayValue={displayValue} variant="body1" justify="flex-start" />
					</Grid>
				</Grid>
			</ListItem>
		);
	},
);

export default SettListItem;
