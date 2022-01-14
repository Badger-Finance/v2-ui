import React, { useContext, useState } from 'react';
import { Dialog, useTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { ClaimMap } from '../../landing/RewardsWidget';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { TokenBalance } from '../../../mobx/model/tokens/token-balance';
import { TransactionRequestResult } from '../../../mobx/utils/web3';
import UserGuideContent from '../../rewards/UserGuideContent';
import ClaimedRewardsContent from '../../rewards/ClaimedRewardsContent';
import ClaimRewardsContent from '../../rewards/ClaimRewardsContent';

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

interface Props {
	open: boolean;
	onClose: () => void;
	claimableRewards: ClaimMap;
}

const RewardsDialog = ({ open, onClose, claimableRewards }: Props): JSX.Element => {
	const { rewards } = useContext(StoreContext);
	const classes = useStyles();
	const closeDialogTransitionDuration = useTheme().transitions.duration.leavingScreen;

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
		onClose();
		setTimeout(() => {
			setClaimedRewards(undefined);
		}, closeDialogTransitionDuration);
	};

	if (guideMode) {
		return (
			<Dialog
				fullWidth
				maxWidth="sm"
				aria-labelledby="user-guide"
				aria-describedby="Rewards User Guide"
				classes={{ paperWidthSm: classes.smallDialog }}
				open={open}
				onClose={onClose}
			>
				<UserGuideContent onGoBack={() => setGuideMode(false)} onClose={onClose} />
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
				open={open}
				onClose={onClose}
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
			open={open}
			onClose={onClose}
		>
			<ClaimRewardsContent
				claimableRewards={claimableRewards}
				onClose={onClose}
				onClaim={handleClaim}
				onGuideModeSelection={() => setGuideMode(true)}
			/>
		</Dialog>
	);
};

export default observer(RewardsDialog);
