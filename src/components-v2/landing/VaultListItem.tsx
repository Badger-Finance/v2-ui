import React, { useContext, useState } from 'react';
import clsx from 'clsx';
import { makeStyles, Grid, Tooltip, useMediaQuery, useTheme, Card, Divider, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { inCurrency } from 'mobx/utils/helpers';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { VaultActionButtons } from '../common/VaultActionButtons';
import { VaultItemApr } from './VaultItemApr';
import { StoreContext } from 'mobx/store-context';
import routes from '../../config/routes';
import { VaultDeposit, VaultModalProps } from '../common/dialogs/VaultDeposit';
import { VaultWithdraw } from '../common/dialogs/VaultWithdraw';
import { Vault, VaultBehavior, VaultState } from '@badger-dao/sdk';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { currencyConfiguration } from '../../config/currency.config';
import { INFORMATION_SECTION_MAX_WIDTH } from './VaultListHeader';
import { getUserVaultBoost, getVaultIconPath } from '../../utils/componentHelpers';
import VaultBadge from './VaultBadge';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import VaultBehaviorTooltip from './VaultBehaviorTooltip';

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
	behavior: {
		color: '#FFB84D',
		width: '90px',
		marginBottom: theme.spacing(-3),
		paddingLeft: theme.spacing(0.5),
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
	symbol: {
		maxWidth: '100%',
		[theme.breakpoints.down('sm')]: {
			marginRight: theme.spacing(2),
		},
	},
	symbolWithBadge: {
		marginTop: theme.spacing(-1),
	},
	iconBadgeContainer: {
		width: 80,
		alignSelf: 'stretch',
	},
	thinFont: {
		fontSize: 14,
		fontWeight: 400,
	},
	vaultName: {
		fontSize: 16,
		'&:first-letter': {
			textTransform: 'capitalize',
		},
	},
	vaultNameMobile: {
		marginTop: theme.spacing(1),
	},
	iconContainer: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	badgeContainer: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginTop: 8,
	},
	tabletTvl: {
		whiteSpace: 'pre',
	},
}));

export interface VaultListItemProps {
	vault: Vault;
	depositBalance: TokenBalance;
	// this will probably never be used except for special cases such as the ibBTC zap deposit workflow
	CustomDepositModal?: (props: VaultModalProps) => JSX.Element;
}

