import React, { useContext, useEffect, useState } from 'react';
import { Dialog, useTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { TokenBalance } from '../../../mobx/model/tokens/token-balance';
import { TransactionRequestResult } from '../../../mobx/utils/web3';
import UserGuideContent from '../../rewards/UserGuideContent';
import ClaimedRewardsContent from '../../rewards/ClaimedRewardsContent';
import ClaimRewardsContent from '../../rewards/ClaimRewardsContent';
import { ClaimMap } from '../../../mobx/model/rewards/claim-map';

const useStyles = makeStyles(() =>
	createStyles({
		bigDialog: {
			maxWidth: 810,
		},
		smallDialog: {
			maxWidth: 672,
		},
	}),
);

const RewardsDialog = (): JSX.Element => {
	const { rewards, vaults, uiState } = useContext(StoreContext);
	const classes = useStyles();
	const closeDialogTransitionDuration = useTheme().transitions.duration.leavingScreen;

	const [claimableRewards, setClaimableRewards] = useState<ClaimMap>({});
	const [claimedRewards, setClaimedRewards] = useState<TokenBalance[]>();
	const [guideMode, setGuideMode] = useState(false);
	const hasRewards = Object.keys(claimableRewards).length > 0;

	const handleClaim = async (claims: ClaimMap) => {
		const txResult = await rewards.claimGeysers(claims);

		if (txResult === TransactionRequestResult.Success) {
			setClaimedRewards(Object.values(claims));
			await rewards.loadTreeData();
		}
	};

	const handleClaimedRewardsDialogClose = () => {
		uiState.toggleRewardsDialog();
		setTimeout(() => {
			setClaimedRewards(undefined);
		}, closeDialogTransitionDuration);
	};

	useEffect(() => {
		const balances = Object.fromEntries(
			rewards.badgerTree.claims
				.filter((claim) => !!vaults.getToken(claim.token.address) && claim.tokenBalance.gt(0))
				.map((claim) => [claim.token.address, claim]),
		);
		setClaimableRewards(balances);
	}, [vaults, rewards.badgerTree.claims]);

	if (guideMode) {
		return (
			<Dialog
				fullWidth
				maxWidth="sm"
				aria-labelledby="user-guide"
				aria-describedby="Rewards User Guide"
				classes={{ paperWidthSm: classes.smallDialog }}
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
				maxWidth="sm"
				aria-labelledby="claimed-rewards"
				aria-describedby="Claimed Rewards Overview"
				classes={{ paperWidthSm: classes.smallDialog }}
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
		<Dialog
			fullWidth
			maxWidth="sm"
			aria-labelledby="claim-modal"
			aria-describedby="Claim your rewards"
			classes={{ paperWidthSm: hasRewards ? classes.bigDialog : classes.smallDialog }}
			open={uiState.rewardsDialogOpen}
			onClose={() => uiState.toggleRewardsDialog()}
		>
			<ClaimRewardsContent
				claimableRewards={claimableRewards}
				onClose={() => uiState.toggleRewardsDialog()}
				onClaim={handleClaim}
				onGuideModeSelection={() => setGuideMode(true)}
			/>
		</Dialog>
	);
};

export default observer(RewardsDialog);
