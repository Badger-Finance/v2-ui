import React, { useEffect, useState, useContext } from 'react';
import { GeyserUnstake, VaultDeposit, VaultWithdraw } from 'components/Collection/Forms';
import { VaultSymbol } from 'components/Common/VaultSymbol';
import { Dialog, DialogTitle, Tab, Tabs, Switch, Typography, makeStyles } from '@material-ui/core';
import deploy from '../../../config/deployments/mainnet.json';
import { StoreContext } from '../../../mobx/store-context';
import { NETWORK_LIST } from '../../../config/constants';
import { Sett } from 'mobx/model';

const useStyles = makeStyles((theme) => ({
	title: {
		padding: theme.spacing(2, 2, 2),
	},
}));

export interface SettDialogProps {
	dialogProps: {
		open: boolean;
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

	const store = useContext(StoreContext);
	const { network, connectedAddress } = store.wallet;
	const classes = useStyles();

	useEffect(() => {
		const reset = async () => await setDialogMode(0);
		if (open) {
			reset();
		}
	}, [open]);
	if (!open) return <div />;

	const DialogTabs = (props: DialogTabProps): JSX.Element => {
		const { sett } = props;

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
				{/* Staking has been removed, so we removed the 'Stake' tab, but left the 'Unstake' tab so people could remove funds */}
				{!noStake[sett.vaultToken] && network.name === NETWORK_LIST.ETH && dialogOut && (
					<Tab onClick={() => setDialogMode(1)} label={'Unstake'}></Tab>
				)}
			</Tabs>
		);
	};

	const badgerSett = network.setts.find((knownSett) => knownSett.vaultToken.address === sett.vaultToken);
	if (!badgerSett) {
		return <></>;
	}

	let form: JSX.Element;
	switch (dialogMode) {
		case 0:
			if (dialogOut) {
				form = <VaultWithdraw sett={sett} badgerSett={badgerSett} />;
			} else {
				form = <VaultDeposit sett={sett} badgerSett={badgerSett} />;
			}
			break;
		case 1:
			if (dialogOut) {
				form = <GeyserUnstake sett={sett} badgerSett={badgerSett} />;
			} else {
				form = <></>;
			}
			break;
		default:
			form = <></>;
			break;
	}

	return (
		<Dialog key={'dialog'} fullWidth maxWidth={'sm'} open={open} onClose={onClose}>
			<DialogTitle disableTypography className={classes.title}>
				<div style={{ float: 'right' }}>
					{dialogOut ? 'Withdraw' : 'Deposit'}
					<Switch
						checked={!dialogOut}
						onChange={() => {
							if (dialogOut) setDialogMode(0);
							setDialogOut(!dialogOut);
						}}
						color="primary"
						disabled={!connectedAddress}
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
