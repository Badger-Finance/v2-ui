import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	IconButton,
	Link,
	Typography,
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import BigNumber from 'bignumber.js';
import { Loader } from 'components/Loader';
import { observer } from 'mobx-react-lite';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { StoreContext } from 'mobx/store-context';
import { inCurrency } from 'mobx/utils/helpers';
import React, { useContext, useEffect, useState } from 'react';
import { RewardsModalItem } from './RewardsModalItem';
import clsx from 'clsx';
import CurrencyDisplay from '../common/CurrencyDisplay';
import CloseIcon from '@material-ui/icons/Close';
import routes from '../../config/routes';
import { ArrowBackIosOutlined } from '@material-ui/icons';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		dialog: {
			maxWidth: 862,
		},
		title: {
			padding: theme.spacing(4, 4, 0, 4),
		},
		content: {
			padding: theme.spacing(2, 4, 4, 4),
		},
		closeButton: {
			position: 'absolute',
			right: 24,
			top: 24,
		},
		claimRow: {
			marginBottom: theme.spacing(2),
		},
		divider: {
			marginBottom: theme.spacing(2),
		},
		submitButton: {
			marginTop: theme.spacing(4),
			[theme.breakpoints.down('xs')]: {
				marginTop: theme.spacing(2),
			},
		},
		moreRewardsInformation: {
			width: '75%',
			margin: 'auto',
			backgroundColor: '#181818',
			borderRadius: 8,
			padding: theme.spacing(4),
			[theme.breakpoints.down('sm')]: {
				width: '100%',
				padding: theme.spacing(3),
			},
		},
		moreRewardsDescription: {
			marginTop: theme.spacing(1),
		},
		boostRewards: {
			marginTop: theme.spacing(2),
		},
		rewardsGuideLinkContainer: {
			marginTop: theme.spacing(2),
			textAlign: 'center',
		},
		cursorPointer: {
			cursor: 'pointer',
		},
		arrowBack: {
			marginRight: theme.spacing(1),
		},
		userGuideTokens: {
			[theme.breakpoints.up('sm')]: {
				marginLeft: theme.spacing(7),
			},
		},
		userGuideToken: {
			marginBottom: theme.spacing(2),
		},
		rewardsOptions: {
			paddingInlineStart: theme.spacing(2),
		},
		rewards: {
			color: '#F2BC1B',
		},
		rewardsButton: {
			borderColor: '#F2BC1B',
		},
		rewardsIcon: { marginRight: theme.spacing(1) },
		button: {
			height: 36,
		},
		loadingRewardsButton: {
			minWidth: 37,
			width: 37,
		},
		noRewardsDialog: {
			maxWidth: 672,
		},
		noRewardsContent: {
			[theme.breakpoints.up('xs')]: {
				marginTop: theme.spacing(2),
			},
		},
		noRewardsIcon: {
			marginRight: theme.spacing(1),
		},
		noRewardsExplanation: {
			marginTop: theme.spacing(6),
			[theme.breakpoints.down('xs')]: {
				marginTop: theme.spacing(2),
			},
		},
	}),
);

export interface ClaimMapEntry {
	balance: TokenBalance;
	visualBalance: string;
}

export interface ClaimMap {
	[address: string]: TokenBalance;
}

export interface RewardsModalProps {
	loading: boolean;
}

