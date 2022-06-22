import VaultListHeader from 'components-v2/landing/VaultListHeader';
import React from 'react';

import VaultRewardsInformationPanel from '../VaultRewardsInformationPanel';
import VaultStatusInformationPanel from '../VaultStatusInformationPanel';
import EmptyVaultSearch from './EmptyVaultSearch';

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
