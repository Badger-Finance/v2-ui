import React, { useState } from 'react';
import { VaultDeposit, VaultWithdraw, GeyserUnstake, GeyserStake } from 'components/Collection/Forms';
import { VaultSymbol } from 'components/Common/VaultSymbol';
import { Dialog, DialogTitle, Tab, Tabs, Switch, Typography } from '@material-ui/core';
import deploy from '../../../config/deployments/mainnet.json';
import BigNumber from "bignumber.js";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const SettDialog = (props: any) => {
	const [dialogMode, setDialogMode] = useState(0);
	const [dialogOut, setDialogOut] = useState(false);
	const { dialogProps, classes, onClose } = props;
	const { open, sett } = dialogProps;
	let { vault } = dialogProps;

	if (!open) return <div />;

	if (!vault) { // user wallet not connected - populate zero data
		vault = {
			underlyingToken: {
				balance: new BigNumber(0),
				decimals: 1, // decimals do not matter - dividend is 0
			}
		};
	}

	const diggSett = deploy.sett_system.vaults['native.digg'].toLowerCase();
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
				<VaultSymbol token={sett.asset} />
				<Typography variant="body1" color="textPrimary" component="div">
					{sett.title}
				</Typography>
				<Typography variant="body2" color="textSecondary" component="div">
					{sett.symbol}
				</Typography>
			</DialogTitle>
			<Tabs
				variant="fullWidth"
				indicatorColor="primary"
				value={dialogMode}
				style={{ background: 'rgba(0,0,0,.2)', marginBottom: '1rem' }}
			>
				<Tab onClick={() => setDialogMode(0)} label={dialogOut ? 'Withdraw' : 'Deposit'}></Tab>
				{sett.address !== diggSett && (
					<Tab onClick={() => setDialogMode(1)} label={dialogOut ? 'Unstake' : 'Stake'}></Tab>
				)}
			</Tabs>
			{form}
		</Dialog>
	);
};

export default SettDialog;
