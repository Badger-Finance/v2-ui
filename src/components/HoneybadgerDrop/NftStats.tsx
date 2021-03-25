import React from 'react';
import { Box, Button, CircularProgress, Grid, makeStyles, Paper, Typography } from '@material-ui/core';

interface Props {
	nftId: string;
	name: string;
	balance: string;
	remaining: string;
	redemptionRateBdigg: string;
	redemptionRateUsd: string;
	image?: string;
	disabled?: boolean;
	loading?: boolean;
	onRedeem: (id: string) => void;
}

const useStyles = makeStyles((theme) => ({
	paper: {
		padding: theme.spacing(2, 3),
	},
	redeemButton: {
		color: theme.palette.common.black,
	},
	textCenter: {
		textAlign: 'center',
	},
	textStart: {
		textAlign: 'start',
	},
	textEnd: {
		textAlign: 'end',
	},
	nftImage: {
		height: 225,
		width: 150,
	},
	spinner: {
		color: theme.palette.common.white,
	},
}));

const NftStats: React.FC<Props> = ({
	nftId,
	name,
	balance,
	remaining,
	redemptionRateBdigg,
	redemptionRateUsd,
	image,
	disabled = false,
	loading = false,
	onRedeem,
}) => {
	const classes = useStyles();

	return (
		<Paper elevation={0} className={classes.paper}>
			<Grid container spacing={1}>
				{image && (
					<Grid item xs={12} className={classes.textCenter}>
						<video
							src={image}
							className={classes.nftImage}
							autoPlay
							loop
							playsInline
							muted
						/>
					</Grid>
				)}
				<Grid item xs={12}>
					<Typography className={classes.textCenter}>{name}</Typography>
				</Grid>
				<Grid item container xs={12}>
					<Grid item container justify="space-between" xs={12}>
						<Grid item xs={6} className={classes.textStart}>
							<Typography variant="caption" color="textSecondary">
								Your Balance
							</Typography>
						</Grid>
						<Grid item xs={6} className={classes.textEnd}>
							<Typography variant="caption">{balance}</Typography>
						</Grid>
					</Grid>
					<Grid item container justify="space-between" xs={12}>
						<Grid item xs={6} className={classes.textStart}>
							<Typography variant="caption" color="textSecondary">
								Remaining
							</Typography>
						</Grid>
						<Grid item xs={6} className={classes.textEnd}>
							<Typography variant="caption">{remaining}</Typography>
						</Grid>
					</Grid>
					<Grid item container justify="space-between" xs={12}>
						<Grid item xs={6} className={classes.textStart}>
							<Typography variant="caption" color="textSecondary">
								Redemption Value (bDIGG)
							</Typography>
						</Grid>
						<Grid item xs={6} className={classes.textEnd}>
							<Typography variant="caption">{redemptionRateBdigg}</Typography>
						</Grid>
					</Grid>
					<Grid item container justify="space-between" xs={12}>
						<Grid item xs={6} className={classes.textStart}>
							<Typography variant="caption" color="textSecondary">
								Redemption Value ($)
							</Typography>
						</Grid>
						<Grid item xs={6} className={classes.textEnd}>
							<Typography variant="caption">{redemptionRateUsd}</Typography>
						</Grid>
					</Grid>
					<Grid item container justify="center" xs={12}>
						<Box clone mt={2}>
							<Button
								disabled={disabled || loading}
								className={classes.redeemButton}
								variant="contained"
								color="primary"
								onClick={() => onRedeem(nftId)}
							>
								{loading ? <CircularProgress className={classes.spinner} size={20} /> : 'Redeem'}
							</Button>
						</Box>
					</Grid>
				</Grid>
			</Grid>
		</Paper>
	);
};

export default NftStats;
