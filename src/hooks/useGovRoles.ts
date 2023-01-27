import { Network } from '@badger-dao/sdk';
import { StoreContext } from 'mobx/stores/store-context';
import { useContext, useEffect, useState } from 'react';

export default function useGovRoles() {
  const [hasProposalRole, setHasProposalRole] = useState(false);
  const [hasVetoRole, setHasVetoRole] = useState(false);
  const [hasUnVetoRole, setHasUnVetoRole] = useState(false);

  const store = useContext(StoreContext);

  useEffect(() => {
    async function getProposeRole() {
      const hasRole = await store.user.hasProposalRole();
      setHasProposalRole(hasRole);
    }
    async function getVetoRole() {
      const hasRole = await store.user.hasVetoRole();
      setHasVetoRole(hasRole);
    }
    async function getUnVetoRole() {
      const hasRole = await store.user.hasUnVetoRole();
      setHasUnVetoRole(hasRole);
    }
    if (store.chain.network === Network.Arbitrum && store.user.accountDetails?.address) {
      getProposeRole();
      getVetoRole();
      getUnVetoRole();
    } else {
      setHasProposalRole(false);
      setHasVetoRole(false);
      setHasUnVetoRole(false);
    }
  }, [store.chain.network, store.user.accountDetails?.address]);

  return { hasProposalRole, hasVetoRole, hasUnVetoRole };
}
