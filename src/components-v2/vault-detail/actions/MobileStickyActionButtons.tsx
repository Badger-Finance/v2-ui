import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { VaultActionButton } from '../../common/VaultActionButtons';
import { StoreContext } from '../../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
	root: {
		position: 'absolute',
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
	const { vaultDetail } = React.useContext(StoreContext);
	const { canUserDeposit, canUserWithdraw } = vaultDetail;

	return (
		<div className={classes.root}>
			<Grid container spacing={1}>
				<Grid item xs>
					<VaultActionButton
						fullWidth
						color="primary"
						variant={canUserDeposit ? 'contained' : 'outlined'}
						disabled={!canUserDeposit}
						onClick={() => vaultDetail.toggleDepositDialog()}
					>
						Deposit
					</VaultActionButton>
				</Grid>
				<Grid item xs>
					<VaultActionButton
						color="primary"
						variant="outlined"
						fullWidth
						disabled={!canUserWithdraw}
						onClick={() => vaultDetail.toggleWithdrawDialog()}
					>
						Withdraw
					</VaultActionButton>
				</Grid>
			</Grid>
		</div>
	);
};
