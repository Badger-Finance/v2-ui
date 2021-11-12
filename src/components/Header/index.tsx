import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../../mobx/store-context';
import { Typography, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import GasWidget from '../../components-v2/common/GasWidget';
import WalletWidget from '../../components-v2/common/WalletWidget';
import { LayoutContainer } from '../../components-v2/common/Containers';
import NetworkWidget from '../../components-v2/common/NetworkWidget';
import BigNumber from 'bignumber.js';
import { inCurrency } from '../../mobx/utils/helpers';
import { Skeleton } from '@material-ui/lab';
import CurrencyDisplay from '../../components-v2/common/CurrencyDisplay';
import { RewardsWidget } from '../../components-v2/landing/RewardsWidget';
import DelegationWidget from '../../components-v2/common/DelegationWidget';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
	root: {
		width: '100%',
		borderBottom: '1px solid #2B2B2B',
		position: 'sticky',
		top: 0,
		background: '#181818',
		zIndex: 1,
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
	tvl: {
		marginLeft: 42,
	},
	loader: {
		display: 'inline-flex',
		marginLeft: 4,
	},
	amounts: {
		whiteSpace: 'pre-wrap',
	},
}));

const Header = observer(() => {
	const {
		user,
		lockedCvxDelegation: { shouldBannerBeDisplayed },
		uiState: { notification, currency },
		wallet: { notify, connectedAddress },
		network: { network },
		setts: { protocolSummary },
	} = useContext(StoreContext);
	const { enqueueSnackbar } = useSnackbar();
	const classes = useStyles();

	const userConnected = !!connectedAddress;
	const totalValueLocked = protocolSummary ? new BigNumber(protocolSummary.totalValue) : undefined;
	const portfolioValue = userConnected && user.initialized ? user.portfolioValue : undefined;
	const valuePlaceholder = <Skeleton animation="wave" width={32} className={classes.loader} />;

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
						<Grid item xs={5} container alignItems="center" className={classes.amounts}>
							{!!connectedAddress && (
								<>
									<Typography variant="body2">My Deposits: </Typography>
									{portfolioValue ? (
										<CurrencyDisplay
											displayValue={inCurrency(portfolioValue, currency)}
											variant="subtitle2"
											justify="flex-start"
										/>
									) : (
										valuePlaceholder
									)}
								</>
							)}
							<Typography variant="body2" className={clsx(!!connectedAddress && classes.tvl)}>
								All Vaults (TVL):{' '}
							</Typography>
							{totalValueLocked ? (
								<CurrencyDisplay
									displayValue={inCurrency(totalValueLocked, currency)}
									variant="subtitle2"
									justify="flex-start"
								/>
							) : (
								valuePlaceholder
							)}
						</Grid>
						<Grid item xs={7} container alignItems="center" justify="flex-end" spacing={1}>
							{!!connectedAddress && (
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
								<NetworkWidget className={classes.button} />
							</Grid>
							<Grid item>
								<GasWidget className={classes.button} />
							</Grid>
							<Grid item>
								<WalletWidget className={classes.button} />
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</LayoutContainer>
		</div>
	);
});

export default Header;
