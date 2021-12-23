import React from 'react';
import { Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SettActionButton } from '../../common/SettActionButtons';
import { BadgerSett } from '../../../mobx/model/vaults/badger-sett';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import DepositInfo from './DepositInfo';
import { Vault } from '@badger-dao/sdk';

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
	sett: Vault;
	badgerSett: BadgerSett;
}

export const NoHoldings = observer(({ sett, badgerSett }: Props): JSX.Element | null => {
	const store = React.useContext(StoreContext);
	const { network: networkStore, settDetail, user } = store;
	const { network } = networkStore;
	const classes = useStyles();

	const strategy = network.strategies[badgerSett.vaultToken.address];
	if (!user.onGuestList(sett)) {
		return null;
	}

	return (
		<Grid container className={classes.root} component={Paper}>
			<Grid item xs={12} sm={8}>
				<Typography variant="body1">{`You have no ${sett.name} in your connected wallet.`}</Typography>
				<DepositInfo strategy={strategy} />
			</Grid>
			<Grid item xs={12} sm className={classes.depositContainer}>
				<SettActionButton
					color="primary"
					variant="contained"
					fullWidth
					onClick={() => settDetail.toggleDepositDialog()}
				>
					Deposit
				</SettActionButton>
			</Grid>
		</Grid>
	);
});
