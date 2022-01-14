import React, { useContext, useState } from 'react';
import clsx from 'clsx';
import { makeStyles, Grid, Tooltip, useMediaQuery, useTheme, Card, Divider, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { inCurrency } from 'mobx/utils/helpers';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { VaultActionButtons } from '../common/VaultActionButtons';
import { VaultItemName } from './VaultItemName';
import { VaultItemApr } from './VaultItemApr';
import { StoreContext } from 'mobx/store-context';
import routes from '../../config/routes';
import { VaultDeposit, VaultModalProps } from '../common/dialogs/VaultDeposit';
import { VaultWithdraw } from '../common/dialogs/VaultWithdraw';
import { Vault, VaultState } from '@badger-dao/sdk';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { currencyConfiguration } from '../../config/currency.config';
import { NAME_COLUMN_MAX_WIDTH, INFORMATION_SECTION_MAX_WIDTH, APR_COLUMN_MAX_WIDTH } from './VaultListHeader';

const useStyles = makeStyles((theme) => ({
	root: {
		borderBottom: `1px solid ${theme.palette.background.default}`,
		minHeight: 108,
		display: 'flex',
		alignItems: 'center',
		marginBottom: theme.spacing(2),
	},
	enabledVault: {
		transition: '.2s background ease-out',
		cursor: 'pointer',
		'&:hover': {
			background: '#3a3a3a',
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
		[theme.breakpoints.up('lg')]: {
			flexGrow: 0,
			maxWidth: NAME_COLUMN_MAX_WIDTH,
			flexBasis: NAME_COLUMN_MAX_WIDTH,
		},
	},
	clickableSection: {
		alignItems: 'center',
		padding: theme.spacing(2, 0, 2, 2),
		[theme.breakpoints.up('lg')]: {
			flexGrow: 0,
			maxWidth: INFORMATION_SECTION_MAX_WIDTH,
			flexBasis: INFORMATION_SECTION_MAX_WIDTH,
		},
	},
	nonClickableSection: {
		padding: theme.spacing(2, 2, 2, 0),
	},
	itemText: {
		fontSize: 16,
	},
	apr: {
		[theme.breakpoints.up('lg')]: {
			flexGrow: 0,
			maxWidth: APR_COLUMN_MAX_WIDTH,
			flexBasis: APR_COLUMN_MAX_WIDTH,
		},
	},
	tvl: {
		[theme.breakpoints.down('md')]: {
			display: 'none',
		},
	},
	aprMobile: {
		display: 'flex',
		flexDirection: 'column-reverse',
	},
	aprMobileNoBoost: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	divider: {
		width: 'calc(100% + 32px)',
		marginLeft: theme.spacing(-2),
	},
	amountsSection: {
		margin: theme.spacing(2, 0),
	},
	actionButtonsMobile: {
		marginTop: theme.spacing(3),
	},
	nameAndAprMobile: {
		marginBottom: theme.spacing(1),
	},
	amountsMobile: {
		fontWeight: 400,
	},
	mobileContainer: {
		marginBottom: theme.spacing(3),
		padding: theme.spacing(2),
		backgroundColor: 'rgba(58, 58, 58, 1)',
		cursor: 'pointer',
	},
}));

export interface VaultListItemProps {
	vault: Vault;
	depositBalance: TokenBalance;
	// this will probably never be used except for special cases such as the ibBTC zap deposit workflow
	CustomDepositModal?: (props: VaultModalProps) => JSX.Element;
}

const VaultListItem = observer(({ vault, CustomDepositModal, depositBalance }: VaultListItemProps): JSX.Element => {
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
	const { user, network, router, onboard, vaults } = useContext(StoreContext);
	const [openDepositDialog, setOpenDepositDialog] = useState(false);
	const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);

	const classes = useStyles();
	const badgerVault = network.network.vaults.find(({ vaultToken }) => vaultToken.address === vault?.vaultToken);

	const depositBalanceDisplay = depositBalance.tokenBalance.gt(0)
		? depositBalance.balanceValueDisplay(vaults.vaultsFilters.currency)
		: `${currencyConfiguration[vaults.vaultsFilters.currency].prefix}-`;

	const canWithdraw = depositBalance.tokenBalance.gt(0);

	const multiplier =
		vault.state !== VaultState.Deprecated ? user.accountDetails?.multipliers[vault.vaultToken] : undefined;

	// sett is disabled if they are internal setts, or have a bouncer and use has no access
	const isDisabled = !user.onGuestList(vault);

	const goToVaultDetail = async () => {
		await router.goTo(routes.settDetails, { settName: vaults.getSlug(vault.vaultToken) });
	};

	const DepositModal = CustomDepositModal || VaultDeposit;

	const vaultModals = badgerVault ? (
		<>
			<DepositModal
				open={openDepositDialog}
				vault={vault}
				badgerVault={badgerVault}
				onClose={() => setOpenDepositDialog(false)}
			/>
			<VaultWithdraw
				open={openWithdrawDialog}
				vault={vault}
				badgerVault={badgerVault}
				onClose={() => setOpenWithdrawDialog(false)}
			/>
		</>
	) : null;

	if (isMobile) {
		return (
			<Grid container component={Card} className={classes.mobileContainer}>
				<Grid container spacing={2} className={classes.nameAndAprMobile} onClick={goToVaultDetail}>
					<Grid item xs={12}>
						<VaultItemName vault={vault} boost={user.accountDetails?.boost} />
					</Grid>
				</Grid>
				<Divider className={classes.divider} />
				<Grid container className={classes.amountsSection} onClick={goToVaultDetail}>
					<Grid item xs={6}>
						<Typography
							display="inline"
							variant="body1"
							className={classes.amountsMobile}
						>{`TVL: `}</Typography>
						<CurrencyDisplay
							displayValue={inCurrency(new BigNumber(vault.value), vaults.vaultsFilters.currency, 0)}
							variant="body1"
							justifyContent="flex-start"
							TypographyProps={{ className: classes.amountsMobile }}
						/>
					</Grid>
					<Grid item xs>
						<Typography
							display="inline"
							variant="body1"
							className={classes.amountsMobile}
						>{`My Deposits: `}</Typography>
						<CurrencyDisplay
							displayValue={depositBalanceDisplay}
							variant="body1"
							justifyContent="flex-start"
							TypographyProps={{ className: classes.amountsMobile }}
						/>
					</Grid>
				</Grid>
				<Divider className={classes.divider} />
				<Grid container className={classes.actionButtonsMobile}>
					<VaultActionButtons
						isWithdrawDisabled={!onboard.isActive() || !canWithdraw}
						isDepositDisabled={!onboard.isActive() || isDisabled}
						onWithdrawClick={() => {
							setOpenWithdrawDialog(true);
						}}
						onDepositClick={() => setOpenDepositDialog(true)}
					/>
				</Grid>
				{vaultModals}
			</Grid>
		);
	}

	const listItem = (
		<>
			<Grid container component={Card} className={clsx(classes.root, !isDisabled && classes.enabledVault)}>
				<Grid
					container
					item
					spacing={2}
					xs={12}
					md={9}
					lg
					className={classes.clickableSection}
					onClick={goToVaultDetail}
				>
					<Grid item xs={12} md={7} lg className={classes.name} container>
						<VaultItemName vault={vault} />
					</Grid>
					<Grid item xs={12} md className={classes.apr}>
						<VaultItemApr vault={vault} multiplier={multiplier} boost={user.accountDetails?.boost} />
					</Grid>
					<Grid item xs={12} md className={classes.tvl}>
						<CurrencyDisplay
							displayValue={inCurrency(new BigNumber(vault.value), vaults.vaultsFilters.currency, 0)}
							variant="body1"
							justifyContent="flex-start"
							TypographyProps={{ className: classes.itemText }}
						/>
					</Grid>
					<Grid item xs={12} md>
						<CurrencyDisplay
							displayValue={depositBalanceDisplay}
							variant="body1"
							justifyContent="flex-start"
							TypographyProps={{ className: classes.itemText }}
						/>
					</Grid>
				</Grid>
				<Grid item xs={12} md className={classes.nonClickableSection}>
					<VaultActionButtons
						isWithdrawDisabled={!onboard.isActive() || !canWithdraw}
						isDepositDisabled={!onboard.isActive() || isDisabled}
						onWithdrawClick={() => setOpenWithdrawDialog(true)}
						onDepositClick={() => setOpenDepositDialog(true)}
					/>
				</Grid>
			</Grid>
			{vaultModals}
		</>
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
});
export default VaultListItem;
