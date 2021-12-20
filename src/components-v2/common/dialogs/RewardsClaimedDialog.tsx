import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Button, Dialog, DialogContent, Grid, IconButton, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { TokenBalance } from '../../../mobx/model/tokens/token-balance';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		dialog: {
			maxWidth: 672,
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
		centeredText: {
			textAlign: 'center',
			margin: '67px 0px 37px 0px',
		},
		rewardsTitle: {
			fontSize: 20,
			marginBottom: theme.spacing(2),
		},
		goBackButton: {
			height: 50,
			maxWidth: 267,
			margin: 'auto',
			marginTop: 27,
		},
		successIconContainer: {
			marginBottom: theme.spacing(1),
		},
	}),
);

interface Props {
	open: boolean;
	onClose: () => void;
	onGoBack: () => void;
	claims: TokenBalance[];
}

const RewardsClaimedDialog = ({ open, onClose, onGoBack, claims }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Dialog
			fullWidth
			maxWidth="sm"
			aria-describedby="Claim your rewards"
			aria-labelledby="claim-modal"
			classes={{ paperWidthSm: classes.dialog }}
			open={open}
			onClose={onClose}
		>
			<DialogContent className={classes.content}>
				<Grid container direction="column" className={classes.centeredText}>
					<IconButton aria-label="go back to rewards" className={classes.closeButton} onClick={onClose}>
						<CloseIcon />
					</IconButton>
					<Grid item className={classes.successIconContainer}>
						<img src="/assets/icons/rewards-claim-success.svg" alt="rewards success icon" />
					</Grid>
					<Typography variant="h4" className={classes.rewardsTitle}>
						Rewards Claimed
					</Typography>
					<Typography variant="body2">Rewards claimed for tokens:</Typography>
					{claims.map(({ token }) => (
						<Typography variant="body2" key={token.address}>
							{token.symbol}
						</Typography>
					))}
					<Button variant="contained" color="primary" className={classes.goBackButton} onClick={onGoBack}>
						Go Back To My Rewards
					</Button>
				</Grid>
			</DialogContent>
		</Dialog>
	);
};

export default RewardsClaimedDialog;
