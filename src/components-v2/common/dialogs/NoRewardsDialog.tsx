import React, { useContext } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, Grid, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import CurrencyDisplay from '../CurrencyDisplay';
import { inCurrency } from '../../../mobx/utils/helpers';
import BigNumber from 'bignumber.js';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { StoreContext } from '../../../mobx/store-context';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		title: {
			padding: theme.spacing(4, 4, 0, 4),
		},
		titleText: {
			fontWeight: 700,
		},
		content: {
			padding: theme.spacing(2, 4, 4, 4),
		},
		closeButton: {
			position: 'absolute',
			right: 24,
			top: 24,
		},
		cursorPointer: {
			cursor: 'pointer',
		},
		userGuideToken: {
			marginBottom: theme.spacing(2),
		},
		rewardsOptions: {
			paddingInlineStart: theme.spacing(2),
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

interface Props {
	open: boolean;
	onClose: () => void;
}

const NoRewardsDialog = ({ open, onClose }: Props): JSX.Element => {
	const { uiState } = useContext(StoreContext);
	const classes = useStyles();

	return (
		<Dialog
			fullWidth
			maxWidth="sm"
			aria-describedby="Claim your rewards"
			aria-labelledby="claim-modal"
			classes={{ paperWidthSm: classes.noRewardsDialog }}
			open={open}
			onClose={onClose}
		>
			<DialogTitle className={classes.title}>
				<Typography variant="h6" className={classes.titleText}>
					My Rewards
				</Typography>
				<IconButton aria-label="go back to rewards" className={classes.closeButton} onClick={onClose}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent className={classes.content}>
				<Grid container className={classes.noRewardsContent} spacing={2}>
					<Grid item container direction="column" xs={12} sm={6}>
						<Grid item>
							<Box display="flex" alignItems="center">
								<img
									className={classes.noRewardsIcon}
									src="/assets/icons/no-rewards-icon.svg"
									alt="no rewards icon"
								/>
								<CurrencyDisplay
									variant="h6"
									justify="flex-start"
									displayValue={inCurrency(new BigNumber(0), uiState.currency)}
									TypographyProps={{ className: classes.titleText }}
								/>
							</Box>
						</Grid>
						<Grid item className={classes.noRewardsExplanation}>
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
					<Grid item xs={12} sm={6}>
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
				</Grid>
			</DialogContent>
		</Dialog>
	);
};

export default observer(NoRewardsDialog);
