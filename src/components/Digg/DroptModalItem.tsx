import { Grid, Typography, Button, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import React from 'react';

export interface DroptModalItemProps {
	token: string;
	balance: string;
}

const useStyles = makeStyles((theme) => ({
	droptPaper: {
		padding: theme.spacing(2),
		marginBottom: theme.spacing(2),
		textAlign: 'center',
		minWidth: '15%',
	},
	droptItem: {
		marginBottom: theme.spacing(1),
		paddingLeft: theme.spacing(0.5),
	},
	droptTitleText: {
		marginBottom: theme.spacing(1),
	},
	negativeTopMargin: {
		marginTop: -theme.spacing(0.5),
	},
	droptModalButton: {
		marginBottom: theme.spacing(1),
	},
	modal: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	redeemContainer: {},
}));

const DroptModalItem = observer((props: DroptModalItemProps) => {
	const classes = useStyles();
	const { token, balance } = props;
	return (
		<Grid className={classes.redeemContainer} container direction="row" alignItems="center">
			<Grid item xs={8}>
				<Grid className={classes.droptItem} container direction="column" alignItems="flex-start">
					<Typography variant="subtitle2" color="textSecondary">
						{token}
					</Typography>
					<Typography className={classes.negativeTopMargin}>{balance}</Typography>
					<Typography className={classes.negativeTopMargin} variant="caption" color="textSecondary">
						(0.0002 bDIGG)
					</Typography>
				</Grid>
			</Grid>
			<Grid item xs={4}>
				<Button variant="contained" size="small" color="primary">
					Redeem
				</Button>
			</Grid>
		</Grid>
	);
});

export default DroptModalItem;
