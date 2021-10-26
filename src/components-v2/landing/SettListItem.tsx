import React, { useContext, useState } from 'react';
import clsx from 'clsx';
import { ListItem, makeStyles, Typography, Grid, Tooltip } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { inCurrency } from 'mobx/utils/helpers';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { SettActionButtons } from '../common/SettActionButtons';
import { SettItemName } from './SettItemName';
import { SettItemApr } from './SettItemApr';
import { SettItemUserApr } from './SettItemUserApr';
import { StoreContext } from 'mobx/store-context';
import routes from '../../config/routes';
import { SettDeposit } from '../common/dialogs/SettDeposit';
import { SettWithdraw } from '../common/dialogs/SettWithdraw';
import { Currency } from 'config/enums/currency.enum';
import { Sett } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
	root: {
		borderBottom: `1px solid ${theme.palette.background.default}`,
		alignItems: 'center',
		overflow: 'hidden',
	},
	enabledSett: {
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
	listItem: {
		padding: 0,
		'&:last-child div': {
			borderBottom: 0,
		},
	},
	clickableSection: {
		alignItems: 'center',
		padding: theme.spacing(2, 0, 2, 2),
		[theme.breakpoints.down('sm')]: {
			padding: theme.spacing(2, 2, 0, 2),
		},
	},
	nonClickableSection: {
		padding: theme.spacing(2, 2, 2, 0),
		[theme.breakpoints.down('sm')]: {
			textAlign: 'center',
			padding: theme.spacing(1, 2, 2, 2),
		},
	},
}));

export interface SettListItemProps {
	sett: Sett;
	balance?: BigNumber;
	balanceValue?: string;
	accountView?: boolean;
	currency: Currency;
	period: string;
}

const SettListItem = observer(
	({ sett, balance, balanceValue, currency, period, accountView = false }: SettListItemProps): JSX.Element => {
		const { user, network, router, wallet, setts } = useContext(StoreContext);
		const [openDepositDialog, setOpenDepositDialog] = useState(false);
		const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);

		const classes = useStyles();

		const divisor = period === 'month' ? 12 : 1;
		const badgerSett = network.network.setts.find(({ vaultToken }) => vaultToken.address === sett?.settToken);

		const displayValue = balanceValue ? balanceValue : inCurrency(new BigNumber(sett.value), currency);
		const multiplier = !sett.deprecated ? user.accountDetails?.multipliers[sett.settToken] : undefined;

		const canWithdraw = balance ? balance.gt(0) : false;
		// sett is disabled if they are internal setts, or have a bouncer and use has no access
		const isDisabled = !user.onGuestList(sett);

		const goToSettDetail = async () => {
			await router.goTo(routes.settDetails, { settName: setts.getSlug(sett.settToken), accountView });
		};

		const listItem = (
			<ListItem className={classes.listItem} disabled={isDisabled}>
				<Grid container className={clsx(classes.root, !isDisabled && classes.enabledSett)}>
					<Grid container item xs={12} md={9} className={classes.clickableSection} onClick={goToSettDetail}>
						<Grid item xs={12} md={5} className={classes.name} container>
							<SettItemName sett={sett} />
						</Grid>
						<Grid item className={classes.mobileLabel} xs={6} md>
							<Typography variant="body2" color="textSecondary">
								ROI
							</Typography>
						</Grid>
						<Grid item xs={6} md>
							<SettItemApr sett={sett} divisor={isDisabled ? 1 : divisor} multiplier={multiplier} />
							{multiplier !== undefined && (
								<SettItemUserApr sett={sett} divisor={divisor} multiplier={multiplier} />
							)}
						</Grid>
						<Grid item className={classes.mobileLabel} xs={6} md>
							<Typography variant="body2" color={'textSecondary'}>
								Value
							</Typography>
						</Grid>
						<Grid item xs={6} md>
							<CurrencyDisplay displayValue={displayValue} variant="body1" justify="flex-start" />
						</Grid>
					</Grid>
					<Grid item xs={12} md className={classes.nonClickableSection}>
						<SettActionButtons
							isWithdrawDisabled={!wallet.connectedAddress || !canWithdraw}
							isDepositDisabled={!wallet.connectedAddress || isDisabled}
							onWithdrawClick={() => setOpenWithdrawDialog(true)}
							onDepositClick={() => setOpenDepositDialog(true)}
						/>
					</Grid>
				</Grid>
				{badgerSett && (
					<>
						<SettDeposit
							open={openDepositDialog}
							sett={sett}
							badgerSett={badgerSett}
							onClose={() => setOpenDepositDialog(false)}
						/>
						<SettWithdraw
							open={openWithdrawDialog}
							sett={sett}
							badgerSett={badgerSett}
							onClose={() => setOpenWithdrawDialog(false)}
						/>
					</>
				)}
			</ListItem>
		);

		if (isDisabled) {
			return (
				<Tooltip
					enterTouchDelay={0}
					enterDelay={0}
					leaveDelay={300}
					arrow
					placement="top-end"
					title="Your address is not included in the whitelist for this vault."
				>
					{listItem}
				</Tooltip>
			);
		}

		return listItem;
	},
);

export default SettListItem;
