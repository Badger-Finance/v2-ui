import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SettActionButton } from '../../common/SettActionButtons';
import { StoreContext } from '../../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
	root: {
		position: 'sticky',
		bottom: 0,
		backgroundColor: '#181818',
		padding: theme.spacing(2),
		width: '100%',
		zIndex: 999,
		[theme.breakpoints.up('sm')]: {
			display: 'none',
		},
	},
}));

export const MobileStickyActionButtons = (): JSX.Element => {
	const classes = useStyles();
	const { settDetail } = React.useContext(StoreContext);
	const { canUserDeposit, canUserWithdraw } = settDetail;

	return (
		<div className={classes.root}>
			<Grid container spacing={1}>
				<Grid item xs>
					<SettActionButton
						fullWidth
						color="primary"
						variant={canUserDeposit ? 'outlined' : 'contained'}
						disabled={!canUserDeposit}
						onClick={() => settDetail.toggleDepositDialog()}
					>
						Deposit
					</SettActionButton>
				</Grid>
				<Grid item xs>
					<SettActionButton
						color="primary"
						variant="outlined"
						fullWidth
						disabled={!canUserWithdraw}
						onClick={() => settDetail.toggleWithdrawDialog()}
					>
						Withdraw
					</SettActionButton>
				</Grid>
			</Grid>
		</div>
	);
};