const VaultListItem = observer(({ vault, CustomDepositModal, depositBalance }: VaultListItemProps): JSX.Element => {
	const classes = useStyles();
	const isTablet = useMediaQuery(useTheme().breakpoints.only('md'));
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
	const { user, network, router, onboard, vaults } = useContext(StoreContext);
	const [openDepositDialog, setOpenDepositDialog] = useState(false);
	const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
	const { showAPR } = vaults.vaultsFilters;

	const goToVaultDetail = async () => {
		await router.goTo(routes.settDetails, { settName: vaults.getSlug(vault.vaultToken) });
	};

	const badgerVault = network.network.vaults.find(({ vaultToken }) => vaultToken.address === vault.vaultToken);
	const vaultBoost = user.accountDetails?.boost ? getUserVaultBoost(vault, user.accountDetails.boost, showAPR) : null;
	const boostContribution =
		vaultBoost && vault.minApy && vault.minApr
			? Math.max(0, vaultBoost - (showAPR ? vault.minApr : vault.minApy))
			: null;

	const multiplier =
		vault.state !== VaultState.Deprecated ? user.accountDetails?.multipliers[vault.vaultToken] : undefined;

	const depositBalanceDisplay = depositBalance.tokenBalance.gt(0)
		? depositBalance.balanceValueDisplay(vaults.vaultsFilters.currency)
		: `${currencyConfiguration[vaults.vaultsFilters.currency].prefix}-`;

	// sett is disabled if they are internal setts, or have a bouncer and use has no access
	// rem badger does not support deposit, any more and we should maintain a config @jintao
	const disallowDeposit =
		!user.onGuestList(vault) || vault.vaultToken === ETH_DEPLOY.sett_system.vaults['native.rembadger'];
	const canWithdraw = depositBalance.tokenBalance.gt(0);

	const Badge = VaultBadge({ state: vault.state });
	const DepositModal = CustomDepositModal || VaultDeposit;

	const boostText =
		vault.boost.enabled && vault.maxApr ? `🚀 Boosted (max. ${vault.maxApr.toFixed(2)}%)` : 'Non-boosted';

	const vaultName = (
		<Typography className={classes.vaultName}>
			{vault.protocol} - {vault.name}
		</Typography>
	);

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
						<Grid container>
							<Grid container alignItems="center">
								<Grid xs={5} sm={12}>
									<img
										alt={`Badger ${vault.name} Vault Symbol`}
										className={classes.symbol}
										src={getVaultIconPath(vault, network.network)}
									/>
								</Grid>
								<Grid item container direction="column" xs={7}>
									<Grid item>{Badge}</Grid>
									<Grid item>
										{vault.behavior !== VaultBehavior.None && (

											<Tooltip
												enterTouchDelay={0}
												enterDelay={0}
												leaveDelay={300}
												arrow
												placement="left"
												title={<VaultBehaviorTooltip vault={vault} />}
												// prevents scrolling overflow off the sett list
												PopperProps={{
													disablePortal: true,
												}}
												// needs to be set otherwise MUI will set a random one on every run causing snapshots to break
												id={`${vault.name} apr breakdown`}
											>
											<Typography variant="caption" className={classes.behavior}>
												{vault.behavior}
											</Typography>
										</Tooltip>
										)}
									</Grid>
								</Grid>
							</Grid>
							<Grid container direction="column" className={classes.vaultNameMobile}>
								<Grid item container spacing={2}>
									<Grid item xs={7}>
										{vaultName}
									</Grid>
									<Grid item xs>
										<VaultItemApr vault={vault} multiplier={multiplier} boost={vaultBoost} />
									</Grid>
								</Grid>
								<Grid item container spacing={2}>
									<Grid item xs={7}>
										<Typography variant="body1" className={classes.thinFont} color="textSecondary">
											{boostText}
										</Typography>
									</Grid>
									{!!boostContribution && (
										<Grid item xs>
											<Typography
												variant="body1"
												color="textSecondary"
												className={classes.thinFont}
											>
												My Boost: {boostContribution.toFixed(2)}%
											</Typography>
										</Grid>
									)}
								</Grid>
							</Grid>
						</Grid>
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
						isDepositDisabled={!onboard.isActive() || disallowDeposit}
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
			<Grid container component={Card} className={clsx(classes.root, !disallowDeposit && classes.enabledVault)}>
				<Grid
					container
					item
					xs={12}
					md={10}
					lg
					spacing={2}
					className={classes.clickableSection}
					onClick={goToVaultDetail}
				>
					<Grid
						item
						xs="auto"
						container
						direction="column"
						justifyContent={!!Badge ? 'space-between' : 'center'}
						className={classes.iconBadgeContainer}
					>
						<Grid item xs className={classes.iconContainer}>
							<img
								alt={`Badger ${vault.name} Vault Symbol`}
								className={clsx(classes.symbol, !!Badge && classes.symbolWithBadge)}
								src={getVaultIconPath(vault, network.network)}
							/>
						</Grid>
						{!!Badge && (
							<Grid item xs="auto" container justifyContent="flex-end">
								{Badge}
							</Grid>
						)}
						{vault.behavior !== VaultBehavior.None && (
							<Tooltip
								enterTouchDelay={0}
								enterDelay={0}
								leaveDelay={300}
								arrow
								placement="bottom"
								title={<VaultBehaviorTooltip vault={vault} />}
								// prevents scrolling overflow off the sett list
								PopperProps={{
									disablePortal: true,
								}}
								// needs to be set otherwise MUI will set a random one on every run causing snapshots to break
								id={`${vault.name} apr breakdown`}
							>
							<Typography variant="caption" className={classes.behavior}>
								{vault.behavior}
							</Typography>
						</Tooltip>
						)}
					</Grid>
					<Grid item container xs>
						<Grid item container spacing={4} xs={12}>
							<Grid item xs={12} md={5} lg={4} container>
								{vaultName}
							</Grid>
							<Grid item xs={12} md>
								<VaultItemApr vault={vault} multiplier={multiplier} boost={vaultBoost} />
							</Grid>
							<Grid item xs={12} md className={classes.tvl}>
								<CurrencyDisplay
									displayValue={inCurrency(
										new BigNumber(vault.value),
										vaults.vaultsFilters.currency,
										0,
									)}
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
						<Grid item container spacing={4} xs={12}>
							<Grid item xs={12} md={5} lg={4} container>
								<Typography variant="body1" color="textSecondary" className={classes.thinFont}>
									{boostText}
								</Typography>
							</Grid>
							<Grid item xs={12} md={5} lg={8}>
								{boostContribution && (
									<Typography variant="body1" color="textSecondary" className={classes.thinFont}>
										My Boost: {boostContribution.toFixed(2)}%
									</Typography>
								)}
							</Grid>
						</Grid>
						{isTablet && (
							<Grid item container spacing={4} xs={12}>
								<Grid item xs={12} md={6} lg={4} container className={classes.tabletTvl}>
									<Typography
										display="inline"
										variant="body1"
										color="textSecondary"
										className={classes.thinFont}
									>
										{'TVL: '}
									</Typography>
									<CurrencyDisplay
										displayValue={inCurrency(
											new BigNumber(vault.value),
											vaults.vaultsFilters.currency,
											0,
										)}
										variant="body1"
										justifyContent="flex-start"
										TypographyProps={{ className: classes.thinFont, color: 'textSecondary' }}
									/>
								</Grid>
							</Grid>
						)}
					</Grid>
				</Grid>
				<Grid item xs={12} md className={classes.nonClickableSection}>
					<VaultActionButtons
						isWithdrawDisabled={!onboard.isActive() || !canWithdraw}
						isDepositDisabled={!onboard.isActive() || disallowDeposit}
						onWithdrawClick={() => setOpenWithdrawDialog(true)}
						onDepositClick={() => setOpenDepositDialog(true)}
					/>
				</Grid>
			</Grid>
			{vaultModals}
		</>
	);

	if (disallowDeposit) {
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
