import { Backdrop, Button, ButtonGroup, Fade, Grid, Modal, Typography } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import BigNumber from 'bignumber.js';
import { CLAIMS_SYMBOLS } from 'config/constants';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { inCurrency } from 'mobx/utils/helpers';
import React, { useState, useContext } from 'react';
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
			padding: theme.spacing(2, 2, 3),
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
		openModalButton: { marginRight: theme.spacing(1) },
		maxAllButton: {
			maxWidth: '25%',
			marginLeft: 'auto',
			marginRight: 'auto',
			marginTop: theme.spacing(1),
		},
	}),
);

export interface ClaimMap {
	[address: string]: BigNumber;
}

export const RewardsModal = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { badgerTree, claimGeysers } = store.rewards;

	const [open, setOpen] = useState(false);
	const [claimMap, setClaimMap] = useState<ClaimMap | undefined>(undefined);
	const [maxFlag, setMaxFlag] = useState(false);

	const handleOpen = () => {
		if (!badgerTree || !badgerTree.claims) return;
		let initialClaimMap = {};
		badgerTree.claims.map((claim: [string, BigNumber]) => {
			initialClaimMap = { ...initialClaimMap, [claim[0]]: claim[1] };
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

	const availableRewards = () => {
		if (!badgerTree || !badgerTree.claims) return [];
		const elements = badgerTree.claims.map((claim: any[]) => {
			const { network } = store.wallet;
			const claimAddress: string = claim[0];
			const claimValue = claim
				? claim[1].dividedBy(
						claimAddress === network.deploy.tokens.digg
							? badgerTree.sharesPerFragment.multipliedBy(1e9)
							: claimAddress === network.deploy.tokens.usdc
							? 1e6
							: 1e18,
				  )
				: claim[1];
			const claimDisplay = inCurrency(claimValue, 'eth', true);
			return (
				parseFloat(claimDisplay) > 0 && (
					<RewardsModalItem
						key={claimAddress}
						amount={claimDisplay}
						address={claimAddress}
						symbol={CLAIMS_SYMBOLS[network.name][claimAddress]}
						onChange={handleClaimMap}
						maxFlag={maxFlag}
					/>
				)
			);
		});
		return elements;
	};

	const rewards: JSX.Element[] = availableRewards().filter(Boolean);
	return rewards.length > 0 ? (
		<div>
			<ButtonGroup className={classes.openModalButton} size="small" variant="outlined" color="primary">
				<Button variant="contained" onClick={handleOpen}>
					CLAIM
				</Button>
			</ButtonGroup>

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
						<div className={classes.rewardsContainer}>{rewards}</div>
						<Button
							className={classes.claimButton}
							onClick={() => {
								claimGeysers(false, claimMap);
							}}
							variant="contained"
							color="primary"
						>
							Claim
						</Button>
					</div>
				</Fade>
			</Modal>
		</div>
	) : (
		<> </>
	);
});

export default RewardsModal;