export const RewardsWidget = observer((): JSX.Element | null => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { setts, onboard, user, router } = store;
	const { badgerTree, claimGeysers, loadingRewards } = store.rewards;
	const { currency } = store.uiState;

	const [guideMode, setGuideMode] = useState(false);
	const [open, setOpen] = useState(false);
	const [claims, setClaims] = useState<ClaimMap>({});
	const [claimableRewards, setClaimableRewards] = useState<ClaimMap>({});

	const hasRewards = Object.keys(claimableRewards).length > 0;

	const totalClaimValue = Object.keys(claims).reduce(
		(total, claimKey) => total.plus(claims[claimKey].value),
		new BigNumber(0),
	);

	const totalRewardsValue = Object.keys(claimableRewards).reduce(
		(total, claimKey) => total.plus(claimableRewards[claimKey].value),
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
		const balances = Object.fromEntries(
			badgerTree.claims
				.filter((claim) => !!setts.getToken(claim.token.address))
				.map((claim) => [claim.token.address, claim]),
		);
		setClaimableRewards(balances);
		setClaims(balances);
	}, [setts, badgerTree.claims]);

	if (!onboard.isActive()) {
		return null;
	}

	if (loadingRewards || user.claimProof === undefined) {
		return (
			<Button
				disabled
				variant="outlined"
				className={clsx(classes.rewards, classes.button, classes.loadingRewardsButton)}
			>
				<Loader size={15} />
			</Button>
		);
	}

	const userGuideTokens = (
		<>
			<Grid item className={classes.userGuideToken}>
				{/*TODO: add link to view vaults when they're available*/}
				<Typography variant="body2" color="textSecondary">
					BADGERDAO TOKENS:
				</Typography>
				<Typography variant="body1">Badger, bBadger, Digg, bDigg</Typography>
				{/*<Box display="flex" alignItems="center">*/}
				{/*	<ArrowRightAltIcon color="primary" />*/}
				{/*	<Link className={classes.cursorPointer}>View Vaults</Link>*/}
				{/*</Box>*/}
			</Grid>
			<Grid item className={classes.userGuideToken}>
				<Typography variant="body2" color="textSecondary">
					NON NATIVE TOKENS:
				</Typography>
				<Typography variant="body1">bBTC, renBTC, oBTC...</Typography>
				{/*<Box display="flex" alignItems="center">*/}
				{/*	<ArrowRightAltIcon color="primary" />*/}
				{/*	<Link className={classes.cursorPointer}>View Vaults</Link>*/}
				{/*</Box>*/}
			</Grid>
			<Grid item className={classes.userGuideToken}>
				<Typography variant="body2" color="textSecondary">
					INDEPENDENT TOKENS:
				</Typography>
				<Typography variant="body1">CVX, bveCVX...</Typography>
				{/*<Box display="flex" alignItems="center">*/}
				{/*	<ArrowRightAltIcon color="primary" />*/}
				{/*	<Link className={classes.cursorPointer}>View Vaults</Link>*/}
				{/*</Box>*/}
			</Grid>
		</>
	);

	const rewardsExplanation = (
		<>
			<Grid item>
				<Typography>Receive maximum rewards when: </Typography>
			</Grid>
			<Grid item>
				<ul className={classes.rewardsOptions}>
					<li>
						<Typography variant="body2">Staking 50% non native tokens</Typography>
					</li>
					<li>
						<Typography variant="body2">Holding and/or Staking 50% BadgerDAO tokens</Typography>
					</li>
				</ul>
			</Grid>
		</>
	);

	return (
		<>
			<Button
				classes={{ outlined: classes.rewardsButton }}
				className={clsx(classes.rewards, classes.button)}
				variant="outlined"
				onClick={() => setOpen(true)}
			>
				<img className={classes.rewardsIcon} src="/assets/icons/rewards-spark.svg" alt="rewards icon" />
				<CurrencyDisplay
					displayValue={inCurrency(totalRewardsValue, currency)}
					variant="body2"
					justify="center"
				/>
			</Button>
			<Dialog
				fullWidth
				maxWidth="sm"
				aria-describedby="Claim your rewards"
				aria-labelledby="claim-modal"
				classes={{ paperWidthSm: classes.noRewardsDialog }}
				open={open && !hasRewards}
				onClose={() => setOpen(false)}
			>
				<DialogTitle className={classes.title}>
					My Claimable Rewards
					<IconButton
						aria-label="go back to rewards"
						className={classes.closeButton}
						onClick={() => setOpen(false)}
					>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent className={classes.content}>
					<Grid container className={classes.noRewardsContent} spacing={2}>
						<Grid item container direction="column" xs={12} sm={6}>
							<Grid item>
								<Box display="flex" alignItems="center">
									<img className={classes.noRewardsIcon} src="/assets/icons/no-rewards-icon.svg" />
									<CurrencyDisplay
										variant="body1"
										justify="flex-start"
										displayValue={inCurrency(new BigNumber(0), currency)}
									/>
								</Box>
							</Grid>
							<Grid item className={classes.noRewardsExplanation}>
								{rewardsExplanation}
							</Grid>
						</Grid>
						<Grid item xs={12} sm={6}>
							{userGuideTokens}
						</Grid>
					</Grid>
				</DialogContent>
			</Dialog>
			<Dialog
				fullWidth
				maxWidth="sm"
				aria-labelledby="claim-modal"
				aria-describedby="Claim your rewards"
				classes={{ paperWidthSm: classes.dialog }}
				open={open && hasRewards}
				onClose={() => setOpen(false)}
			>
				<DialogTitle className={classes.title}>
					{guideMode ? (
						<>
							<Box display="flex" alignItems="center">
								<IconButton
									aria-label="exit guide mode"
									className={classes.arrowBack}
									onClick={() => setGuideMode(false)}
								>
									<ArrowBackIosOutlined />
								</IconButton>
								Rewards User Guide
							</Box>
						</>
					) : (
						<>
							My Claimable Rewards
							<IconButton className={classes.closeButton} onClick={() => setOpen(false)}>
								<CloseIcon />
							</IconButton>
						</>
					)}
				</DialogTitle>
				<DialogContent className={classes.content}>
					{guideMode ? (
						<Grid container>
							<Grid item container direction="column" xs={12} sm={4} className={classes.userGuideTokens}>
								{userGuideTokens}
							</Grid>
							<Grid item xs={12} sm container direction="column">
								{rewardsExplanation}
							</Grid>
						</Grid>
					) : (
						<Grid container spacing={3}>
							<Grid item xs={12} sm={6}>
								{claimableRewards && (
									<Grid container direction="column">
										{Object.keys(claimableRewards).map((rewardsKey, index) => (
											<Grid key={`${rewardsKey}_${index}`} item className={classes.claimRow}>
												<RewardsModalItem
													checked={!!claims[rewardsKey]}
													claimBalance={claimableRewards[rewardsKey]}
													onChange={(checked) => handleClaimCheckChange(rewardsKey, checked)}
												/>
											</Grid>
										))}
										<Divider className={classes.divider} />
										<Grid item container alignItems="center" justify="space-between">
											<Typography variant="body2">Total Claimable Rewards</Typography>
											<CurrencyDisplay
												variant="h6"
												justify="flex-end"
												displayValue={inCurrency(totalClaimValue, currency)}
											/>
										</Grid>
										<Grid item className={classes.submitButton}>
											<Button
												fullWidth
												disabled={true}
												color="primary"
												variant="contained"
												onClick={async () => await claimGeysers(claims)}
											>
												Claim My Rewards
											</Button>
										</Grid>
									</Grid>
								)}
							</Grid>
							<Grid item xs={12} sm={6}>
								<Grid container direction="column" className={classes.moreRewardsInformation}>
									<Grid item>
										<Typography variant="h6">Want more rewards ?</Typography>
									</Grid>
									<Grid item className={classes.moreRewardsDescription}>
										<Typography variant="body2">
											Boost your rewards and support the BadgerDAO ecosystem, by holding and
											staking Badger tokens.
										</Typography>
									</Grid>
									<Grid item className={classes.boostRewards}>
										<Button
											fullWidth
											color="primary"
											variant="outlined"
											onClick={async () => {
												await router.goTo(routes.boostOptimizer);
												setOpen(false);
											}}
										>
											Boost My Rewards
										</Button>
									</Grid>
									<Grid item className={classes.rewardsGuideLinkContainer}>
										<Link
											className={classes.cursorPointer}
											color="primary"
											onClick={() => setGuideMode(true)}
										>
											Rewards User Guide
										</Link>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
});
