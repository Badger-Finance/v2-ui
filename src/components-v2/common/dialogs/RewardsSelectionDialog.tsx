import React, { useContext, useEffect, useState } from 'react';
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
import { ArrowBackIosOutlined } from '@material-ui/icons';
import CloseIcon from '@material-ui/icons/Close';
import { RewardsModalItem } from '../../landing/RewardsModalItem';
import CurrencyDisplay from '../CurrencyDisplay';
import { inCurrency } from '../../../mobx/utils/helpers';
import routes from '../../../config/routes';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { ClaimMap } from '../../landing/RewardsWidget';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import BigNumber from 'bignumber.js';

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
	}),
);

interface Props {
	open: boolean;
	onClose: () => void;
	claimableRewards: ClaimMap;
}

const RewardsSelectionDialog = ({ open, onClose, claimableRewards }: Props): JSX.Element => {
	const { router, rewards, uiState } = useContext(StoreContext);
	const classes = useStyles();
	const [claims, setClaims] = useState<ClaimMap>(claimableRewards);
	const [guideMode, setGuideMode] = useState(false);

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
		<Dialog
			fullWidth
			maxWidth="sm"
			aria-labelledby="claim-modal"
			aria-describedby="Claim your rewards"
			classes={{ paperWidthSm: classes.dialog }}
			open={open}
			onClose={onClose}
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
						<IconButton className={classes.closeButton} onClick={onClose}>
							<CloseIcon />
						</IconButton>
					</>
				)}
			</DialogTitle>
			<DialogContent className={classes.content}>
				{guideMode ? (
					<Grid container>
						<Grid item container direction="column" xs={12} sm={4} className={classes.userGuideTokens}>
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
						</Grid>
						<Grid item xs={12} sm container direction="column">
							<Grid item>
								<Typography>Receive maximum rewards when: </Typography>
							</Grid>
							<Grid item>
								<ul className={classes.rewardsOptions}>
									<li>
										<Typography variant="body2">Staking 50% non native tokens</Typography>
									</li>
									<li>
										<Typography variant="body2">
											Holding and/or Staking 50% BadgerDAO tokens
										</Typography>
									</li>
								</ul>
							</Grid>
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
											displayValue={inCurrency(totalClaimValue, uiState.currency)}
										/>
									</Grid>
									<Grid item className={classes.submitButton}>
										<Button
											fullWidth
											disabled={totalClaimValue.eq(0)}
											color="primary"
											variant="contained"
											onClick={async () => await rewards.claimGeysers(claims)}
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
										Boost your rewards and support the BadgerDAO ecosystem, by holding and staking
										Badger tokens.
									</Typography>
								</Grid>
								<Grid item className={classes.boostRewards}>
									<Button
										fullWidth
										color="primary"
										variant="outlined"
										onClick={async () => {
											await router.goTo(routes.boostOptimizer);
											onClose();
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
	);
};

export default observer(RewardsSelectionDialog);
