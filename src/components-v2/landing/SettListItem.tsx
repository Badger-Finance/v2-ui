import { ListItem, makeStyles, Typography, Grid, Tooltip } from '@material-ui/core';
import { BigNumber } from 'bignumber.js';
import { Sett, TokenBalance } from 'mobx/model';
import { observer } from 'mobx-react-lite';
import { numberWithCommas, usdToCurrency } from 'mobx/utils/helpers';
import React, { useContext } from 'react';
import { StoreContext } from 'mobx/store-context';
import DisabledSettListItem from './DisabledSettListItem';
import CurrencyDisplay from '../common/CurrencyDisplay';
import SettBadge from './SettBadge';

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
	centerGrid: {
		textAlign: 'center',
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

interface RoiData {
	apr: string;
	tooltip: JSX.Element;
}

const SettListItem = observer(
	(props: SettListItemProps): JSX.Element => {
		const classes = useStyles();

		const { sett, balance, balanceValue, currency, period, onOpen } = props;
		const displayName = sett.name.split(' ').length > 1 ? sett.name.split(' ').slice(1).join(' ') : sett.name;
		const store = useContext(StoreContext);
		const { user } = store;
		const { network } = store.wallet;
		const isNewVault = !!network.newVaults[sett.vaultToken];

		const getRoi = (sett: Sett, period: string): RoiData => {
			const getToolTip = (sett: Sett, divisor: number): JSX.Element => {
				return (
					<>
						{sett.sources.map((source) => {
							const apr = `${(source.apr / divisor).toFixed(2)}% ${source.name}`;
							return <div key={source.name}>{apr}</div>;
						})}
					</>
				);
			};

			const getNewVaultToolTip = (): JSX.Element => {
				return (
					<>
						{network.newVaults[sett.vaultToken].map((source) => {
							return <div key={source}>{source}</div>;
						})}
					</>
				);
			};

			// If the vault is in the newVaults property, the ROI is not displaying properly due
			// to harvesting. Display the New Vault identifier and the list of provided projected
			// ROIs in the network object.
			if (isNewVault) {
				return {
					apr: '✨ New Vault ✨',
					tooltip: getNewVaultToolTip(),
				};
			} else if (sett && sett.apr) {
				const divisor = period === 'month' ? 12 : 1;
				let apr;
				if (sett.boostable && sett.minApr && sett.maxApr) {
					apr = `${(sett.minApr / divisor).toFixed(2)}% - ${(sett.maxApr / divisor).toFixed(2)}%`;
				} else {
					apr = `${(sett.apr / divisor).toFixed(2)}%`;
				}
				return { apr, tooltip: getToolTip(sett, divisor) };
			} else {
				return { apr: '0%', tooltip: <></> };
			}
		};

		const { apr, tooltip } = getRoi(sett, period);
		const displayValue = balanceValue ? balanceValue : usdToCurrency(new BigNumber(sett.value), currency);

		let userApr: number | undefined = undefined;
		const multiplier = user.accountDetails?.multipliers[sett.vaultToken];
		if (multiplier) {
			userApr = sett.sources
				.map((source) => (source.boostable ? source.apr * multiplier : source.apr))
				.reduce((total, apr) => (total += apr), 0);
		}

		return network.isWhitelisted[sett.vaultToken] && !user.viewSettShop() ? (
			<DisabledSettListItem
				apy={apr}
				tooltip={tooltip}
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
								sett.tokens.map((tokenBalance: TokenBalance, index: number) => {
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
					<Grid item xs={6} md={2} className={classes.centerGrid}>
						<Tooltip enterDelay={0} leaveDelay={300} arrow placement="left" title={tooltip}>
							<Typography style={{ cursor: 'default' }} variant="body1" color={'textPrimary'}>
								{apr}
							</Typography>
						</Tooltip>
						{!isNewVault && userApr && (
							<Typography style={{ cursor: 'default' }} variant="caption" color={'textPrimary'}>
								my: {userApr.toFixed(2)}%
							</Typography>
						)}
					</Grid>
					{/* Intentionally Empty Grid Space */}
					<Grid item xs={6} md={1} />
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
