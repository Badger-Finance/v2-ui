import { Dialog, useTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';

import { TokenBalance } from '../../../mobx/model/tokens/token-balance';
import ClaimedRewardsContent from '../../rewards/ClaimedRewardsContent';
import ClaimRewardsContent from '../../rewards/ClaimRewardsContent';
import UserGuideContent from '../../rewards/UserGuideContent';
import InvalidCycleDialog from './InvalidCycleDialog';
import { TokenBalances } from 'mobx/model/account/user-balances';

const useStyles = makeStyles(() =>
	createStyles({
		xlDialog: {
			maxWidth: 810,
		},
		bigDialog: {
			maxWidth: 672,
		},
	}),
);

const RewardsDialog = (): JSX.Element => {
	const { tree, uiState } = useContext(StoreContext);
	const classes = useStyles();
	const closeDialogTransitionDuration = useTheme().transitions.duration.leavingScreen;

	const [showInvalidCycle, setShowInvalidCycle] = useState(false);
	const [claimedRewards, setClaimedRewards] = useState<TokenBalance[]>();
	const [guideMode, setGuideMode] = useState(false);
	const hasRewards = Object.keys(tree.claimable).length > 0;

	const handleClaim = async (claims: TokenBalances) => {
		try {
			// ENABLE THIS BACK YOU DOGGY JINTAO
			// const txResult = await rewards.claimGeysers(claims);
			// if (txResult === TransactionRequestResult.Success) {
			// 	setClaimedRewards(Object.values(claims));
			// 	await rewards.loadTreeData();
			// }
		} catch (error) {
			console.error(error);
			if (String(error).includes('execution reverted: Invalid cycle')) {
				tree.reportInvalidCycle();
				uiState.toggleRewardsDialog();
				setTimeout(() => {
					setShowInvalidCycle(true);
				}, closeDialogTransitionDuration);
			}
		}
	};

	const handleClaimedRewardsDialogClose = () => {
		uiState.toggleRewardsDialog();
		setTimeout(() => {
			setClaimedRewards(undefined);
		}, closeDialogTransitionDuration);
	};

	if (guideMode) {
		return (
			<Dialog
				fullWidth
				maxWidth="xl"
				aria-labelledby="user-guide"
				aria-describedby="Rewards User Guide"
				classes={{ paperWidthXl: classes.bigDialog }}
				open={uiState.rewardsDialogOpen}
				onClose={() => uiState.toggleRewardsDialog()}
			>
				<UserGuideContent onGoBack={() => setGuideMode(false)} onClose={() => uiState.toggleRewardsDialog()} />
			</Dialog>
		);
	}

	if (claimedRewards) {
		return (
			<Dialog
				fullWidth
				maxWidth="xl"
				aria-labelledby="claimed-rewards"
				aria-describedby="Claimed Rewards Overview"
				classes={{ paperWidthXl: classes.bigDialog }}
				open={uiState.rewardsDialogOpen}
				onClose={() => uiState.toggleRewardsDialog()}
			>
				<ClaimedRewardsContent
					claimedRewards={claimedRewards}
					onClose={handleClaimedRewardsDialogClose}
					onGoBack={() => setClaimedRewards(undefined)}
				/>
			</Dialog>
		);
	}

	return (
		<>
			<Dialog
				fullWidth
				maxWidth="xl"
				aria-labelledby="claim-modal"
				aria-describedby="Claim your rewards"
				classes={{ paperWidthXl: hasRewards ? classes.xlDialog : classes.bigDialog }}
				open={uiState.rewardsDialogOpen}
				onClose={() => uiState.toggleRewardsDialog()}
			>
				<ClaimRewardsContent
					claimableRewards={tree.claimable}
					onClose={() => uiState.toggleRewardsDialog()}
					onClaim={handleClaim}
					onGuideModeSelection={() => setGuideMode(true)}
				/>
			</Dialog>
			<InvalidCycleDialog open={showInvalidCycle} onClose={() => setShowInvalidCycle(false)} />
		</>
	);
};

export default observer(RewardsDialog);
