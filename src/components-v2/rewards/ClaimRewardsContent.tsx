import {
	Button,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	IconButton,
	Link,
	Typography,
	useMediaQuery,
	useTheme,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';

import routes from '../../config/routes';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { RewardsModalItem } from '../landing/RewardsModalItem';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { BigNumber, ethers } from 'ethers';
import { TokenBalances } from 'mobx/model/account/user-balances';
import { deepCopy } from 'utils/lodashToNative';
import InvalidCycleDialog from 'components-v2/common/dialogs/InvalidCycleDialog';

const checkboxComplementarySpace = 1.5;

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		title: {
			padding: '33px 43px 25px 43px',
			[theme.breakpoints.down('xs')]: {
				padding: '24px 33px 25px 33px',
			},
		},
		titleText: {
			fontWeight: 700,
		},
		content: {
			padding: '0px 43px 48px 43px',
			[theme.breakpoints.down('xs')]: {
				padding: '0px 33px 37px 33px',
			},
		},
		userGuideToken: {
			marginBottom: theme.spacing(2),
		},
		rewardsOptions: {
			paddingInlineStart: theme.spacing(2),
		},
		successIconContainer: {
			marginBottom: theme.spacing(1),
		},
		rewardsTitle: {
			fontSize: 20,
			marginBottom: theme.spacing(2),
		},
		closeButton: {
			position: 'absolute',
			right: 24,
			top: 24,
			[theme.breakpoints.down('xs')]: {
				right: 20,
				top: 14,
			},
		},
		claimRow: {
			width: '100%',
			marginBottom: theme.spacing(2),
		},
		moreRewardsSection: {
			[theme.breakpoints.down('xs')]: {
				backgroundColor: '#181818',
				marginLeft: -33,
				marginRight: -33,
				marginBottom: -37,
			},
		},
		moreRewardsInformation: {
			maxWidth: 320,
			margin: 'auto',
			backgroundColor: '#181818',
			borderRadius: 8,
			padding: theme.spacing(4),
			[theme.breakpoints.down('xs')]: {
				maxWidth: '100%',
				margin: 0,
				width: '100%',
				padding: '27px 33px 37px 34px',
			},
		},
		moreRewardsDescription: {
			marginTop: theme.spacing(1),
		},
		boostRewards: {
			marginTop: theme.spacing(2),
		},
		rewardsGuideLinkContainer: {
			margin: theme.spacing(2, 0),
		},
		rewardsGuide: {
			textDecoration: 'none !important',
			cursor: 'pointer',
			fontWeight: 700,
			borderBottom: `1px solid ${theme.palette.primary.main}`,
			paddingBottom: theme.spacing(1),
		},
		submitButton: {
			marginTop: theme.spacing(4),
			[theme.breakpoints.down('xs')]: {
				marginTop: theme.spacing(2),
			},
		},
		divider: {
			margin: theme.spacing(0, checkboxComplementarySpace, 2),
		},
		rewardsIcon: {
			marginRight: theme.spacing(1),
		},
		noRewardsAmount: {
			display: 'flex',
			alignItems: 'center',
			marginTop: theme.spacing(3),
			marginBottom: theme.spacing(1),
			[theme.breakpoints.down('xs')]: {
				marginTop: 0,
			},
		},
		contentGrid: {
			[theme.breakpoints.down('xs')]: {
				paddingBottom: 0,
			},
		},
		// we do this because we need extra space for the checkboxes hover animation. we remove the space from
		// the container's spacing but complement it with padding in the children
		checkboxesSpacing: {
			paddingRight: `${theme.spacing(8) / 2 - theme.spacing(checkboxComplementarySpace)}px !important`,
			paddingLeft: `${theme.spacing(8) / 2 - theme.spacing(checkboxComplementarySpace)}px !important`,
			[theme.breakpoints.down('xs')]: {
				paddingRight: `${theme.spacing(6) / 2 - theme.spacing(checkboxComplementarySpace)}px !important`,
				paddingLeft: `${theme.spacing(6) / 2 - theme.spacing(checkboxComplementarySpace)}px !important`,
			},
		},
		contentPadding: {
			'& > *': {
				// here is the complementary space
				padding: theme.spacing(0, checkboxComplementarySpace),
			},
		},
		optionsContainer: {
			maxHeight: 300,
			overflowY: 'auto',
		},
	}),
);

interface Props {
	onGuideModeSelection: () => void;
}

type ClaimOptions = {
	[token: string]: {
		hasBalance: boolean;
		balance: TokenBalance;
	};
};

