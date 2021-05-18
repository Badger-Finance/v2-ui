import { Backdrop, Button, ButtonGroup, Fade, Grid, Modal, Typography } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import BigNumber from 'bignumber.js';
import { CLAIMS_SYMBOLS } from 'config/constants';
import { observer } from 'mobx-react-lite';
import { TokenBalance } from 'mobx/model/token-balance';
import { StoreContext } from 'mobx/store-context';
import { inCurrency } from 'mobx/utils/helpers';
import React, { useState, useContext } from 'react';
import { getToken } from 'web3/config/token-config';
import { UserClaimData } from '../../mobx/model';
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
	}),
);

export interface ClaimMap {
	[address: string]: BigNumber;
}

interface RewardReturn {
	totalClaimValue: BigNumber;
	rewards: (JSX.Element | boolean)[];
}

export const RewardsModal = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { badgerTree, claimGeysers } = store.rewards;
	const { currency } = store.uiState;
	const { setts, rewards } = store;

	const [open, setOpen] = useState(false);
	const [claimMap, setClaimMap] = useState<ClaimMap | undefined>(undefined);
	const [maxFlag, setMaxFlag] = useState(false);

	const handleOpen = () => {
		if (!badgerTree || !badgerTree.claims) return;
		let initialClaimMap = {};
		badgerTree.claims.map((claim: UserClaimData) => {
			initialClaimMap = { ...initialClaimMap, [claim.token]: claim.amount };
		});
		setClaimMap({ ...initialClaimMap });
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleClaimMap = (address: string, amount: string) => {
		setClaimMap({ ...claimMap, [address]: new BigNumber(amount) });
	};

	const maxAll = () => {
		setMaxFlag(!maxFlag);
	};

	const availableRewards = (): RewardReturn | boolean => {
		const { claims, sharesPerFragment } = badgerTree;
		if (!claims || !sharesPerFragment) {
			return false;
		}
		let tcv = new BigNumber(0);
		const elements = claims
			.map((claim: UserClaimData): JSX.Element | boolean => {
				const { network } = store.wallet;
				const token = getToken(claim.token);
				if (!token) {
					return false;
				}
				const tokenPrice = setts.getPrice(token.address);
				const tokenBalance = new TokenBalance(rewards, token, claim.amount, tokenPrice);
				if (tokenBalance.balance.eq(0) || tokenBalance.value.eq(0)) {
					return false;
				}
				tcv = tokenBalance.value.plus(tcv);
				return (
					<RewardsModalItem
						key={token.address}
						amount={tokenBalance.balanceDisplay()}
						value={tokenBalance.balanceValueDisplay(currency)}
						address={token.address}
						symbol={CLAIMS_SYMBOLS[network.name][token.address]}
						onChange={handleClaimMap}
						maxFlag={maxFlag}
					/>
				);
			})
			.filter(Boolean);

		return elements ? { totalClaimValue: tcv, rewards: elements } : false;
	};

	const rewardReturn: RewardReturn | boolean = availableRewards();
	if (typeof rewardReturn === 'boolean') {
		return <></>;
	}

	const userRewards = rewardReturn.rewards;
	const totalClaimValue = rewardReturn.totalClaimValue;

	return userRewards.length > 0 ? (
		<Grid>
			<Grid container direction="column">
				<Typography variant="caption" className={classes.amountDisplay}>
					{inCurrency(totalClaimValue, currency, true, 2)} in Rewards
				</Typography>
				<ButtonGroup className={classes.openModalButton} size="small" variant="outlined" color="primary">
					<Button variant="contained" onClick={handleOpen}>
						CLAIM REWARDS
					</Button>
				</ButtonGroup>
			</Grid>

			<Modal
				aria-labelledby="claim-modal"
				aria-describedby="Claim your rewards"
				open={open}
				onClose={handleClose}
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
						<div className={classes.rewardsContainer}>{userRewards}</div>
						<Button
							className={classes.claimButton}
							onClick={() => {
								claimGeysers(claimMap);
							}}
							variant="contained"
							color="primary"
						>
							Claim
						</Button>
					</div>
				</Fade>
			</Modal>
		</Grid>
	) : (
		<> </>
	);
});
