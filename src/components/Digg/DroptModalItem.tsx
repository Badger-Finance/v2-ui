import { Grid, Typography, Button, makeStyles } from '@material-ui/core';
import { BigNumber } from 'ethers';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';

export interface DroptModalItemProps {
	token: string;
	balance: BigNumber;
	displayBalance: string;
	redemptionAmount: string;
	redemptionContract: string;
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
}));

const DroptModalItem = observer((props: DroptModalItemProps) => {
	const store = useContext(StoreContext);

	const classes = useStyles();
	const { token, balance, displayBalance, redemptionAmount, redemptionContract } = props;
	const { rebase } = store;

	return (
		<Grid container direction="row" alignItems="center">
			<Grid item xs={8}>
				<Grid className={classes.droptItem} container direction="column" alignItems="flex-start">
					<Typography variant="subtitle2" color="textSecondary">
						{token}
					</Typography>
					<Typography className={classes.negativeTopMargin}>{displayBalance}</Typography>
					<Typography className={classes.negativeTopMargin} variant="caption" color="textSecondary">
						({redemptionAmount} bDIGG)
					</Typography>
				</Grid>
			</Grid>
			<Grid item xs={4}>
				<Button
					variant="contained"
					size="small"
					color="primary"
					onClick={async () => await rebase.redeemDropt(redemptionContract, balance)}
				>
					Redeem
				</Button>
			</Grid>
		</Grid>
	);
});

export default DroptModalItem;
