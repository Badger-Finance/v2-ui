import React, { useContext, useState } from 'react';
import clsx from 'clsx';
import { ListItem, makeStyles, Typography, Grid, Tooltip } from '@material-ui/core';
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
import { NAME_COLUMN_MAX_WIDTH, INFORMATION_SECTION_MAX_WIDTH, APR_COLUMN_MAX_WIDTH } from './TableHeader';

const useStyles = makeStyles((theme) => ({
	root: {
		borderBottom: `1px solid ${theme.palette.background.default}`,
		minHeight: 90,
		display: 'flex',
		alignItems: 'center',
	},
	enabledVault: {
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
		[theme.breakpoints.up('md')]: {
			flexGrow: 0,
			maxWidth: NAME_COLUMN_MAX_WIDTH,
			flexBasis: NAME_COLUMN_MAX_WIDTH,
		},
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(2),
		},
	},
	listItem: {
		padding: 0,
		minHeight: 90,
		'&:last-child div': {
			borderBottom: 0,
		},
	},
	clickableSection: {
		alignItems: 'center',
		padding: theme.spacing(2, 0, 2, 2),
		[theme.breakpoints.up('md')]: {
			flexGrow: 0,
			maxWidth: INFORMATION_SECTION_MAX_WIDTH,
			flexBasis: INFORMATION_SECTION_MAX_WIDTH,
		},
		[theme.breakpoints.down('sm')]: {
			padding: theme.spacing(2, 2, 1.5, 2),
		},
	},
	nonClickableSection: {
		padding: theme.spacing(2, 2, 2, 0),
		[theme.breakpoints.down('sm')]: {
			textAlign: 'center',
			padding: theme.spacing(1, 2, 2, 2),
		},
	},
	itemText: {
		fontSize: 16,
	},
	apr: {
		[theme.breakpoints.up('md')]: {
			flexGrow: 0,
			maxWidth: APR_COLUMN_MAX_WIDTH,
			flexBasis: APR_COLUMN_MAX_WIDTH,
		},
	},
}));

export interface VaultListItemProps {
	vault: Vault;
	depositBalance: TokenBalance;
	// this will probably never be used except for special cases such as the ibBTC zap deposit workflow
	CustomDepositModal?: (props: VaultModalProps) => JSX.Element;
}

const VaultListItem = observer(({ vault, CustomDepositModal, depositBalance }: VaultListItemProps): JSX.Element => {
	const { user, network, router, onboard, vaults, uiState } = useContext(StoreContext);
	const [openDepositDialog, setOpenDepositDialog] = useState(false);
	const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);

	const classes = useStyles();
	const badgerVault = network.network.vaults.find(({ vaultToken }) => vaultToken.address === vault?.vaultToken);

	const depositBalanceDisplay = depositBalance.tokenBalance.gt(0)
		? depositBalance.balanceValueDisplay(uiState.currency)
		: `${currencyConfiguration[uiState.currency].prefix}-`;

	const multiplier =
		vault.state !== VaultState.Deprecated ? user.accountDetails?.multipliers[vault.vaultToken] : undefined;

	const canWithdraw = depositBalance.tokenBalance.gt(0);
	// sett is disabled if they are internal setts, or have a bouncer and use has no access
	const isDisabled = !user.onGuestList(vault);

	const goToVaultDetail = async () => {
		await router.goTo(routes.settDetails, { settName: vaults.getSlug(vault.vaultToken) });
	};

	const DepositModal = CustomDepositModal || VaultDeposit;

	const listItem = (
		<ListItem className={classes.listItem} disabled={isDisabled}>
			<Grid container className={clsx(classes.root, !isDisabled && classes.enabledVault)}>
				{/* the goToVaultDetail handle is used only for this piece to allow the action buttons to be clickable/*/}
				<Grid container item xs={12} md className={classes.clickableSection} onClick={goToVaultDetail}>
					{/* we use custom flex basis for vault name and apr /*/}
					<Grid item xs={12} md className={classes.name} container>
						<VaultItemName vault={vault} />
					</Grid>
					<Grid item className={classes.mobileLabel} xs={6} md={1}>
						<Typography variant="body2" color="textSecondary">
							APR
						</Typography>
					</Grid>
					<Grid item xs={6} md className={classes.apr}>
						<VaultItemApr vault={vault} multiplier={multiplier} />
					</Grid>
					<Grid item className={classes.mobileLabel} xs={6} md>
						<Typography variant="body2" color={'textSecondary'}>
							TVL
						</Typography>
					</Grid>
					<Grid item xs={6} md>
						<CurrencyDisplay
							displayValue={inCurrency(new BigNumber(vault.value), uiState.currency, 0)}
							variant="body1"
							justifyContent="flex-start"
							TypographyProps={{ className: classes.itemText }}
						/>
					</Grid>
					<Grid item className={classes.mobileLabel} xs={6} md>
						<Typography variant="body2" color={'textSecondary'}>
							MY DEPOSITS
						</Typography>
					</Grid>
					<Grid item xs={6} md>
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
			{badgerVault && (
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
});

export default VaultListItem;
