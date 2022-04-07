import React from 'react';
import VaultListHeader from 'components-v2/landing/VaultListHeader';
import EmptyVaultSearch from './EmptyVaultSearch';
import VaultStatusInformationPanel from '../VaultStatusInformationPanel';
import VaultRewardsInformationPanel from '../VaultRewardsInformationPanel';

export interface VaultTableProps {
	settList: JSX.Element[];
}

const VaultList = ({ settList }: VaultTableProps): JSX.Element => {
	return (
		<>
			<VaultListHeader />
			{settList.length > 0 ? settList : <EmptyVaultSearch />}
			<VaultStatusInformationPanel />
			<VaultRewardsInformationPanel />
		</>
	);
};

export default VaultList;
