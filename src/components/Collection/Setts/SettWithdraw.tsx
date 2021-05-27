import React, { useContext, useState } from 'react';
import { styled, Tab, Tabs } from '@material-ui/core';

import { Sett } from 'mobx/model';
import { BadgerSett } from 'mobx/model/badger-sett';
import { StoreContext } from 'mobx/store-context';
import deploy from 'config/deployments/mainnet.json';
import { NETWORK_LIST } from 'config/constants';
import { GeyserUnstake, VaultWithdraw } from '../Forms';

type WithdrawMode = 'withdraw' | 'unstake';

interface Props {
	sett: Sett;
	badgerSett: BadgerSett;
}

const StyledTabs = styled(Tabs)({
	background: 'rgba(0,0,0,.2)',
	marginBottom: '1rem',
});

export const SettWithdraw = ({ sett, badgerSett }: Props): JSX.Element => {
	const store = useContext(StoreContext);
	const [mode, setMode] = useState<WithdrawMode>('withdraw');

	const { network } = store.wallet;
	const noStake: { [sett: string]: boolean } = {
		[deploy.sett_system.vaults['native.digg']]: true,
	};

	return (
		<>
			<StyledTabs variant="fullWidth" indicatorColor="primary" value={mode}>
				<Tab value="withdraw" label="Withdraw" onClick={() => setMode('withdraw')} />
				{!noStake[sett.vaultToken] && network.name === NETWORK_LIST.ETH && (
					<Tab value="unstake" label="Unstake" onClick={() => setMode('unstake')} />
				)}
			</StyledTabs>
			<>
				{mode === 'withdraw' && <VaultWithdraw sett={sett} badgerSett={badgerSett} />}
				{mode === 'unstake' && <GeyserUnstake sett={sett} badgerSett={badgerSett} />}
			</>
		</>
	);
};
