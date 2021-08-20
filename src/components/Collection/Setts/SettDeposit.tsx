import React from 'react';
import { styled, Tab, Tabs } from '@material-ui/core';
import { VaultDeposit } from '../Forms';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { Sett } from '../../../mobx/model/setts/sett';

interface Props {
	sett: Sett;
	badgerSett: BadgerSett;
}

const StyledTabs = styled(Tabs)({
	background: 'rgba(0,0,0,.2)',
	marginBottom: '1rem',
});

export const SettDeposit = ({ sett, badgerSett }: Props): JSX.Element => {
	return (
		<>
			<StyledTabs variant="fullWidth" indicatorColor="primary" value="deposit">
				<Tab value="deposit" label="Deposit" />
			</StyledTabs>
			<VaultDeposit sett={sett} badgerSett={badgerSett} />
		</>
	);
};
