import React from 'react';
import { Button, DialogContent, Grid, IconButton, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		title: {
			padding: theme.spacing(4, 4, 0, 4),
		},
		content: {
			padding: theme.spacing(2, 4, 4, 4),
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
		arrowBack: {
			marginRight: theme.spacing(1),
		},
		centeredText: {
			textAlign: 'center',
			margin: '67px 0px',
		},
		goBackButton: {
			height: 50,
			maxWidth: 267,
			margin: 'auto',
			marginTop: 27,
		},
		closeButton: {
			position: 'absolute',
			right: 24,
			top: 24,
		},
	}),
);

interface Props {
	claimedRewards: TokenBalance[];
	onClose: () => void;
	onGoBack: () => void;
}

const ClaimedRewardsContent = ({ claimedRewards, onClose, onGoBack }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<>
			<DialogContent className={classes.content}>
				<Grid container direction="column" className={classes.centeredText}>
					<IconButton className={classes.closeButton} onClick={onClose}>
						<CloseIcon />
					</IconButton>
					<Grid item className={classes.successIconContainer}>
						<img src="/assets/icons/rewards-claim-success.svg" alt="rewards success icon" />
					</Grid>
					<Typography variant="h4" className={classes.rewardsTitle}>
						Rewards Claimed
					</Typography>
					<Typography variant="subtitle2">Rewards claimed for tokens:</Typography>
					{claimedRewards.map(({ token }) => (
						<Typography variant="subtitle2" key={token.address}>
							{token.symbol}
						</Typography>
					))}
					<Button variant="contained" color="primary" className={classes.goBackButton} onClick={onGoBack}>
						Go Back To My Rewards
					</Button>
				</Grid>
			</DialogContent>
		</>
	);
};

export default ClaimedRewardsContent;
