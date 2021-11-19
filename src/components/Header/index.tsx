import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { Typography, Grid, Button, useMediaQuery, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import WalletWidget from '../../components-v2/common/WalletWidget';
import { LayoutContainer } from '../../components-v2/common/Containers';
import BigNumber from 'bignumber.js';
import { inCurrency } from '../../mobx/utils/helpers';
import { Skeleton } from '@material-ui/lab';
import CurrencyDisplay from '../../components-v2/common/CurrencyDisplay';
import { RewardsWidget } from '../../components-v2/landing/RewardsWidget';
import DelegationWidget from '../../components-v2/common/DelegationWidget';
import NetworkGasWidget from '../../components-v2/common/NetworkGasWidget';
import { MoreHoriz } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
	root: {
		borderBottom: '1px solid #2B2B2B',
		background: '#181818',
	},
	container: {
		padding: '20px 0',
	},
	button: {
		height: 36,
	},
	delegateButton: {
		minWidth: 37,
		width: 37,
	},
	loader: {
		display: 'inline-flex',
		marginLeft: 4,
	},
	amounts: {
		whiteSpace: 'pre-wrap',
	},
	sidebarButton: {
		[theme.breakpoints.up('md')]: {
			display: 'none',
		},
	},
	badgerLogo: {
		width: 44,
		height: 44,
	},
}));

const Header = observer(() => {
	const {
		user,
		lockedCvxDelegation: { shouldBannerBeDisplayed },
		uiState,
		onboard,
		onboard: { notify },
		network: { network },
		setts: { protocolSummary },
	} = useContext(StoreContext);
	const { enqueueSnackbar } = useSnackbar();
	const classes = useStyles();
	const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

	const { notification, currency } = uiState;
	const totalValueLocked = protocolSummary ? new BigNumber(protocolSummary.totalValue) : undefined;
	const portfolioValue = onboard.isActive() && user.initialized ? user.portfolioValue : undefined;
	const valuePlaceholder = <Skeleton animation="wave" width={32} className={classes.loader} />;
	const chainName = network.name
		.split(' ')
		.map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
		.join(' ');

	const enq = () => {
		if (!notification || !notification.message) return;

		// Notify doesn't support BSC currently so it is temporarily disabled for it
		if (notification.hash && network.id == 1) {
			// then on each transaction...
			const { emitter } = notify.hash(notification.hash);
			emitter.on('all', (tx) => network.notifyLink(tx));
		} else {
			enqueueSnackbar(notification.message, { variant: notification.variant, persist: false });
		}
	};
	// Disable reason: Hook used for execution of enq() on change of notification.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(enq, [notification]);

	return (
		<div className={classes.root}>
			<LayoutContainer>
				<Grid container>
					<Grid container className={classes.container}>
						<Grid item xs={3} md={6} container alignItems="center" className={classes.amounts}>
							{isMobile ? (
								<div onClick={() => window.open('https://badger.com/', '_blank')}>
									<img
										className={classes.badgerLogo}
										alt="Badger Logo"
										src={'/assets/icons/badger.png'}
									/>
								</div>
							) : (
								<>
									{onboard.isActive() && (
										<Grid item xs={12} sm={6}>
											<Typography variant="body2" display="inline">
												My assets:{' '}
											</Typography>
											{portfolioValue ? (
												<CurrencyDisplay
													displayValue={inCurrency(portfolioValue, currency)}
													variant="subtitle2"
													justify="flex-start"
												/>
											) : (
												valuePlaceholder
											)}
										</Grid>
									)}
									<Grid item xs={12} sm={6}>
										<Typography variant="body2" display="inline">
											{`${chainName} TVL: `}
										</Typography>
										{totalValueLocked ? (
											<CurrencyDisplay
												displayValue={inCurrency(totalValueLocked, currency, 0)}
												variant="subtitle2"
												justify="flex-start"
											/>
										) : (
											valuePlaceholder
										)}
									</Grid>
								</>
							)}
						</Grid>
						<Grid item container xs={9} md={6} alignItems="center" justify="flex-end" spacing={1}>
							{onboard.isActive() && (
								<Grid item>
									<RewardsWidget />
								</Grid>
							)}
							{shouldBannerBeDisplayed && (
								<Grid item>
									<DelegationWidget />
								</Grid>
							)}
							<Grid item>
								<NetworkGasWidget />
							</Grid>
							<Grid item>
								<WalletWidget className={classes.button} />
							</Grid>
							<Grid item className={classes.sidebarButton}>
								<Button
									variant="outlined"
									className={classes.button}
									onClick={() => uiState.openSidebar()}
								>
									<MoreHoriz />
								</Button>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</LayoutContainer>
		</div>
	);
});

export default Header;
