import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { Box, Button, Drawer, Grid, IconButton, makeStyles, Typography, useTheme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import useENS from '../../hooks/useEns';
import { shortenAddress } from '../../utils/componentHelpers';
import CurrencyDisplay from './CurrencyDisplay';
import { inCurrency } from '../../mobx/utils/helpers';
import copy from 'copy-to-clipboard';

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
	balance: {
		fontSize: 20,
	},
	disconnectWalletText: {
		color: '#FB0505',
		fontWeight: 700,
	},
	titleRow: {
		marginBottom: theme.spacing(2),
	},
	addressRow: {
		marginBottom: theme.spacing(2),
	},
	tokenNameAndIcon: {
		display: 'flex',
		alignItems: 'center',
	},
	tokenName: {
		fontSize: 16,
	},
	icon: {
		width: 25,
		marginRight: 15,
	},
	tokenBalance: {
		marginBottom: theme.spacing(3),
	},
	balancesList: {
		marginTop: 32,
	},
	balanceDisplayValue: {
		marginTop: theme.spacing(-0.5),
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
		marginRight: theme.spacing(3),
	},
}));

const WalletDrawer = (): JSX.Element | null => {
	const [showCopiedMessage, setShowCopiedMessage] = useState(false);
	const { uiState, user, onboard } = useContext(StoreContext);
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

	const tokenBalances = Object.values(user.tokenBalances)
		.filter((balance) => balance.tokenBalance.gt(0))
		.sort((a, b) => b.value.minus(a.value).toNumber());

	return (
		<Drawer open={uiState.showWalletDrawer} anchor="right">
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
						<Typography variant="subtitle2" display="inline">
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
						<Typography variant="subtitle2" color="textSecondary">
							Balance:
						</Typography>
						<CurrencyDisplay
							variant="body1"
							justifyContent="flex-start"
							displayValue={inCurrency(user.walletValue, uiState.currency)}
							TypographyProps={{ className: classes.balance }}
						/>
					</Grid>
					<Grid item container className={classes.balancesList}>
						{tokenBalances.map((tokenBalance) => (
							<Grid container className={classes.tokenBalance} key={tokenBalance.token.address}>
								<Grid item container justifyContent="space-between" alignItems="center">
									<div className={classes.tokenNameAndIcon}>
										<img
											className={classes.icon}
											src={`/assets/icons/${tokenBalance.token.symbol.toLowerCase().trim()}.png`}
											alt={`${tokenBalance.token.name} icon`}
										/>
										<Typography variant="body1" display="inline" className={classes.tokenName}>
											{tokenBalance.token.symbol}
										</Typography>
									</div>
									<Box display="inline">
										<Typography variant="body1">{tokenBalance.balanceDisplay(6)}</Typography>
									</Box>
								</Grid>
								<Grid item container justifyContent="flex-end" className={classes.balanceDisplayValue}>
									<Typography variant="subtitle2" color="textSecondary">
										{tokenBalance.balanceValueDisplay(uiState.currency, 6)}
									</Typography>
								</Grid>
							</Grid>
						))}
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
					<IconButton onClick={() => setShowCopiedMessage(false)}>
						<CloseIcon />
					</IconButton>
				</Grid>
			)}
		</Drawer>
	);
};

export default observer(WalletDrawer);
