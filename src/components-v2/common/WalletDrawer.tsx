import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Button, Drawer, Grid, IconButton, makeStyles, Typography, useTheme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import useENS from '../../hooks/useEns';
import { shortenAddress } from '../../utils/componentHelpers';
import CurrencyDisplay from './CurrencyDisplay';
import { inCurrency } from '../../mobx/utils/helpers';
import copy from 'copy-to-clipboard';
import BigNumber from 'bignumber.js';
import WalletTokenBalance from './WalletTokenBalance';
import clsx from 'clsx';
import WalletLiquidityPoolLinks from './WalletLiquidityPoolLinks';

const useStyles = makeStyles((theme) => ({
	root: {
		width: 349,
		backgroundColor: theme.palette.background.paper,
		padding: '25px 25px 50px 25px',
		height: '100vh',
		position: 'relative',
	},
	title: {
		fontSize: 20,
		fontWeight: 700,
	},
	balanceText: {
		fontWeight: 400,
	},
	balance: {
		color: 'rgba(255, 255, 255, 0.87)',
		fontSize: 20,
	},
	disconnectWalletText: {
		textTransform: 'uppercase',
		color: '#91CDFF',
		fontWeight: 700,
	},
	titleRow: {
		marginBottom: theme.spacing(2),
	},
	addressRow: {
		marginBottom: theme.spacing(2),
	},
	balancesList: {
		marginTop: 32,
	},
	lpLinks: {
		marginTop: 20,
	},
	copiedMessage: {
		background: '#66BB6A',
		position: 'absolute',
		bottom: 0,
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(1),
	},
	closeButton: {
		position: 'absolute',
		top: theme.spacing(2),
		right: theme.spacing(1),
	},
	copyWalletButton: {
		marginLeft: theme.spacing(4),
	},
	disconnectWalletIcon: {
		marginRight: theme.spacing(1),
	},
	address: {
		textTransform: 'uppercase',
	},
}));

const WalletDrawer = (): JSX.Element | null => {
	const [showCopiedMessage, setShowCopiedMessage] = useState(false);
	const { uiState, user, onboard, network } = useContext(StoreContext);
	const { ensName } = useENS(onboard.address);
	const classes = useStyles();
	const closeDialogTransitionDuration = useTheme().transitions.duration.leavingScreen;

	const handleCopy = () => {
		if (!onboard.address) return;
		const didCopy = copy(onboard.address);
		setShowCopiedMessage(didCopy);
	};

	const handleDisconnect = () => {
		uiState.toggleWalletDrawer();
		setTimeout(() => {
			onboard.disconnect();
		}, closeDialogTransitionDuration);
	};

	if (!onboard.address) {
		return null;
	}

	const tokenBalances = Object.keys(network.network.deploy.tokens).flatMap((token) => {
		const isBadgerToken = ['badger', 'digg', 'remdigg'].includes(token.toLowerCase());
		return isBadgerToken ? [user.getTokenBalance(network.network.deploy.tokens[token])] : [];
	});

	const sortedBalances = tokenBalances.sort((a, b) => b.value.minus(a.value).toNumber());
	const totalBalance = tokenBalances.reduce((total, next) => total.plus(next.value), new BigNumber(0));

	return (
		<Drawer open={uiState.showWalletDrawer} anchor="right" onClose={() => uiState.toggleWalletDrawer()}>
			<Grid container direction="column" className={classes.root} justifyContent="space-between">
				<Grid item>
					<Grid
						item
						container
						justifyContent="space-between"
						alignItems="center"
						className={classes.titleRow}
					>
						<Typography variant="h6" display="inline" className={classes.title}>
							Wallet
						</Typography>
						<IconButton className={classes.closeButton} onClick={() => uiState.toggleWalletDrawer()}>
							<CloseIcon />
						</IconButton>
					</Grid>
					<Grid item container alignItems="center" className={classes.addressRow}>
						<Typography
							className={clsx(!ensName && classes.address)}
							variant="subtitle2"
							color="textSecondary"
							display="inline"
						>
							{ensName || shortenAddress(onboard.address)}
						</Typography>
						<IconButton
							onClick={handleCopy}
							aria-label="copy wallet address"
							className={classes.copyWalletButton}
						>
							<img src="/assets/icons/copy-wallet-address.svg" alt="copy wallet address icon" />
						</IconButton>
					</Grid>
					<Grid item>
						<Typography className={classes.balanceText} variant="subtitle2" color="textSecondary">
							Balance:
						</Typography>
						<CurrencyDisplay
							variant="body1"
							justifyContent="flex-start"
							displayValue={inCurrency(totalBalance, uiState.currency)}
							TypographyProps={{ className: classes.balance }}
						/>
					</Grid>
					<Grid item container className={classes.balancesList}>
						{sortedBalances.map((tokenBalance) => (
							<WalletTokenBalance key={tokenBalance.token.address} balance={tokenBalance} />
						))}
					</Grid>
					<Grid item container className={classes.lpLinks}>
						<WalletLiquidityPoolLinks />
					</Grid>
				</Grid>
				<Grid item>
					<Button
						variant="text"
						classes={{ label: classes.disconnectWalletText }}
						onClick={handleDisconnect}
						aria-label="disconnect wallet"
					>
						<img
							className={classes.disconnectWalletIcon}
							src="/assets/icons/disconnect-wallet.svg"
							aria-label="disconnect wallet"
							alt="disconnect wallet icon"
						/>
						Disconnect Wallet
					</Button>
				</Grid>
			</Grid>
			{showCopiedMessage && (
				<Grid container className={classes.copiedMessage} alignItems="center" justifyContent="space-between">
					<Typography variant="subtitle2" display="inline">
						Wallet Address Copied
					</Typography>
					<IconButton onClick={() => setShowCopiedMessage(false)} aria-label="dismiss copied address message">
						<CloseIcon />
					</IconButton>
				</Grid>
			)}
		</Drawer>
	);
};

export default observer(WalletDrawer);
