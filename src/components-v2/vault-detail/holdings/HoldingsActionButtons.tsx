import React from 'react';
import { VaultActionButton } from '../../common/VaultActionButtons';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from '../../../mobx/store-context';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		padding: theme.spacing(3),
	},
	deposit: {
		marginRight: theme.spacing(1),
	},
	withdraw: {
		marginTop: theme.spacing(2),
	},
}));

interface Props {
	canDeposit: boolean;
}

export const HoldingsActionButtons = ({ canDeposit }: Props): JSX.Element => {
	const { vaultDetail } = React.useContext(StoreContext);
	const { canUserDeposit, canUserWithdraw } = vaultDetail;
	const classes = useStyles();

	return (
		<div className={classes.root}>
			{canDeposit && (
				<VaultActionButton
					fullWidth
					className={classes.deposit}
					color="primary"
					variant={canUserDeposit ? 'contained' : 'outlined'}
					disabled={!canUserDeposit}
					onClick={() => vaultDetail.toggleDepositDialog()}
				>
					Deposit
				</VaultActionButton>
			)}
			<VaultActionButton
				className={classes.withdraw}
				fullWidth
				color="primary"
				variant="outlined"
				disabled={!canUserWithdraw}
				onClick={() => vaultDetail.toggleWithdrawDialog()}
			>
				Withdraw
			</VaultActionButton>
		</div>
	);
};
