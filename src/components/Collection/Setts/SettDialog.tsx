import React, { useEffect, useState, useContext } from 'react';
import { VaultDeposit, VaultWithdraw, GeyserUnstake, GeyserStake } from 'components/Collection/Forms';
import { VaultSymbol } from 'components/Common/VaultSymbol';
import { Dialog, DialogTitle, Tab, Tabs, Switch, Typography, makeStyles } from '@material-ui/core';
import deploy from '../../../config/deployments/mainnet.json';
import { StoreContext } from '../../../mobx/store-context';
import SettAbi from 'config/system/abis/SushiSett.json';
import { NETWORK_LIST } from '../../../config/constants';
import { Sett, Token, Vault } from 'mobx/model';

const useStyles = makeStyles((theme) => ({
	title: {
		padding: theme.spacing(2, 2, 2),
	},
}));

export interface SettDialogProps {
	dialogProps: {
		open: boolean;
		vault: Vault;
		sett: Sett;
	};
	onClose: () => void;
}

interface DialogTabProps {
	sett: Sett;
}

const SettDialog = (props: SettDialogProps): JSX.Element => {
	const [dialogMode, setDialogMode] = useState(0);
	const [dialogOut, setDialogOut] = useState(false);
	const { dialogProps, onClose } = props;
	const { open, sett } = dialogProps;
	let { vault } = dialogProps;
	const store = useContext(StoreContext);
	const { network } = store.wallet;
	const { contracts } = store;
	const classes = useStyles();

	useEffect(() => {
		const reset = async () => await setDialogMode(0);
		if (open) {
			reset();
		}
	}, [open]);
	if (!open) return <div />;

	/**
	 * TODO: Revist the general structure of downstream data consumption
	 * This structure is a bit recursive
	 */
	if (!vault) {
		// user wallet not connected - populate zero data
		console.log('vault not found: ', vault);
		vault = contracts.getOrCreateVault('', new Token(store, '', 18), SettAbi.abi);
	}

	const DialogTabs = (props: DialogTabProps): JSX.Element => {
		const { sett } = props;

		// ETH still has staking - below is a list of setts that do not
		// require it but are on ETH.  We do not want to show the Stake
		// or Unstake tabs.
		const noStake: { [sett: string]: boolean } = {
			[deploy.sett_system.vaults['native.digg']]: true,
		};
		return (
			<Tabs
				variant="fullWidth"
				indicatorColor="primary"
				value={dialogMode}
				style={{ background: 'rgba(0,0,0,.2)', marginBottom: '1rem' }}
			>
				<Tab onClick={() => setDialogMode(0)} label={dialogOut ? 'Withdraw' : 'Deposit'}></Tab>
				{!noStake[sett.vaultToken] && network.name === NETWORK_LIST.ETH && (
					<Tab onClick={() => setDialogMode(1)} label={dialogOut ? 'Unstake' : 'Stake'}></Tab>
				)}
			</Tabs>
		);
	};

	let form = <VaultDeposit vault={vault} />;
	// TODO: DialogMode should take integer indexes, may be worth enumerating - maybe not
	if (dialogMode === 0 && dialogOut) form = <VaultWithdraw vault={vault} />;
	else if (dialogMode == 1 && !dialogOut) form = <GeyserStake vault={vault} />;
	else if (dialogMode == 1 && dialogOut) form = <GeyserUnstake vault={vault} />;

	return (
		<Dialog key={'dialog'} fullWidth maxWidth={'sm'} open={open} onClose={onClose}>
			<DialogTitle disableTypography className={classes.title}>
				<div style={{ float: 'right' }}>
					{dialogOut ? 'Withdraw' : 'Deposit'}
					<Switch
						checked={!dialogOut}
						onChange={() => {
							setDialogOut(!dialogOut);
						}}
						color="primary"
					/>
				</div>
				<VaultSymbol token={sett} iconName={sett.asset.toLowerCase()} />
				<Typography variant="body1" color="textPrimary" component="div">
					{sett.name}
				</Typography>
				<Typography variant="body2" color="textSecondary" component="div">
					{sett.asset}
				</Typography>
			</DialogTitle>
			<DialogTabs sett={sett} />
			{form}
		</Dialog>
	);
};

export default SettDialog;
