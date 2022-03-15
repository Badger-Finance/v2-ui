import React from 'react';
import VaultListHeader from 'components-v2/landing/VaultListHeader';
import EmptyVaultSearch from './EmptyVaultSearch';

export interface VaultTableProps {
	title: string;
	settList: JSX.Element[];
}

const VaultList = ({ title, settList }: VaultTableProps): JSX.Element => {
	return (
		<>
			<VaultListHeader
				title={title}
				helperText="A vault is a smart contract which hold specific tokens. It secures your crypto, while making your money work (e.g. rewards, APR...)"
			/>
			{settList.length > 0 ? settList : <EmptyVaultSearch />}
		</>
	);
};

export default VaultList;
