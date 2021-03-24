import React from 'react';
import { Box, Button, Grid, makeStyles, Paper, Typography } from '@material-ui/core';

interface Props {
	name: string;
	balance: string;
	remaining: string;
	redemptionRate: string;
}

const useStyles = makeStyles((theme) => ({
	paper: {
		padding: theme.spacing(1, 3),
	},
	redeemButton: {
		color: theme.palette.common.black,
	},
	textCenter: {
		textAlign: 'center',
	},
	textEnd: {
		textAlign: 'end',
	},
}));

const NFT: React.FC<Props> = ({ name, balance, remaining, redemptionRate }) => {
	const classes = useStyles();

	return (
		<Paper elevation={0} className={classes.paper}>
			<Grid container spacing={1}>
				<Grid item xs={12}>
					<Typography className={classes.textCenter}>{name}</Typography>
				</Grid>
				<Grid item container xs={12}>
					<Grid item container justify="space-between" xs={12}>
						<Grid item xs>
							<Typography variant="caption" color="textSecondary">
								Your Balance
							</Typography>
						</Grid>
						<Grid item xs className={classes.textEnd}>
							<Typography variant="caption">{balance}</Typography>
						</Grid>
					</Grid>
					<Grid item container justify="space-between" xs={12}>
						<Grid item xs>
							<Typography variant="caption" color="textSecondary">
								Remaining
							</Typography>
						</Grid>
						<Grid item xs className={classes.textEnd}>
							<Typography variant="caption">{remaining}</Typography>
						</Grid>
					</Grid>
					<Grid item container justify="space-between" xs={12}>
						<Grid item xs>
							<Typography variant="caption" color="textSecondary">
								Redemption Rate
							</Typography>
						</Grid>
						<Grid item xs className={classes.textEnd}>
							<Typography variant="caption">{redemptionRate}</Typography>
						</Grid>
					</Grid>
					<Grid item container justify="center" xs={12}>
						<Box clone mt={2}>
							<Button className={classes.redeemButton} variant="contained" color="primary">
								Redeem All
							</Button>
						</Box>
					</Grid>
				</Grid>
			</Grid>
		</Paper>
	);
};

export default NFT;
