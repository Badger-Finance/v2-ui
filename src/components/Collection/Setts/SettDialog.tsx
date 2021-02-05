import React, { useState } from 'react';
import { VaultDeposit, VaultWithdraw, GeyserUnstake, GeyserStake } from 'components/Collection/Forms';
import { VaultSymbol } from 'components/Common/VaultSymbol';
import { Dialog, DialogTitle, Tab, Tabs, Switch, Typography } from '@material-ui/core';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const SettDialog = (props: any) => {
	const [dialogMode, setDialogMode] = useState('vault');
	const [dialogOut, setDialogOut] = useState(false);
	const { dialogProps, classes, onClose } = props;
	const { open, vault, sett } = dialogProps;

	if (!open) return <div />;

	let form = <VaultDeposit vault={vault} />;
	if (dialogMode === 'vault' && dialogOut) form = <VaultWithdraw vault={vault} />;
	else if (dialogMode == 'geyser' && !dialogOut) form = <GeyserStake vault={vault} />;
	else if (dialogMode == 'geyser' && dialogOut) form = <GeyserUnstake vault={vault} />;

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

				<VaultSymbol token={sett ? sett.asset : vault} />

				<Typography variant="body1" color="textPrimary" component="div">
					{vault.underlyingToken.name}
				</Typography>
				<Typography variant="body2" color="textSecondary" component="div">
					{vault.underlyingToken.symbol}
				</Typography>
			</DialogTitle>
			<Tabs
				variant="fullWidth"
				indicatorColor="primary"
				value={['vault', 'geyser'].indexOf(dialogMode)}
				style={{ background: 'rgba(0,0,0,.2)', marginBottom: '1rem' }}
			>
				<Tab onClick={() => setDialogMode('vault')} label={dialogOut ? 'Withdraw' : 'Deposit'}></Tab>
				{vault.geyser && (
					<Tab onClick={() => setDialogMode('geyser')} label={dialogOut ? 'Unstake' : 'Stake'}></Tab>
				)}
			</Tabs>

			{form}
		</Dialog>
	);
};

export default SettDialog;
