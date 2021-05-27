import React, { useEffect, useState, useContext } from 'react';
import { Dialog, DialogTitle, Switch, Typography, makeStyles, Grid } from '@material-ui/core';

import { VaultSymbol } from 'components/Common/VaultSymbol';
import { StoreContext } from 'mobx/store-context';
import { Sett } from 'mobx/model';
import { SettWithdraw } from './SettWithdraw';
import { SettDeposit } from './SettDeposit';

type DialogMode = 'deposit' | 'withdraw';

const useStyles = makeStyles((theme) => ({
	title: {
		padding: theme.spacing(2, 2, 2),
	},
	modeContainer: {
		justifyContent: 'flex-end',
	},
}));

interface SettDialogProps {
	open: boolean;
	sett: Sett;
	onClose: () => void;
}

export const SettDialog = ({ open = false, sett, onClose }: SettDialogProps): JSX.Element => {
	const store = useContext(StoreContext);
	const classes = useStyles();
	const [dialogMode, setDialogMode] = useState<DialogMode>('deposit');

	const { network, connectedAddress } = store.wallet;
	const badgerSett = network.setts.find(({ vaultToken }) => vaultToken.address === sett.vaultToken);

	useEffect(() => {
		return () => {
			setDialogMode('deposit');
		};
	}, []);

	const Content = (): JSX.Element | null => {
		if (!badgerSett) return null;

		return (
			<>
				{dialogMode === 'deposit' && <SettDeposit sett={sett} badgerSett={badgerSett} />}
				{dialogMode === 'withdraw' && <SettWithdraw sett={sett} badgerSett={badgerSett} />}
			</>
		);
	};

	return (
		<Dialog key={'dialog'} fullWidth maxWidth={'sm'} open={open} onClose={onClose}>
			<DialogTitle disableTypography className={classes.title}>
				<Grid container justify="space-between">
					<Grid item container xs={8}>
						<Grid item>
							<VaultSymbol token={sett} iconName={sett.asset.toLowerCase()} />
						</Grid>
						<Grid item>
							<Typography variant="body1" color="textPrimary">
								{sett.name}
							</Typography>
							<Typography variant="body2" color="textSecondary">
								{sett.asset}
							</Typography>
						</Grid>
					</Grid>
					<Grid item container xs alignItems="center" className={classes.modeContainer}>
						<Typography>{dialogMode === 'deposit' ? 'Deposit' : 'Withdraw'}</Typography>
						<Switch
							checked={dialogMode === 'deposit'}
							onChange={() => setDialogMode(dialogMode === 'deposit' ? 'withdraw' : 'deposit')}
							color="primary"
							disabled={!connectedAddress}
						/>
					</Grid>
				</Grid>
			</DialogTitle>
			<Content />
		</Dialog>
	);
};

export default SettDialog;
