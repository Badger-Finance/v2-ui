import React, { useContext, useEffect, useState } from 'react';
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
import CloseIcon from '@material-ui/icons/Close';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { RewardsModalItem } from '../landing/RewardsModalItem';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { inCurrency } from '../../mobx/utils/helpers';
import routes from '../../config/routes';
import { ClaimMap } from '../landing/RewardsWidget';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import clsx from 'clsx';

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
	claimableRewards: ClaimMap;
	onClose: () => void;
	onClaim: (claim: ClaimMap) => void;
	onGuideModeSelection: () => void;
}

const ClaimRewardsContent = ({ claimableRewards, onClose, onGuideModeSelection, onClaim }: Props): JSX.Element => {
	const classes = useStyles();
	const isMobile = useMediaQuery(useTheme().breakpoints.down('xs'));
	const { uiState, router, onboard } = useContext(StoreContext);
	const [claims, setClaims] = useState<ClaimMap>(claimableRewards);

	const hasRewards = onboard.isActive() && Object.keys(claims).length > 0;

	const totalClaimValue = Object.keys(claims).reduce(
		(total, claimKey) => total.plus(claims[claimKey].value),
		new BigNumber(0),
	);

	const handleClaimCheckChange = (rewardKey: string, checked: boolean) => {
		if (checked) {
			setClaims({
				...claims,
				[rewardKey]: claimableRewards[rewardKey],
			});
		} else {
			const newClaims = { ...claims };
			delete newClaims[rewardKey];
			setClaims(newClaims);
		}
	};

	useEffect(() => {
		setClaims(claimableRewards);
	}, [claimableRewards]);

	return (
		<>
			<DialogTitle className={classes.title}>
				<Typography variant="h6" className={classes.titleText}>
					My Rewards
				</Typography>
				<IconButton className={classes.closeButton} onClick={onClose}>
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
									{Object.keys(claimableRewards).map((rewardsKey, index) => (
										<Grid key={`${rewardsKey}_${index}`} item className={classes.claimRow}>
											<RewardsModalItem
												checked={!!claims[rewardsKey]}
												claimBalance={claimableRewards[rewardsKey]}
												onChange={(checked) => handleClaimCheckChange(rewardsKey, checked)}
											/>
										</Grid>
									))}
								</Grid>
								<Divider className={classes.divider} />
								<Grid item container alignItems="center" justifyContent="space-between">
									<Typography variant="body2">Total Claimable Rewards</Typography>
									<CurrencyDisplay
										variant="h6"
										justifyContent="flex-end"
										displayValue={inCurrency(totalClaimValue, uiState.currency)}
										TypographyProps={{ className: classes.titleText }}
									/>
								</Grid>
								<Grid item className={classes.submitButton}>
									<Button
										fullWidth
										disabled={totalClaimValue.eq(0)}
										color="primary"
										variant="contained"
										onClick={() => onClaim(claims)}
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
										displayValue={inCurrency(new BigNumber(0), uiState.currency, 2)}
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
											onClose();
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
