import { Backdrop, Button, ButtonGroup, Fade, Grid, Modal, Typography } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import BigNumber from 'bignumber.js';
import { Loader } from 'components/Loader';
import { CLAIMS_SYMBOLS } from 'config/constants';
import { observer } from 'mobx-react-lite';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { StoreContext } from 'mobx/store-context';
import { inCurrency } from 'mobx/utils/helpers';
import React, { useState, useContext, useEffect } from 'react';
import { RewardsModalItem } from './RewardsModalItem';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		modal: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		},
		paper: {
			backgroundColor: theme.palette.background.paper,
			boxShadow: theme.shadows[5],
			padding: theme.spacing(4, 4, 3),
			borderRadius: 8,
			outline: 'none',
			display: 'flex',
			flexDirection: 'column',
			minHeight: '30%',
			maxHeight: '75%',
			minWidth: '25%',
		},
		rewardsContainer: {
			maxHeight: '75%',
			overflowY: 'auto',
		},
		modalTitle: {
			textAlign: 'center',
		},
		claimInput: {
			paddingLeft: theme.spacing(6),
		},
		subtitle: {
			paddingTop: theme.spacing(4),
			paddingBottom: theme.spacing(2),
		},
		claimButton: {
			width: '100%',
			marginTop: theme.spacing(2),
		},
		openModalButton: { marginRight: theme.spacing(1), height: '1.8rem' },
		maxAllButton: {
			maxWidth: '25%',
			marginLeft: 'auto',
			marginRight: 'auto',
			marginTop: theme.spacing(1),
		},
		amountDisplay: {
			marginTop: 'auto',
			marginBottom: 'auto',
			paddingRight: theme.spacing(1),
		},
		widgetContainer: {
			[theme.breakpoints.down('xs')]: {
				marginBottom: theme.spacing(2),
			},
		},
		claimContainer: {
			display: 'flex',
			flexDirection: 'column',
			marginBottom: '-2px',
		},
		loaderContainer: {
			display: 'flex',
			justifyContent: 'space-between',
			marginRight: theme.spacing(3),
			marginBottom: theme.spacing(0.3),
			width: '125px',
		},
	}),
);

export interface ClaimMapEntry {
	balance: TokenBalance;
	visualBalance: string;
}

export interface ClaimMap {
	[address: string]: ClaimMapEntry;
}

export interface RewardsModalProps {
	loading: boolean;
}

export const RewardsModal = observer((): JSX.Element | null => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { badgerTree, claimGeysers, loadingRewards } = store.rewards;
	const { currency } = store.uiState;
	const { connectedAddress } = store.wallet;
	const { network } = store.network;

	const [open, setOpen] = useState(false);
	const [maxFlag, setMaxFlag] = useState(true);
	const [maxBalances, setMaxBalances] = useState<ClaimMap>({});
	const [claimMap, setClaimMap] = useState<ClaimMap>({});

	useEffect(() => {
		const balances = Object.fromEntries(
			badgerTree.claims.map((claim) => {
				const entry = {
					balance: claim,
					visualBalance: claim.balanceDisplay(),
				};
				return [claim.token.address, entry];
			}),
		);
		setMaxBalances(balances);
		setClaimMap(balances);
	}, [badgerTree.claims]);

	if (!connectedAddress) {
		return null;
	}

	if (loadingRewards) {
		return (
			<div className={classes.loaderContainer}>
				<Typography variant="caption">Loading Rewards</Typography>
				<Loader size={15} />
			</div>
		);
	}

	const isMaxed = (token: string): boolean =>
		claimMap[token].balance.tokenBalance.eq(maxBalances[token].balance.tokenBalance);

	const handleClaimMap = (address: string, amount: string): void => {
		const isMax = amount === maxBalances[address].visualBalance;
		let entry: ClaimMapEntry;
		if (isMax) {
			entry = maxBalances[address];
		} else {
			const balance = store.rewards.balanceFromString(address, amount);
			entry = { balance, visualBalance: amount };
		}
		setClaimMap({ ...claimMap, [address]: entry });
		if (!isMaxed(address)) {
			setMaxFlag(false);
		}
	};

	const maxAll = (): void => {
		setClaimMap(maxBalances);
		setMaxFlag(true);
	};

	const claimableValue = badgerTree.claims.reduce((total, balance) => total.plus(balance.value), new BigNumber(0));
	const claimItems = badgerTree.claims
		.filter((claim) => {
			// BANDAID - fix root cause of badger tree not updating in correct order
			if (!CLAIMS_SYMBOLS[network.symbol]) {
				return false;
			}
			const entry = claimMap[claim.token.address];
			const claimable = maxBalances[claim.token.address];
			return entry && claimable.balance.tokenBalance.gt(0);
		})
		.map((claim) => {
			const { token } = claim;
			const maxClaim = maxBalances[token.address];
			const currentClaim = claimMap[token.address].balance;
			const currentClaimDisplay = claimMap[token.address].visualBalance;
			return (
				<RewardsModalItem
					key={token.address}
					amount={currentClaimDisplay}
					maxAmount={maxClaim.visualBalance}
					display={currentClaim.balanceDisplay(5)}
					value={currentClaim.balanceValueDisplay(currency)}
					address={token.address}
					symbol={CLAIMS_SYMBOLS[network.symbol][token.address]}
					onChange={handleClaimMap}
					maxFlag={isMaxed(token.address)}
				/>
			);
		});

	let canSubmit = true;
	// update if typescript has a stream::allMatch
	Object.entries(claimMap).forEach((entry) => {
		const [key, value] = entry;
		const max = maxBalances[key];
		if (value.balance.tokenBalance.gt(max.balance.tokenBalance)) {
			canSubmit = false;
		}
	});
	const hasRewards = claimableValue.gt(0);
	return (
		<div className={classes.claimContainer}>
			{hasRewards && (
				<Typography variant="caption" className={classes.amountDisplay}>
					{inCurrency(claimableValue, currency, true, 2)} in Rewards
				</Typography>
			)}
			<ButtonGroup className={classes.openModalButton} size="small" variant="outlined" color="primary">
				<Button variant="contained" onClick={() => setOpen(true)} disabled={!hasRewards}>
					CLAIM REWARDS
				</Button>
			</ButtonGroup>
			<Modal
				aria-labelledby="claim-modal"
				aria-describedby="Claim your rewards"
				open={open}
				onClose={() => setOpen(false)}
				className={classes.modal}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
			>
				<Fade in={open}>
					<div className={classes.paper}>
						<Typography id="claim-title" className={classes.modalTitle}>
							CLAIM REWARDS
						</Typography>
						<Button
							className={classes.maxAllButton}
							key="max-all-btn"
							size="small"
							variant="outlined"
							disabled={maxFlag}
							onClick={maxAll}
						>
							MAX ALL
						</Button>
						<Grid className={classes.subtitle} container direction="row" justify="space-between">
							<Typography variant="subtitle2" color="textSecondary">
								Claimable
							</Typography>
							<Typography variant="subtitle2" color="textSecondary">
								Enter an amount to claim
							</Typography>
						</Grid>
						<div className={classes.rewardsContainer}>{claimItems}</div>
						<Button
							disabled={!canSubmit}
							className={classes.claimButton}
							onClick={() => claimGeysers(claimMap)}
							variant="contained"
							color="primary"
						>
							Claim
						</Button>
					</div>
				</Fade>
			</Modal>
		</div>
	);
});