const ClaimRewardsContent = ({ onGuideModeSelection }: Props): JSX.Element => {
	const classes = useStyles();
	const isMobile = useMediaQuery(useTheme().breakpoints.down('xs'));
	const { router, sdk, tree, uiState } = useContext(StoreContext);
	const { claimable, claimProof } = tree;

	const closeDialogTransitionDuration = useTheme().transitions.duration.leavingScreen;

	const [showInvalidCycle, setShowInvalidCycle] = useState(false);
	const [claimOptions, setClaimOptions] = useState<ClaimOptions>(
		Object.fromEntries(
			Object.entries(claimable).map((e) => {
				const options = {
					hasBalance: e[1].tokenBalance.gt(0),
					balance: TokenBalance.fromBalance(e[1], e[1].balance),
				};
				return [e[0], options];
			}),
		),
	);

	const hasRewards = claimProof && Object.keys(claimable).length > 0;
	const totalClaimValue = Object.values(claimOptions).map((c) => c.balance).reduce((total, k) => (total += k.value), 0);

	const handleClaimCheckChange = (rewardKey: string, checked: boolean) => {
		const newClaimOptions = {
			...claimOptions,
		};
		if (!checked) {
			newClaimOptions[rewardKey].balance.balance = 0;
			newClaimOptions[rewardKey].balance.tokenBalance = BigNumber.from(0);
		} else {
			newClaimOptions[rewardKey].balance.balance = claimable[rewardKey].balance;
			newClaimOptions[rewardKey].balance.tokenBalance = BigNumber.from(
				claimable[rewardKey].tokenBalance.toString(),
			);
		}
		setClaimOptions(newClaimOptions);
	};

	const handleClaim = async (claimOptions: ClaimOptions) => {
		try {
			if (!tree.claimProof) {
				return;
			}
			const claimTokens = Object.keys(claimOptions);
			const claimAmounts = Object.values(claimOptions).map((c) => c.balance.tokenBalance);

			const { cumulativeAmounts } = tree.claimProof;

			const { index, cycle, proof } = tree.claimProof;
			const tx = await sdk.rewards.badgerTree.claim(claimTokens, cumulativeAmounts, index, cycle, proof, claimAmounts);
			await tx.wait();
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

	return (
		<>
			<InvalidCycleDialog open={showInvalidCycle} onClose={() => setShowInvalidCycle(false)} />
			<DialogTitle className={classes.title} disableTypography>
				<Typography variant="h6" className={classes.titleText}>
					My Rewards
				</Typography>
				<IconButton className={classes.closeButton} onClick={() => uiState.toggleRewardsDialog()}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent className={classes.content}>
				<Grid container spacing={isMobile ? 6 : 8} className={classes.contentGrid}>
					<Grid
						item
						xs={12}
						sm={hasRewards ? 6 : 4}
						className={clsx(hasRewards && classes.checkboxesSpacing)}
					>
						{hasRewards ? (
							<Grid container direction="column" className={classes.contentPadding}>
								<Grid item container className={classes.optionsContainer}>
									{Object.values(claimOptions)
										.filter((o) => o.hasBalance)
										.map((option, index) => {
											return (
												<Grid
													key={`${option.balance.token.address}_${index}`}
													item
													className={classes.claimRow}
												>
													<RewardsModalItem
														checked={option.balance.tokenBalance.gt(0)}
														claimBalance={option.balance}
														onChange={(checked) =>
															handleClaimCheckChange(
																option.balance.token.address,
																checked,
															)
														}
													/>
												</Grid>
											);
										})}
								</Grid>
								<Divider className={classes.divider} />
								<Grid item container alignItems="center" justifyContent="space-between">
									<Typography variant="body2">Total Claimable Rewards</Typography>
									<CurrencyDisplay
										variant="h6"
										justifyContent="flex-end"
										displayValue={totalClaimValue.toFixed(2)}
										TypographyProps={{ className: classes.titleText }}
									/>
								</Grid>
								<Grid item className={classes.submitButton}>
									<Button
										fullWidth
										disabled={totalClaimValue === 0}
										color="primary"
										variant="contained"
										onClick={() => handleClaim(claimOptions)}
									>
										Claim My Rewards
									</Button>
								</Grid>
							</Grid>
						) : (
							<Grid container direction="column">
								<div className={classes.noRewardsAmount}>
									<img
										className={classes.rewardsIcon}
										src="/assets/icons/rewards-gift.svg"
										alt="rewards icon"
									/>
									<CurrencyDisplay
										variant="h6"
										justifyContent="flex-end"
										displayValue={'0'}
										TypographyProps={{ className: classes.titleText }}
									/>
								</div>
								<Typography variant="body2" color="textSecondary">
									No rewards available.
								</Typography>
							</Grid>
						)}
					</Grid>
					<Grid item xs={12} sm={hasRewards ? 6 : 8}>
						<Grid className={classes.moreRewardsSection}>
							<Grid container direction="column" className={classes.moreRewardsInformation}>
								<Grid item>
									<Typography variant="h6" className={classes.titleText}>
										Want more rewards ?
									</Typography>
								</Grid>
								<Grid item className={classes.moreRewardsDescription}>
									<Typography variant="body2">
										Boost your rewards and support the BadgerDAO ecosystem, by holding and staking
										Badger tokens.
									</Typography>
								</Grid>
								<Grid item className={classes.rewardsGuideLinkContainer}>
									<Link
										className={classes.rewardsGuide}
										color="primary"
										onClick={onGuideModeSelection}
									>
										Rewards User Guide
									</Link>
								</Grid>
								<Grid item className={classes.boostRewards}>
									<Button
										fullWidth
										color="primary"
										variant="contained"
										onClick={async () => {
											await router.goTo(routes.boostOptimizer);
											uiState.toggleRewardsDialog();
										}}
									>
										Boost My Rewards
									</Button>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</DialogContent>
		</>
	);
};

export default observer(ClaimRewardsContent);
