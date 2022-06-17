import { VaultDTO } from '@badger-dao/sdk';
import { Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { VaultActionButton } from '../../common/VaultActionButtons';
import DepositInfo from './DepositInfo';

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(4),
	},
	description: {
		marginTop: theme.spacing(1),
	},
	depositContainer: {
		display: 'flex',
		alignItems: 'center',
		[theme.breakpoints.up('sm')]: {
			paddingLeft: theme.spacing(4),
		},
		[theme.breakpoints.down('xs')]: {
			marginTop: theme.spacing(2),
			justifyContent: 'center',
		},
	},
}));

interface Props {
	vault: VaultDTO;
}

export const NoHoldings = observer(({ vault }: Props): JSX.Element | null => {
	const store = React.useContext(StoreContext);
	const { network: networkStore, vaultDetail, user } = store;
	const { network } = networkStore;
	const classes = useStyles();

	if (!user.onGuestList(vault)) {
		return null;
	}

	const strategy = network.strategies[vault.vaultToken];
	return (
		<Grid container className={classes.root} component={Paper}>
			<Grid item xs={12} sm={8}>
				<Typography variant="body1">{`You have no ${vault.name} in your connected wallet.`}</Typography>
				<DepositInfo strategy={strategy} />
			</Grid>
			<Grid item xs={12} sm className={classes.depositContainer}>
				<VaultActionButton
					color="primary"
					variant="contained"
					fullWidth
					onClick={() => vaultDetail.toggleDepositDialog()}
				>
					Deposit
				</VaultActionButton>
			</Grid>
		</Grid>
	);
});
